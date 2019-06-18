import RPi.GPIO as GPIO
import pigpio
import time
import os
import threading
import atexit

from make_path import make_path, setup_run


class lights():

    def __init__(self, gpio_method = "pigpio", sample_rate=15):

        self.gpio_method = gpio_method
        self.sample_rate = sample_rate
        self.stop_event = threading.Event()
        self.transition_list = ["none", "linear", "sine", "abrupt"]
        self.pinlist = [17, 27, 22]         # PWM pins for RGB

        self.stored_color = [60, 255, 90]   # Default color for toggle
        self.restart_color = [150, 150, 0]  # colors for shutdown / restart
        self.shutdown_color = [200, 0, 0]

        self.button_pin = 3
        GPIO.setmode(GPIO.BCM)              # RPi.GPIO setup
        GPIO.setup(self.button_pin, GPIO.IN)


        if gpio_method == "pigpio":
            self.pi = pigpio.pi()
            for pin in self.pinlist: self.pi.set_PWM_range(pin, 255)

        elif gpio_method == "RPi.GPIO":
            for pin in self.pinlist: GPIO.setup(pin, GPIO.OUT)
            self.gpio_channel_list = [GPIO.PWM(pin, 400) for pin in self.pinlist] #400Hz PWM
            for channel in self.gpio_channel_list: channel.start(0)

        else:
            print("{0}: No GPIO method available. Quitting.".format(__name__))
            quit()


    def read(self):
        # !!!! Don't forget to scale from 255 to 100 for RPi.GPIO !!!
# Read current PWM dutycyle levels (RGB color) and return it
        if self.gpio_method == "pigpio":
            color = [self.pi.get_PWM_dutycycle(pin) for pin in self.pinlist]

        elif self.gpio_method == "RPi.GPIO":
            color=[0, 0, 0]

        return color


    def set(self, RGB):
        # !!!! Don't forget to scale from 255 to 100 for RPi.GPIO !!!
# Input a [R, G, B] list and set PWM levels to it
        #print("Setting: {0}".format(RGB))
        if self.gpio_method == "pigpio":
            for color_value, pin in enumerate(self.pinlist):
                self.pi.set_PWM_dutycycle(pin, RGB[color_value])

        elif self.gpio_method == "RPi.GPIO":
            for color_value, color in enumerate(self.gpio_channel_list):
                color.ChangeDutyCycle(RGB[color_value])


    def blink(self, num_blinks=2):
        for x in range(2*num_blinks):
            self.toggle()
            time.sleep(0.1)


    def toggle(self):
        current_color = self.read()
        if (current_color == [0, 0, 0]): self.set(self.stored_color)
        else:
            self.stored_color = self.read()
            self.set([0, 0, 0])


    def run(self, *args):
        # !!!! Don't forget to scale from 255 to 100 for RPi.GPIO !!!
        self.stop_event = threading.Event()
        base_color = self.read()
        #print("\nBASE_COLOR: {0}".format(base_color))
# Thread breaks up our 'steps' list into an argument for each item in list
#   Not sure why, but the following line un-does that
        steps = [arg for arg in args]
        color_list, dwell_time_list = setup_run(steps, self.sample_rate)

        try:
            while not self.stop_event.is_set():
            # Run until self.stop() is called and self.runcode is False
                for tick in range(len(color_list)):
                    self.set(color_list[tick])
# Setting step time to -1 means stop the pattern (set color and quit)
# Time can be set to -1 directly, or by using transition: "none"
                    if dwell_time_list[tick] == -1:
                        base_color = color_list[tick]
                        self.stop()
                    else:
                        self.stop_event.wait(dwell_time_list[tick])

                    if self.stop_event.is_set(): break

        except KeyboardInterrupt:
            pass

        finally:
            #print("\nSETTING BASE COLOR: {0}\n".format(base_color))
            self.set(base_color)


    def stop(self):
        #print("\nSTOPPING THREAD\n")
        #self.runcode = False
        self.stop_event.set()


    def stopped(self):
        return self.stop_event.is_set()


    def threadit(self, steps):
        thread = threading.Thread(target=self.run, args=(steps))
        thread.start()


    def button_press(self, pin):

        time.sleep(0.0001)

        if not GPIO.input(pin):                         #If button is held down
            start = time.time()
            self.stop()

            while not GPIO.input(pin):                  #While button is held down
                time.sleep(0.1)                         #Run 10 times / s, instead of continuously
                duration = time.time()-start            #Amount of time button has been beld

                if (duration > 3):                      #If button is held more than 'x' seconds
                    self.set(self.shutdown_color)            #Change lights to indicate imminent shutdown
                    time.sleep(0.5)                       #Prevents set_color() from running 10 times / s

                elif (duration > 2):
                    self.set(self.restart_color)             #Change lights to indicate imminent restart
                    time.sleep(0.5)                       #Prevents set_color() from running 10 times / s

            if (duration > 3):                          #while loop has exited. Time to take an action
                self.blink()
                os.system("sudo shutdown -h now")       #Blink light and shutdown
                #print("shutdown")

            elif (duration > 1):
                self.blink()
                os.system("sudo shutdown -r now")       #Blink light and restart
                #print("restart")

            elif (duration > 0):
                self.toggle()

    def add_event_detect(self):
        #Add GPIO button-press listener
        GPIO.remove_event_detect(self.button_pin)
        GPIO.add_event_detect(self.button_pin, GPIO.FALLING, callback = self.button_press, bouncetime = 50)

@atexit.register
def cleanup():
    print("\nCleaning up\n")
    GPIO.cleanup()

if (__name__ == "__main__"):
    pass
