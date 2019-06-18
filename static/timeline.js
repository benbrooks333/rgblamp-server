/*  Functions for color patterns  */
TLine = {}; //Timeline
TLine.num_steps = 0
TLine.repeat = true;

// Builds a timeline element (color marker or transition)
function make_div(step_number, class_name) { // 'type' is either 'color_marker' or 'transition'
  let div = document.createElement('div'), transition = document.createElement('div');
  div.setAttribute('id', class_name+step_number);
  div.setAttribute('class', class_name);
  div.setAttribute('onclick', 'select(this)');
  div.innerHTML = '<div style="background-color:#fff">'+step_number+'</div>';
  return div;
}

// Adds either a color_marker/transition set or just a color_marker
function add(oneortwo) {
  TLine.num_steps = TLine.num_steps + 1;
  if (TLine.selected) {TLine.selected.style.border = '';}//5px solid #dddddd80';} //deselect selection
  let timeline = get_element('timeline');

  let color_marker = make_div(TLine.num_steps, 'color_marker')
  let transition = make_div(TLine.repeat?TLine.num_steps:TLine.num_steps-1, 'transition')

  if (oneortwo == 1) { // Should happen only when toggle_repeat() is called
    timeline.appendChild(color_marker);
  } else if (oneortwo == 2) {
    if (TLine.repeat) { // End with a transition if pattern is set to repeat
      timeline.appendChild(color_marker);
      timeline.appendChild(transition);
    } else {            // End with a color marker if the pattern won't repeat
      timeline.appendChild(transition);
      timeline.appendChild(color_marker);
    }
  }
  select(document.getElementById("color_marker"+TLine.num_steps));
  redraw_gradients();
}

// Removes either a color_marker/transition set or just a color_marker
function remove(oneortwo) {
  let timeline = document.getElementById('timeline');
  if (timeline.children.length > 0) {timeline.lastChild.remove();}

  if (oneortwo == 2 && timeline.children.length > 0) {timeline.lastChild.remove();}
  if (TLine.num_steps > 0) {TLine.num_steps--};
}

function select(element){
  if (TLine.selected) {TLine.selected.style.border = '';}//5px solid #dddddd80';}
  TLine.selected = element;
  TLine.selected.style.border = '5px solid #fff';
  if (element.classList.contains('transition')) {transition_popup(element)}
}

function toggle_repeat() {
  TLine.repeat = !TLine.repeat;
  if (TLine.repeat) {
    document.getElementById('repeat').style.background = '#0d0'; // green
    document.getElementById('norepeat').style.display = 'none'
    remove(1);
  } else {
    document.getElementById('repeat').style.background = '#d00'; // red
    document.getElementById('norepeat').style.display = '';
    add(1);
  }
}

function go() {
  alert('going!');
}

function transition_popup(element) {
  position = abPos(element);
  popup = document.getElementById('transition_popup');
  curve_container = document.getElementById('curve_container');
  popup.style.display = '';
}

function update_time(slider) {
  let value = slider.value;

  if (slider.classList.contains('main_slider')) { // Main slider
    let percent = (value - slider.min) / (slider.max - slider.min);
    let sub_slider = document.getElementById('sub_slider');
    //sub_slider.value = Math.round((sub_slider.max+sub_slider.min)/2); // Reset to middle
    sub_slider.value = 0;
    sub_slider.style.left = percent * slider.offsetWidth * (203/208); // 203/208 is specific scaling factor. change if needed
  }
  else if (slider.classList.contains('sub_slider')) { // Precise (sub) slider
    let main_slider = document.getElementById('main_slider');
    value = Number(main_slider.value) + Number(value/(slider.max/5)); // +/- 10
  }

  let logvalue = logmap(value);
  logvalue = format_time(logvalue);
  document.getElementById('transition_time').innerText = logvalue;
}

function bezier(element, event) {
  
}

// Logarithmically maps 1 <= x <= num_points to min <= out <= max
function logmap(x, min=0.2, max=3600, num_points=1000){
  if (x > num_points) {return max;} else if (x < 1) {return min;}

  let inc = Math.log10(max/min) / num_points; // Equals log-increment for given range
  return Math.pow(10, x*inc) * min;
}

// Nicely formats times (in seconds) for values of milliseconds to one hour
function format_time(t) {
  let str='';
  if (t < 1) {str = Math.round(t*1000)+'ms, ('+Math.round(10/t)/10+' per second)'}
  else if (t < 10) {str = Math.round(t*100)/100+'s'}
  else if (t < 60) {str = Math.round(t*10)/10+'s'}
  else if (t < 3600) {str = Math.floor(t/60)+'min '+Math.round(t%60)+'s'}
  else {str = Math.floor(t/3600)+'hour '+Math.round((t%3600)/60)+'min'}
  return str;
}
