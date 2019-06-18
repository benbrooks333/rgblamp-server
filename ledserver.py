#!/usr/bin/python3
import web
import os
import time

#import led
from led import lights
led = lights("pigpio")  # Specify gpio method. "pigpio" or "RPi.GPIO"
led.add_event_detect()  # Add button press detection

form = web.form
render_templates = web.template.render('templates/')
render_static = web.template.render('static/')

urls = (
    "/", "main",
    "/images/(.*)", "images",
    "/static/(.*)", "static"
)

"""
rgbform = form.Form(

    form.Textbox("red",
        id="redbox",
        value="90"
    ),
    form.Textbox("green",
        id="greenbox",
        value="255"
    ),
    form.Textbox("blue",
        id="bluebox",
        value="60"
    ),
    form.Button("submit")
)
"""

class Invalid_Data(Exception):
    def __init__(self, msg):
        self.msg = msg
    def __str__(self):
        return self.msg


def parse_post(form):

    # Check if sample rate is given (light updates per second) default to 15
    if "sample_rate" in form:
        try:
            led.sample_rate = float(form["sample_rate"])
        except:
            led.sample_rate = 15
        else:
            led.sample_rate = 15

# Run led.stop() if stop signal is given and "stop" is "true"
    if "stop" in form:
        if form["stop"] == "true":
            led.stop()
            return None, "Stopped"

# If form contains "single", expect r, g, and b values
    if "single" in form:
        rgbs = [form["r"], form["g"], form["b"]]
        rgbs = list(map(float, rgbs))
        rgbs = list(map(round, rgbs))
        # Return a list inside a list so that len(steps) is 1 instead of 3
        return [rgbs], "Setting Color {0}".format(rgbs)

    else:
# Pulls each array from the POST dictionary, then splits into sets
        infos = ["rgbs", "times", "transitions"]
        rgbs, times, transitions = [form[data].split(",,") for data in infos]
# rgbs are further separated by comma
        rgbs = [rgb.split(',') for rgb in rgbs]

#Validate form
        try:
            rgbs, times, transitions = validate_post(rgbs, times, transitions)

        except (ValueError, Invalid_Data) as e:
            servermsg = "ERROR<br>{0}".format(e.msg)
            return None, servermsg

        else:
            steps = list(zip(rgbs, times, transitions))
            servermsg = "No errors"
            return steps, servermsg


def validate_post(rgbs, times, transitions):
# Check to make sure we have equal numbers of
#   instructions for color, time and transition
    if (len(rgbs) == len(times) == len(transitions)):
        pass
    else:
        raise Invalid_Data("Instruction length error")

# Check to make sure the transition type is recognized
    valid_transitions = led.transition_list
    for transition in transitions:
        if (transition not in valid_transitions):
            raise Invalid_Data("Transition name error")

# Check to make sure all rgb values are int and time values are float
#   Will raise error if not
    rgbs = [list(map(int, set)) for set in rgbs]
    times = list(map(float, times))

# Make sure all times are non-negative (or exactly -1 for stopcode), and all rgb values are 0<VALUE<255
    times_valid = all(time >= 0 or time == -1 for time in times)
    rgbs_valid = all(255 >= value >= 0 for rgb in rgbs for value in rgb)
    if not times_valid:
        raise Invalid_Data("Negative time value given")
    if not rgbs_valid:
        raise Invalid_Data("Color value out of bounds. \
Value must be between 0 and 255, inclusive")

# Make sure each list in the 'rgbs' list has exactly 3 elements (RGB)
    rgbs_3_each = all(len(rgb) == 3 for rgb in rgbs)
    if not rgbs_3_each:
        raise Invalid_Data("Each RGB value needs exactly 3 numbers (duh)")

    return rgbs, times, transitions


# To serve images in /images/ dir
class images:
    def GET(self,name):
# Extract file extension
        ext = name.split(".")[-1]

        cType = {
            "png":"images/png",
            "jpg":"images/jpeg",
            "gif":"images/gif",
            "ico":"images/x-icon"
            }

        if name in os.listdir('images'):                # Security
            web.header("Content-Type", cType[ext])      # Set the Header
            return open('images/%s'%name,"rb").read()
        else:
            raise web.notfound()

class static:
    def GET(self):
        return render_static.index()

class main:#   instructions for color, time and transition

    def GET(self):
        #rgb = rgbform()
        return render_templates.index()#rgb)

    def POST(self):
        form = web.input()
        #print(form)
        steps, servermsg = parse_post(form)

        if (steps is None):
            #print("none")
            pass

        elif (len(steps) == 1):                         #Set single color
            #print("setting one color")
            if not led.stop_event.is_set(): led.stop_event.set()
            led.set(steps[0])

        elif (len(steps) > 1):                          #Run color pattern
            #print("running pattern")
            led.stop()
            #time.sleep(0.2)
            led.threadit(steps)

        return servermsg

if __name__ == "__main__":
    os.environ["PORT"] = "9000"
    app = web.application(urls, globals())
    led.blink(num_blinks = 3)
    app.run()
