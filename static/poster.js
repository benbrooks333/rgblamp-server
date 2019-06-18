/*
Post requests will be of the form: (without spaces)
rgb=rgb & times=times & transitions=transitions

rgb, times and transitions are all "python arrays" in string form
e.g: "data=[ [1, 2], ['a', 'b'] ]" ==> "data=1,2,,a,b"
In parsing, string is split first at each ',,' then at each ','

This is all to support sending light patterns from the browser
top-level length of each array (rgb, time, transitions) should all
equal the number of different colors in the light pattern
*/
log=0

function make_post_data() {
  let postdata = '';

  rgbdata = 'rgbs=';
  timedata = '&times=';
  transitiondata = '&transitions=';

  postdata = rgbdata + timedata + transitiondata;

  send_data(postdata);
}

function send_command() {
  let cmd_text = jQuery('#cmdbox').val();
  if (cmd_text != '') {
    postdata = cmd_text;
    send_data(postdata);
  }
}

function send_color(r, g, b) {
  let postdata = 'r='+r + '&g='+g + '&b='+b;
  postdata += "&single=true";
  send_data(postdata);
}


function stop() {
  send_data("stop=true");
}

function send_data(postdata) {
  if (log) {console.log(postdata);}
  jQuery.ajax({
    url : jQuery(this).attr('action') || window.location.pathname,
    type: 'POST',
    data: postdata,
    success: function (data) {jQuery('#command_output').html(data)},
    error: function (jXHR, textStatus, errorThrown) {jQuery('#command_output').html(errorThrown);}
  });
}
/*
jQuery(document).ready(function () {
  jQuery('#rgbform').on('submit', function(event) {
    event.preventDefault();
    post_it();
  });
});
*/
