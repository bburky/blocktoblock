// Fullscreen
// http://html5-demos.appspot.com/static/fullscreen.html

// This does not work in IE9 due to lack of browser support

var cancelFullScreen = document.webkitExitFullscreen || document.mozCancelFullScreen || document.exitFullscreen;

function onFullScreenEnter() {
  console.log("Entered fullscreen!");
  wrapper.onwebkitfullscreenchange = onFullScreenExit;
  wrapper.onmozfullscreenchange = onFullScreenExit;
  setTimeout(function() {
    canvas.width = document.width;
    canvas.height = document.height;
  }, 300);
}

// Called whenever the browser exits fullscreen.
function onFullScreenExit() {
  console.log("Exited fullscreen!");
}

function enterFullscreen() {
  console.log("enterFullscreen()");
  wrapper.onwebkitfullscreenchange = onFullScreenEnter;
  wrapper.onmozfullscreenchange = onFullScreenEnter;
  wrapper.onfullscreenchange = onFullScreenEnter;
  if (wrapper.webkitRequestFullscreen) {
    wrapper.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  } else {
    if (wrapper.mozRequestFullScreen) {
      wrapper.mozRequestFullScreen();
    } else {
      wrapper.requestFullscreen();
    }
  }
}

function exitFullscreen() {
  console.log("exitFullscreen()");
  cancelFullScreen();
}