var cancelFullScreen = document.webkitExitFullscreen || document.mozCancelFullScreen || document.exitFullscreen;

$('#start').click(function() {started = true;});

var canvas = document.getElementById('canvas');

var buffer = document.createElement("canvas");
buffer.width = 1000;
buffer.height = 1000;

var canvasCtx = canvas.getContext('2d');
var ctx = buffer.getContext('2d');

var BLOCK_WIDTH = 50;
var BLOCK_HEIGHT = 50;
var BLOCK_STYLE = 'rgb(200,0,0)';

var PLAYER_WIDTH = 15;
var PLAYER_HEIGHT = 15;
var PLAYER_STYLE = 'rgb(0,0,0)';
var PLAYER_SPEED = 6/1000;

var BACKGROUND_STYLE = 'rgb(255,255,255)';
var CAMERA_WIDTH = 10;
var CAMERA_HEIGHT = 10;
var CAMERA_SPEED = 1/1000;

var KEYPRESS_DELAY = 100;

var DIRECTION = {
  none: 0,
  up: 1,
  right: 2,
  down: 3,
  left: 4
};

var fps;
var lastUpdate;

var started = false;
var player = {
  x: 4,
  y: 1,
  destX: 4,
  destY: 1,
  dir: DIRECTION.none
  // animEnd
};
var camera = {
  x: 0,
  y: 0,
  destX: 0,
  destY: 0
};
var board = [
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
];
var boardRects = generateBoardRects();

function drawBoard() {
  ctx.fillStyle = BLOCK_STYLE;
  for (var y = 0; y < board.length; y++) {
    for (var x = 0; x < board[y].length; x++) {
      if (boardRects[[x,y]]) {
        ctx.fillRect(x*BLOCK_WIDTH, y*BLOCK_HEIGHT, BLOCK_WIDTH, BLOCK_HEIGHT);
      }
    }
  }
}


// Generate sequence of n moves starting at (x, y) as an initial position
function generateSequence(x, y, n) {
  var curX = x;
  var curY = y;
  var seq = [];

  for (var i = 0; i < n; i++) {
    nextX = Math.floor(Math.random() * 4) - 2;
    nextY = Math.floor(Math.random() * 4) - 2;
    seq.push([x,y]);
  }

}

function generateBoardRects() {
  var rects = [];

  for (var y = 0; y < board.length; y++) {
    for (var x = 0; x < board[y].length; x++) {
      if (board[y][x]) {
        rects[[x,y]] = true;
      }
    }
  }

  return rects;
}

// Return true if in bounds of screen
function boundsCheck(x, y) {
  // TODO: check if off screen
  return !((x > 100 || x < -100) || (y > 100 || y < -100));
}

function drawPlayer(time, position) {
  ctx.fillStyle = PLAYER_STYLE;
  ctx.fillRect(position.x, position.y, BLOCK_WIDTH, BLOCK_HEIGHT);
}

function inputDirection(dir) {
  player.dir = dir;
}

function updateBoard(time) {
  if (boardRects[[player.x, player.y]]) {
    delete boardRects[[player.x, player.y]];
  }
}
function updatePlayer(time) {
  // Take input for a new location
  var x, y, count;
  var dead = false;

  if ((player.destX == player.x && player.destY == player.y) &&
    (!player.animStart || (time - player.animStart) > KEYPRESS_DELAY) &&
    (player.dir != DIRECTION.none)) {

    switch(player.dir) {
    // case DIRECTION.none:
    //   break;
    case DIRECTION.up:
      x = player.x;
      y = player.y - 1;
      while (!boardRects[[x, y]]) {
        if (!boundsCheck(x, y)) {
          dead = true;
          break;
        }
        y--;
      }
      count = player.y - y;
      break;
    case DIRECTION.right:
      x = player.x + 1;
      y = player.y;
      while (!boardRects[[x, y]]) {
        if (!boundsCheck(x, y)) {
          dead = true;
          break;
        }
        x++;
      }
      count = x - player.x;
      break;
    case DIRECTION.down:
      x = player.x;
      y = player.y + 1;
      while (!boardRects[[x, y]]) {
        if (!boundsCheck(x, y)) {
          dead = true;
          break;
        }
        y++;
      }
      count = y - player.y;
      break;
    case DIRECTION.left:
      x = player.x - 1;
      y = player.y;
      while (!boardRects[[x, y]]) {
        if (!boundsCheck(x, y)) {
          dead = true;
          break;
        }
        x--;
      }
      count = player.x - x;
      break;
    }

    player.animStart = time;
    player.animEnd = time + count / PLAYER_SPEED;
    player.destX = x;
    player.destY = y;
    player.dir = DIRECTION.none;
  } else if ((!player.animStart || (time - player.animStart) > KEYPRESS_DELAY) &&
    (player.dir != DIRECTION.none)) {
    player.dir = DIRECTION.none;
  }

  // Calculate current position
  var xPos;
  var yPos;
  var percent = (time - player.animStart) / (player.animEnd - player.animStart);

  if (time > player.animEnd) {
    player.x = player.destX;
    player.y = player.destY;
    xPos = player.x * BLOCK_WIDTH;
    yPos = player.y * BLOCK_HEIGHT;
  } else {
    xPos = (player.x + (player.destX - player.x) * percent) * BLOCK_WIDTH;
    yPos = (player.y + (player.destY - player.y) * percent) * BLOCK_HEIGHT;
  }

  return {
    dead: dead,
    x: xPos,
    y: yPos
  };
}

