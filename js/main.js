// TODO: complete board generation
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

// Generate the actual board from the temporary array
function generateBoardRects() {
  var rects = {};

  for (var y = 0; y < board.length; y++) {
    for (var x = 0; x < board[y].length; x++) {
      if (board[y][x] === 1) {
        rects[[x,y]] = 1;
      }
    }
  }

  return rects;
}

// Render the board onto the buffer
function drawBoard() {
  ctx.fillStyle = BLOCK_STYLE;
  for (var y = 0; y < board.length; y++) {
    for (var x = 0; x < board[y].length; x++) {
      if (boardRects[[x,y]] === 1) {
        var hash = (x+y) % BLOCK_IMG_SRCS.length;
        ctx.drawImage(blockImgs[hash], x*BLOCK_WIDTH, y*BLOCK_HEIGHT, BLOCK_WIDTH, BLOCK_HEIGHT);
      }
    }
  }
}

// Update the board state
function updateBoard(time) {
  for (var i = 0; i < players.length; i++) {
    if (boardRects[[players[i].x, players[i].y]] === 1) {
      // Hit a block
      hitSnd.play();
      boardRects[[players[i].x, players[i].y]] = 2;
    }
  }
}

function collidePlayers() {
  if (players[0].destX == players[1].destX && players[0].destY == players[1].destY && players[0].dir != players[1].dir) {
    players[0].dir = DIRECTION.none;
    players[1].dir = DIRECTION.none;
  }
}

// Update the player state including movement input
function updatePlayer(player, time) {
  var x, y, count;

  // Take input for a new location
  if ((player.destX == player.x && player.destY == player.y) &&
    (!player.animStart || (time - player.animStart) > KEYPRESS_DELAY) &&
    (player.dir != DIRECTION.none)) {

    switch(player.dir) {
    // case DIRECTION.none:
    //   break;
    case DIRECTION.up:
      x = player.x;
      y = player.y - 1;
      if (!boundsCheck(x, y)) {
        player.dead = time;
      }
      count = player.y - y;
      break;
    case DIRECTION.right:
      x = player.x + 1;
      y = player.y;
      if (!boundsCheck(x, y)) {
        player.dead = time;
      }
      count = x - player.x;
      break;
    case DIRECTION.down:
      x = player.x;
      y = player.y + 1;
      if (!boundsCheck(x, y)) {
        player.dead = time;
      }
      count = y - player.y;
      break;
    case DIRECTION.left:
      x = player.x - 1;
      y = player.y;
      if (!boundsCheck(x, y)) {
        player.dead = time;
      }
      count = player.x - x;
      break;
    }

    if (boardRects[[x,y]] == 1) {
      player.dir = DIRECTION.none;
    }

    // If the player died, setup the death animation
    if (player.dead) {
      player.deathAnimStart = time;
      player.deathAnimEnd = time + 1 / DEATH_SPEED;
    }

    // Setup the animation for the player movement
    player.animStart = time;
    player.animEnd = time + count / PLAYER_SPEED;
    player.destX = x;
    player.destY = y;
  } else if ((!player.animStart || (time - player.animStart) > KEYPRESS_DELAY) &&
    (player.dir != DIRECTION.none)) {
    // After moving, unset the current direction
    // player.dir = DIRECTION.none;
  }
}

// Calculate the current player pixel position
function updatePlayerPos(player, time) {
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
    x: xPos,
    y: yPos
  };
}

// Return true if in bounds of screen
function boundsCheck(x, y) {
  // TODO: check if off screen
  return !((x > 100 || x < -100) || (y > 100 || y < -100));
}

// Called by key listener to input directions
function inputDirection(player, dir) {
  if (player.dir === DIRECTION.none) {
    player.dir = dir;
  }
}

// Update camera state data and position
function updateCamera(time, player0Pos, player1Pos) {
  camera.xPos = canvas.width/2 - (player0Pos.x + player1Pos.x)/2;
  camera.yPos = canvas.height/2 - (player0Pos.y + player1Pos.y)/2;
}

// Render death animation to the buffer
function drawDeath(player, time) {
  var alpha = 0.3;
  var percent = (time - player.deathAnimStart) / (player.deathAnimEnd - player.deathAnimStart);

  if (time < player.deathAnimEnd) {
    alpha = 0.65 - Math.abs(percent - 0.65) ;
  }

  canvasCtx.fillStyle = DEATH_STYLE_FRAGMENT + alpha + ')';
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  if (time >= player.deathAnimEnd) {
    canvasCtx.font = TEXT_FONT;
    canvasCtx.textAlign = 'center';
    canvasCtx.fillStyle = TEXT_STYLE;
    canvasCtx.fillText('Game Over', canvas.width/2, canvas.height/2);
  }
}

