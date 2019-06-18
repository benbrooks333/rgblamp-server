import numpy as np


# List to map (logarithmically)
# raw power values to perceived intensity values
use_logmap = False
loglist = [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 10, 10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12, 13, 13, 13, 13, 14, 14, 14, 15, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 19, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 28, 28, 29, 29, 30, 31, 31, 32, 33, 34, 34, 35, 36, 37, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 57, 58, 59, 60, 62, 63, 65, 66, 67, 69, 70, 72, 74, 75, 77, 79, 80, 82, 84, 86, 88, 89, 91, 93, 96, 98, 100, 102, 104, 107, 109, 111, 114, 116, 119, 121, 124, 127, 130, 133, 135, 138, 141, 145, 148, 151, 154, 158, 161, 165, 168, 172, 176, 180, 184, 188, 192, 196, 201, 205, 210, 214, 219, 224, 229, 234, 239, 244, 249, 255]
pi = np.pi



def logmap(num):
# Function to map intensity values to log-intensity
    num = int(round(num))
    return loglist[num]

def map_floats(colors):
# Round each float in colors and convert to int
# Reminder that colors is of form: [ [R1, G1, B1], [R2, G2, B2], ... ]
    colors = [list(map(round, rgb)) for rgb in colors]
    #print("before map: {0}".format(colors))
    if use_logmap:
        colors = [list(map(logmap, rgb)) for rgb in colors]

    #print("after map: {0}".format(colors))
    return colors

# Figure out how to transition between two different colors
def make_path(rgb0, rgb1, step_time, transition, sample_rate):
    rgb0 = np.array(rgb0)
    rgb1 = np.array(rgb1)
    num_ticks = int(sample_rate * step_time)
    if (step_time == -1): transition = "none"   # End pattern playback

    print("\ntransition: {0}   step time: {1}\nrgb0: {2}    rgb1: {3}\n".format(transition, step_time, rgb0, rgb1))

    if (transition == "linear"):
# Generate path for each color,
# then combine (zip) so that each entry is a RGB code
        colors = [np.linspace(rgb0[x], rgb1[x], num_ticks) for x in range(3)]
        colors = list(zip(colors[0], colors[1], colors[2]))
        dwell_times = list(np.ones(num_ticks) / sample_rate)

    elif (transition == "sine"):
        vector = rgb1 - rgb0
        path = np.linspace(-pi/2, pi/2, num_ticks)
        color_change = (np.sin(path) + 1) / 2
        # Necessary for numpy broadcasting
        color_change = color_change.reshape(num_ticks, 1)
        colors = rgb0 + vector * color_change
        colors = list(map(list, colors))    # Convert to list of lists
        dwell_times = list(np.ones(num_ticks) / sample_rate)

    elif (transition == "abrupt"):
        colors = [list(rgb0)]
        dwell_times = [step_time]

    elif (transition == "none"):
        colors = [list(rgb0)]
        dwell_times = [-1]

    colors = map_floats(colors)

    return colors, dwell_times


def setup_run(steps, sample_rate):
# Plan the whole run between all colors given
    #base_color = self.read()
    color_list = []
    dwell_time_list = []
    num_steps = len(steps)

# Loop over all steps, then repeat
# steps is a list of form: [[step1], [step2]]
# and each step is of form:
#       [[R, G, B (initial)], [step time], [transition type]]
    for step_num in range(num_steps):

        rgb0, step_time, transition = steps[step_num]
# At end of sequence, set next color to starting color, completing the loop
        if (step_num + 1 == num_steps):
            rgb1 = steps[0][0]
        else:
            rgb1 = steps[step_num + 1][0]

        colors, dwell_times = make_path(rgb0, rgb1, step_time, transition, sample_rate)

        color_list += (colors)
        dwell_time_list += (dwell_times)

    #print("color_list\n{0}\n\ndwell_time_list\n{1}".format(color_list, dwell_time_list))

    return color_list, dwell_time_list
