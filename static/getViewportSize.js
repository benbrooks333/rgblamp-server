
/*!
 An experiment in getting accurate visible viewport dimensions across devices
 (c) 2012 Scott Jehl.
 MIT/GPLv2 Licence
*/

function viewportSize(){
	var test = document.createElement( "div" );

	test.style.cssText = "position: fixed;top: 0;left: 0;bottom: 0;right: 0;";
	document.documentElement.insertBefore( test, document.documentElement.firstChild );

	var dims = { width: test.offsetWidth, height: test.offsetHeight };
	document.documentElement.removeChild( test );

	return dims;
}


// Notes:
// relies on position:fixed support, but it should work in browsers that partially support position: fixed like iOS4 and such...

//sample usage: var viewportwidth = viewportSize().width;