// Draw the player onto the buffer
function drawPlayer(player, time, position) {
  if (player.dir != DIRECTION.none) {
    ctx.globalAlpha = 1.25/MOTION_BLUR_STEPS;
    switch(player.dir) {
    // case DIRECTION.none:
    //   break;
    case DIRECTION.up:
      for (var i = MOTION_BLUR_STEPS/2; i < MOTION_BLUR_STEPS; i++) {
        ctx.drawImage(player.img, position.x, position.y-i, BLOCK_WIDTH, BLOCK_HEIGHT);
      }
      break;
    case DIRECTION.right:
      for (var i = MOTION_BLUR_STEPS/2; i < MOTION_BLUR_STEPS; i++) {
        ctx.drawImage(player.img, position.x-i, position.y, BLOCK_WIDTH, BLOCK_HEIGHT);
      }
      break;
    case DIRECTION.down:
      for (var i = MOTION_BLUR_STEPS/2; i < MOTION_BLUR_STEPS; i++) {
        ctx.drawImage(player.img, position.x, position.y+i, BLOCK_WIDTH, BLOCK_HEIGHT);
      }
      break;
    case DIRECTION.left:
      for (var i = MOTION_BLUR_STEPS/2; i < MOTION_BLUR_STEPS; i++) {
        ctx.drawImage(player.img, position.x+i, position.y, BLOCK_WIDTH, BLOCK_HEIGHT)
      }
      break;
    }
    ctx.globalAlpha = 1;
  } else {
      ctx.drawImage(player.img, position.x, position.y, BLOCK_WIDTH, BLOCK_HEIGHT);
  }

}

// Render the buffer to the canvas
function drawCamera(time) {
  // canvasCtx.fillStyle = BACKGROUND_STYLE;
  // canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
  canvasCtx.drawImage(tutorialBg, CAMERA_X_OFFSET - camera.xPos, CAMERA_Y_OFFSET - camera.yPos, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
  canvasCtx.drawImage(buffer, camera.xPos, camera.yPos);
}

// Main game loop
function drawFrame(time) {
  // Setup code for timers
  if (!lastUpdate) {
    // TODO: make this less hacky
    lastUpdate = time + 1;
    players[0].animStart = time + 1;
    players[0].animEnd = time + 2;
    players[1].animStart = time + 1;
    players[1].animEnd = time + 2;
  }
  var delta = lastUpdate - time;

  // Update game state if the player hasn't died
  if (!players[0].dead && !players[1].dead ) {
    updateBoard(time);
    updatePlayer(players[0], time);
    updatePlayer(players[1], time);
    collidePlayers();
  }
  var player0Pos = updatePlayerPos(players[0], time);
  var player1Pos = updatePlayerPos(players[1], time);
  updateCamera(time, player0Pos, player1Pos);

  // Render the buffer and the canvas
  ctx.clearRect(0,0,buffer.width, buffer.height);
  drawBoard();
  drawPlayer(players[0], time, player0Pos);
  drawPlayer(players[1], time, player1Pos);
  drawCamera(time);
  if (players[0].dead) {
    drawDeath(players[0], time);
  } else if (players[1].dead) {
    drawDeath(players[1], time);
  }

  // FPS calculation
  var thisFrameFPS = 1000 / (time - lastUpdate);
  fps = thisFrameFPS;
  lastUpdate = time;

  canvasCtx.font = FPS_TEXT_FONT;
  canvasCtx.textAlign = 'left';
  canvasCtx.fillStyle = TEXT_STYLE;
  canvasCtx.fillText(fps.toFixed(1) + "fps", 0, 15);

  // Reregister the game loop callback
  window.requestAnimationFrame(drawFrame);
}

function loadAssets(callback) {
  var assetsLoaded = 0;

  function checkAssetsLoaded() {
    assetsLoaded++;
    if (assetsLoaded == TOTAL_ASSETS) {
      callback();
    }
  }

  // Load player sprites
  for (var i = 0; i < players.length; i++) {
    players[i].img = new Image();
    players[i].img.src = players[i].imgSrc;
    players[i].img.onload = checkAssetsLoaded;
  }

  // Load block sprites
  for (var i = 0; i < BLOCK_IMG_SRCS.length; i++) {
    blockImgs[i] = new Image();
    blockImgs[i].src = BLOCK_IMG_SRCS[i];
    blockImgs[i].onload = checkAssetsLoaded;
  }

  // Load tutorial backgrouond
  tutorialBg = new Image();
  tutorialBg.src = TUTORIALBG_SRC;
  tutorialBg.onload = checkAssetsLoaded;

  // Loud sound effects
  createjs.Sound.addEventListener("loadComplete", createjs.proxy(checkAssetsLoaded,this));
  createjs.Sound.registerSound(SND_HIT_SRC);
}

// Initialization and game loop
function initGame() {
  restartGame();

  hitSnd = createjs.Sound.createInstance(SND_HIT_SRC);

  // Set up the main game loop to run
  // Note: a polyfill is used to allow this to work cross-browser
  window.requestAnimationFrame(drawFrame);

  // init soundjs
  createjs.Sound.initializeDefaultPlugins();
}

function restartGame() {
  boardRects = generateBoardRects();
}

// Listen for keypresses for movement and fullscreen
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
      inputDirection(players[0], DIRECTION.up);
      break;
    case 68: // d
      inputDirection(players[0], DIRECTION.right);
      break;
    case 83: // s
      inputDirection(players[0], DIRECTION.down);
      break;
    case 65: // a
      inputDirection(players[0], DIRECTION.left);
      break;
    case 38: // up
      inputDirection(players[1], DIRECTION.up);
      break;
    case 39: // right
      inputDirection(players[1], DIRECTION.right);
      break;
    case 40: // down
      inputDirection(players[1], DIRECTION.down);
      break;
    case 37: // left
      inputDirection(players[1], DIRECTION.left);
      break;
  }
}, false);


// Write FPS data to the page
var fpsOut = document.getElementById('fps');
setInterval(function(){
  fpsOut.innerHTML = fps.toFixed(1) + "fps";
}, 100);

// Load assets and init game

loadAssets(initGame);
