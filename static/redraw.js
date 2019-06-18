function redraw() {
  let box_ratio = 95; // Percent size of color wheel div
  let dims = viewportSize();
  let vh = dims.height * 0.01, vw = dims.width * 0.01,
      vmin = Math.min(dims.height, dims.width) * 0.01,
      vmax = Math.max(dims.height, dims.width) * 0.01;
  let mini = document.getElementById('mini');
  let timeline_container = document.getElementById('timeline_container');
  let show_color = document.getElementById('show_color');
  let aspect_ratio = (vw+0.15) / vh; //0.15 accounts for 15px scrollbar
  let mini_dims = box_ratio * vmin;

  if (Math.abs(aspect_ratio-1) < 0.1) {mini_dims = Math.min(box_ratio, 90)*vmin;} // Shrink color picker on square screen
  if (aspect_ratio > 1) {           // Landscape mode
    var timeline_dims = {'width': Math.min(15*vw, 100*vw-mini_dims), 'height': '100%'};
    var show_color_dims = {'width': '100%', 'height': vh*(101-box_ratio),
                          'bottom': -vh*(100-box_ratio), 'right': '0px'};
    var olddir = 'right', newdir = 'bottom';
  }
  else if (aspect_ratio <= 1) {     // Portrait mode
    var timeline_dims = {'width': '100%', 'height': Math.min(15*vh, 100*vh-mini_dims)};
    var show_color_dims = {'width': vw*(101-box_ratio), 'height': '100%',
                          'right': -vw*(100-box_ratio), 'bottom': '0px'};
    var olddir = 'gradient(', newdir = 'gradient(to right, ';
  }

  redraw_gradients();


  for (property in timeline_dims) {
    timeline_container.style[property] = timeline_dims[property];
  }
  for (property in show_color_dims) {
    show_color.style[property] = show_color_dims[property];
  }
  mini.style.width = mini_dims;
  mini.style.height = mini_dims;
}


function redraw_gradients() {
  //var olddir = 'right', newdir = 'bottom';
  //var olddir = 'gradient(', newdir = 'gradient(to right, ';
  let transitions_list = document.getElementsByClassName('transition');
  if (transitions_list.length > 0) {
    let w = transitions_list[0].offsetWidth, h = transitions_list[0].offsetHeight;
    let olddir = (h>w) ? 'right' : 'gradient(';
    let newdir = (h>w) ? 'bottom' : 'gradient(to right, ';
    for (let t=0; t<transitions_list.length; t++) {
      transitions_list[t].style.backgroundImage = transitions_list[t].style.backgroundImage.replace(olddir, newdir);
    };
  };
}