function updateCamera(time) {
  if (camera.animEnd && time > camera.animEnd) {
    camera.x = camera.destX;
    camera.y = camera.destY;
  }
  if (camera.destX == camera.x && camera.destY == camera.y) {
    camera.destX = Math.floor(Math.random() * 4) - 2;
    camera.destY = Math.floor(Math.random() * 4) - 2;
    camera.animStart = time;
    camera.animEnd = time + Math.sqrt(Math.pow(camera.x - camera.destX, 2) + Math.pow(camera.y - camera.destY, 2)) / CAMERA_SPEED;
  }


}

function drawCamera(time) {
  var percent = (time - camera.animStart) / (camera.animEnd - camera.animStart);
  var x = (camera.x + (camera.destX - camera.x) * percent) * BLOCK_WIDTH;
  var y = (camera.y + (camera.destY - camera.y) * percent) * BLOCK_HEIGHT;

  if (camera.animEnd && time > camera.animEnd) {
    x = camera.x * BLOCK_WIDTH;
    y = camera.y * BLOCK_HEIGHT;
  } else {
    x = (camera.x + (camera.destX - camera.x) * percent) * BLOCK_WIDTH;
    y = (camera.y + (camera.destY - camera.y) * percent) * BLOCK_HEIGHT;
  }


  canvasCtx.fillStyle = BACKGROUND_STYLE;
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
  canvasCtx.drawImage(buffer, x, y);
}

function drawFrame(time) {
  if (!lastUpdate) {
    lastUpdate = time + 1;
    player.animStart = time + 1;
    player.animEnd = time + 2;
  }
  var delta = lastUpdate - time;

  var cameraPos = updateCamera(time);
  var playerPos = updatePlayer(time);
  updateBoard(time);

  ctx.clearRect(0,0,buffer.width, buffer.height);
  drawBoard();
  drawPlayer(time, playerPos);
  drawCamera(time);

  var thisFrameFPS = 1000 / (time - lastUpdate);
  fps = thisFrameFPS;
  lastUpdate = time;

  window.requestAnimationFrame(drawFrame);
}

window.requestAnimationFrame(drawFrame);

var fpsOut = document.getElementById('fps');
setInterval(function(){
  fpsOut.innerHTML = fps.toFixed(1) + "fps";
}, 100);

document.addEventListener('keydown', function(e) {
  switch (e.keyCode) {
    case 13: // ENTER. ESC should also take you out of fullscreen by default.
      e.preventDefault();
      // document.cancelFullScreen(); // explicitly go out of fs.
      cancelFullScreen(); // explicitly go out of fs.
      break;
    case 70: // f
      enterFullscreen();
      break;
    case 87: // w
      inputDirection(DIRECTION.up);
      break;
    case 68: // d
      inputDirection(DIRECTION.right);
      break;
    case 83: // s
      inputDirection(DIRECTION.down);
      break;
    case 65: // a
      inputDirection(DIRECTION.left);
      break;
  }
}, false);

function onFullScreenEnter() {
  console.log("Entered fullscreen!");
  elem.onwebkitfullscreenchange = onFullScreenExit;
  elem.onmozfullscreenchange = onFullScreenExit;
}

// Called whenever the browser exits fullscreen.
function onFullScreenExit() {
  console.log("Exited fullscreen!");
}

function enterFullscreen() {
  console.log("enterFullscreen()");
  elem.onwebkitfullscreenchange = onFullScreenEnter;
  elem.onmozfullscreenchange = onFullScreenEnter;
  elem.onfullscreenchange = onFullScreenEnter;
  if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  } else {
    if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else {
      elem.requestFullscreen();
    }
  }
  // document.getElementById('enter-exit-fs').onclick = exitFullscreen;
}

function exitFullscreen() {
  console.log("exitFullscreen()");
  cancelFullScreen();
  document.getElementById('enter-exit-fs').onclick = enterFullscreen;
}

var gameWrapper = document.getElementById("game-wrapper");
var elem = gameWrapper;