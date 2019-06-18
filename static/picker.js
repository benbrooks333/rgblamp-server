
/* DHTML Color Sphere : v1.0.2 : 2008/04/17 */
/* http://www.colorjack.com/software/dhtml+color+sphere.html */


function set_color(r, g, b) {
// Set color marker (timeline) color
  if (TLine.selected) {
    if (TLine.selected.classList.contains('color_marker')) {
      let current_color = '#' + color.HSV_HEX(Picker.hsv);
      TLine.selected.style.background = current_color;

// Set transition (timeline) (solid or gradient) color
      let step_number = Number(TLine.selected.id.match(/\d+/)[0]); // Extract digit from id string
      dims = viewportSize();
      let direction = ((dims.width + 15) > dims.height) ? 'bottom' : 'right';

      if (step_number > 1) {                // If selected element is not the first
        let previous_color = document.getElementById('color_marker'+(step_number-1)).style.background;
        let previous_transition = document.getElementById('transition'+(step_number-1));
        previous_transition.style.backgroundImage = 'linear-gradient(to '+direction+', '+previous_color+', '+current_color+')';
      }
      if (step_number < TLine.num_steps) {  // If selected element is not the last
        console.log('color_marker'+Number(step_number+1));
        let next_color = document.getElementById('color_marker'+(step_number+1)).style.background;
        let next_transition = document.getElementById('transition'+step_number);
        next_transition.style.backgroundImage = 'linear-gradient(to '+direction+', '+current_color+', '+next_color+')';
      }
  };};



// Set lamp color
  if (performance.now() - Picker.time > 100) { // 100 (ms) ~ 10 updates/s max
    send_color(r, g, b);
    Picker.time = performance.now();
  }

  rgb_string = 'R:' + r + ' G:' + g + ' B:' + b;
  get_element('RGB').innerHTML = rgb_string;
  get_style('show_color').background = '#' + color.HSV_HEX(Picker.hsv);
}

/* COLOR PICKER */

Picker={};

Picker.stop=1;

Picker.hsv={H:0, S:0, V:100};

Picker.time=performance.now();


// Picker core is called with Picker.core(element, event)   (arguments xy, z, and fu) seem to be unused
// element is on of: 'mini' 'cursor' or 'resize'
Picker.core=function(obj, event) {//, xy, z, fu) {

  function point(x_pos, y_pos, event) {
    event_pos=XY(event);
    //document.getElementById('debugbox').innerHTML="EPOS: "+event_pos.X+"<br>xpos: "+x_pos+"<br>EPOS: "+event_pos.Y+"<br>ypos: "+y_pos;
    commit([event_pos.X+x_pos,event_pos.Y+y_pos]);
  }

  function max_function(v,a,z) {
    // Max of (0, z, min(a, v))
    return(Math.max(!isNaN(z) ? z : 0, !isNaN(a) ? Math.min(a,v) : v));
  }

  function commit(v) {

    if(obj=='cursor') {
// Do the color thing
//      var width=parseInt(get_style('circle_container').width);
      var width=get_element('color_circle').offsetWidth
      var width2=width/2;
      var width3=width2/2;
      var x=v[0]-width2-3;

      var y=width-v[1]-width2+21;
      var SV=Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
      var hue=Math.atan2(x,y)/(Math.PI*2);

      Picker.hsv={
        'H':hue>0?(hue*360):((hue*360)+360),
        'S':SV<width3?(SV/width3)*100:100,
        'V':SV>=width3?Math.max(0,1-((SV-width3)/(width2-width3)))*100:100
      };

      Picker.rgb = color.HSV_RGB(Picker.hsv);
      let r = Picker.rgb.R, g = Picker.rgb.G, b = Picker.rgb.B;


      set_color(r, g, b);
      color.cords(width);

    }
/*
    else if(obj=='resize') {
      var b=Math.max(Math.max(v[0],v[1])+objH,75);
      color.cords(b);
// Resize window
      get_style('mini').height=(b+28)+'px'; get_style('mini').width=(b+20)+'px';
      get_style('circle_container').height=b+'px'; get_style('circle_container').width=b+'px';

    }
/*

/*
    else {
// Move window
      if(xy) v=[max_function(v[0],xy[0],xy[2]), max_function(v[1],xy[1],xy[3])]; // XY LIMIT

      if(!xy || xy[0]) object_style.left=v[0]+'px'; if(!xy || xy[1]) object_style.top=v[1]+'px';

    }
*/
  };

  if(Picker.stop) {

    Picker.stop='';
    var object_style=get_style(obj);
    eZ=XY(event);

    if(obj=='cursor') {
      var container_pos=abPos(get_element(obj).parentNode);
      point(-(container_pos.X-5),-(container_pos.Y-28+jQuery(document).scrollTop()),event);
    }
/*
    if(obj=='resize') {
      var objH=parseInt(get_style('circle_container').height);
      var objX=-XY(e).X, objY=-XY(e).Y;
    }

    else {
      var objX=zero(object_style.left)-eZ.X;
      var objY=zero(object_style.top)-eZ.Y;
    }
*/
    var objX=zero(object_style.left)-eZ.X;
    var objY=zero(object_style.top)-eZ.Y;
    document.onmousemove=function(event){ if(!Picker.stop) point(objX, objY, event); };
    document.onmouseup=function(){ Picker.stop=1; document.onmousemove=''; document.onmouseup=''; };

    //document.ontouchmove=function(event){alert(event); };
    //document.ontouchend=function(){alert("touch end")};
    //document.ontouchmove=function(event){ if(!Picker.stop) point(objX, objY, event); };
    //document.ontouchend=function(){ Picker.stop=1; document.ontouchmove=''; document.ontouchend=''; };

  }
};

