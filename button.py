#!/usr/bin/python3

import RPi.GPIO as GPIO
import time
import os
import pigpio

pi = pigpio.pi()                                    #pigpio setup

pin = 5                                             #RPi.GPIO setup
GPIO.setmode(GPIO.BOARD)
GPIO.setup(pin, GPIO.IN) #, pull_up_down = GPIO.PUD_UP)

#Color lists are [R, G, B], where each value ranges from 0-255
restart_color = [100, 100, 0]                       #Color to indicate restart (yellow)
shutdown_color = [100, 0, 0]                        #Color to indicate shutdown (red)
pinlist = [17, 27, 22]                              #List of pins for [R, G, B] respectively

"""
class light:
    def __init__(self):
        self.stored_color = [90, 255, 60]
        self.set_color(self.stored_color)           #Stored color for light.toggle() function

    def toggle(self):
        current_color = light.read_color()
        if (current_color == [0, 0, 0]):
            light.set_color(light.stored_color)
        else:
            light.stored_color = light.read_color()
            light.set_color([0, 0, 0])

    def read_color(self):                           #Read current PWM dutycyle levels (RGB color) and return it
        color = [pi.get_PWM_dutycycle(pin_num) for pin_num in pinlist]
#        color = [pi.get_PWM_dutycycle(17), pi.get_PWM_dutycycle(27), pi.get_PWM_dutycycle(22)]
        return color

    def set_color(self, RGB):                       #Input a [R, G, B] list and set PWM levels to it
        #Sets R, G, and B pins to values from RGB
        for color in [0, 1, 2]: pi.set_PWM_dutycycle(pinlist[color], RGB[color])

    def blink(self):                                #Blinks the light twice
        for x in range(4):
            light.toggle()
            time.sleep(0.1)

light=light()                                       #Initialize 'light' class

"""


def button_press(pin):
    time.sleep(0.0001)
    if not GPIO.input(pin):                         #If button is held down
        start = time.time()
        while not GPIO.input(pin):                  #While button is held down
            time.sleep(0.1)                         #Run 10 times / s, instead of continuously
            duration = time.time()-start            #Amount of time button has been beld

            if (duration > 3):                      #If button is held more than 'x' seconds
                light.set_color(shutdown_color)     #Change lights to indicate imminent shutdown
                time.sleep(1)                       #Prevents set_color() from running 10 times / s

            elif (duration > 2):
                light.set_color(restart_color)      #Change lights to indicate imminent restart
                time.sleep(1)                       #Prevents set_color() from running 10 times / s

        if (duration > 3):                          #while loop has exited. Time to take an action
            light.blink()
            os.system("sudo shutdown -h now")       #Blink light and shutdown
            #print("shutdown")

        elif (duration > 1):
            light.blink()
            os.system("sudo shutdown -r now")       #Blink light and restart
            #print("restart")

        elif (duration > 0):
            light.toggle()


#Add GPIO button-press listener
GPIO.add_event_detect(pin, GPIO.FALLING, callback = button_press, bouncetime = 50)

if __name__ == "__main__":
    try:
        while True:
            time.sleep(99999999)
    except KeyboardInterrupt:
        pass

    GPIO.cleanup()
