/* DHTML Color Sphere : v1.0.2 : 2008/04/17 */
/* http://www.colorjack.com/software/dhtml+color+sphere.html */

// Returns object named
function get_element(object_name) {
  return document.getElementById(object_name);
}

// Returns style of object
function get_style(obj) {
  if(obj) return(get_element(obj).style);
}

// Returns absolute screen position
function abPos(element) {
  var element=(typeof(element)=='object' ? element : get_element(element));
  var z={X:0,Y:0};
// Recursively find distance from element to top-left corner
  while(element!=null) { z.X+=element.offsetLeft; z.Y+=element.offsetTop; element=element.offsetParent; };
  return(z);
}

// Returns 0 if string is not in 'userAgent' string
function agent(string) {
  return(Math.max(navigator.userAgent.toLowerCase().indexOf(string),0));
}

function isset(v) {
  return((typeof(v)=='undefined' || v.length==0) ? false : true);
}

// Returns X and Y coords of mouse event  ???
function XY(event) {
  var coords = {'X':event.pageX, 'Y':event.pageY};
  return coords;
}

// Returns n if n is a number, 0 otherwise
function zero(n) {
  return(!isNaN(n=parseFloat(n)) ? n : 0);
}


// Maps touch events to mouse events
function touchHandler(event)
{
    var touches = event.changedTouches,
        first = touches[0],
        type = "";
    switch(event.type)
    {
        case "touchstart": type = "mousedown"; break;
        case "touchmove":  type = "mousemove"; break;
        case "touchend":   type = "mouseup";   break;
        default:           return;
    }

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1,
                                  first.screenX, first.screenY,
                                  first.clientX, first.clientY, false,
                                  false, false, false, 0, null);

    first.target.dispatchEvent(simulatedEvent);

}
function touchinit()
{
    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);
}
touchinit();