/* COLOR LIBRARY */

color={};

// Sets cursor div location
color.cords=function(width) {
  var width2=width/2;
  var rad=(Picker.hsv.H/360)*(Math.PI*2);   // rad = radians clockwise from top (I think)
  var hyp=(Picker.hsv.S+(100-Picker.hsv.V))/100*(width2/2); //

  get_style('cursor').left=Math.round(Math.abs(Math.round(Math.sin(rad)*hyp)+width2+3))+'px';
  get_style('cursor').top=Math.round(Math.abs(Math.round(Math.cos(rad)*hyp)-width2-21))+'px';

};

// Converts color value of decimal 0-255 to hex 00-FF
color.HEX=function(color_value) { color_value=Math.round(Math.min(Math.max(0,color_value),255));
    return("0123456789ABCDEF".charAt((color_value-color_value%16)/16)+"0123456789ABCDEF".charAt(color_value%16));

};

// Converts RGB to hex
color.RGB_HEX=function(color_value) {
  var hex=color.HEX;
  return(hex(color_value.R)+hex(color_value.G)+hex(color_value.B));
};

// Converts HSV to RGB
color.HSV_RGB=function(color_value) {
    var R, G, A, B, C;
    var S=color_value.S/100;
    var V=color_value.V/100;
    var H=color_value.H/360;

    if(S>0) { if(H>=1) H=0;

        H=6*H; F=H-Math.floor(H);
        A=Math.round(255*V*(1-S));
        B=Math.round(255*V*(1-(S*F)));
        C=Math.round(255*V*(1-(S*(1-F))));
        V=Math.round(255*V);

        switch(Math.floor(H)) {

            case 0: R=V; G=C; B=A; break;
            case 1: R=B; G=V; B=A; break;
            case 2: R=A; G=V; B=C; break;
            case 3: R=A; G=B; B=V; break;
            case 4: R=C; G=A; B=V; break;
            case 5: R=V; G=A; B=B; break;

        }

        return({'R':R?R:0, 'G':G?G:0, 'B':B?B:0, 'A':1});

    }
    else return({'R':(V=Math.round(V*255)), 'G':V, 'B':V, 'A':1});

};


// Converts HSV to hex
color.HSV_HEX=function(color_value) {
  return(color.RGB_HEX(color.HSV_RGB(color_value)));
};
