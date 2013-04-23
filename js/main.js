// Generate the actual board from the temporary array
function generateBoardRects() {
  var rects = {};

  for (var y = 0; y < board.length; y++) {
    for (var x = 0; x < board[y].length; x++) {
      if (board[y][x] === 1 || board[y][x] === 8) {
        rects[[x,y]] = board[y][x];
      }
    }
  }

  return rects;
}

// Render the board onto the buffer
function drawBoard() {
  for (var y = 0; y < board.length; y++) {
    for (var x = 0; x < board[y].length; x++) {
      if (boardRects[[x,y]] === 1) {
        var hash = (x+y) % BLOCK_IMG_SRCS.length;
        ctx.drawImage(blockImgs[hash], x*BLOCK_WIDTH + 2*BLOCK_WIDTH, y*BLOCK_HEIGHT + 2*BLOCK_HEIGHT, BLOCK_WIDTH, BLOCK_HEIGHT);
      } else if (boardRects[[x,y]] === 8) {
        ctx.drawImage(blockGoalImg, x*BLOCK_WIDTH + 2*BLOCK_WIDTH, y*BLOCK_HEIGHT + 2*BLOCK_HEIGHT, BLOCK_WIDTH, BLOCK_HEIGHT);
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
    } else if (boardRects[[players[i].x, players[i].y]] === 8) {
      // Hit a goal block
      hitSnd.play();
      boardRects[[players[i].x, players[i].y]] = 10;
    }
  }
}

// Check if player blocks are colliding
function collidePlayers() {
  if (players[0].destX == players[1].destX && players[0].destY == players[1].destY && players[0].dir != players[1].dir) {
    players[0].dir = DIRECTION.none;
    players[1].dir = DIRECTION.none;
    hitPlayerSnd.play();
  }
}

// Update the player state including movement input
function updatePlayer(player, time) {
  var x, y, count;

  // Take input for a new location
  if ((player.destX == player.x && player.destY == player.y) &&
    (!player.animStart || (time - player.animStart) > KEYPRESS_DELAY) &&
    (player.dir != DIRECTION.none) && (!player.paused)) {

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

    if (boardRects[[x,y]] === 1 || boardRects[[x,y]] === 8) {
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

    collidePlayers();
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

function currentPlayerPosAfterCamera(player, time) {
  var pos = updatePlayerPos(player, time);

  return {
    x: pos.x + camera.xPos,
    y: pos.y + camera.yPos
  };}

// Return true if in bounds of screen
function boundsCheck(x, y) {
  return !((x > board[0].length || x < 0) || (y > board.length || y < 0));
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

// Triggered when holding spacebar to freeze sliding blocks
function startPause() {
  if (!gamePaused) {
    gamePaused = true;
    for (var i = 0; i < players.length; i++) {
      if (players[i].dir !== DIRECTION.none) {
        players[i].paused = true;
      }
    }
  }
}

// Triggered when releasing spacebar to unfreeze sliding blocks
function endPause() {
  gamePaused = false;
  for (var i = 0; i < players.length; i++) {
    players[i].paused = false;
  }
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

    canvasCtx.font = SMALL_TEXT_FONT;
    canvasCtx.fillText('Press R to restart level', canvas.width/2, canvas.height/2 + 40);
  }
}

// Check if player has won
function checkWin(time) {
  if (boardRects[[players[0].x, players[0].y]] === 10 && boardRects[[players[1].x, players[1].y]] === 10 &&
    players[0].dir === DIRECTION.none &&
    !(players[0].x == players[1].x && players[1].y == players[0].y) &&
    players[1].dir === DIRECTION.none) {
    wonGame = true;
    winAnimStart = time;
    winAnimEnd = time + 1 / DEATH_SPEED;

  }
}

// Render death animation to the buffer
function drawWin(time) {
  var alpha = 0.3;
  var percent = (time - winAnimStart) / (winAnimEnd - winAnimStart);

  if (time < winAnimEnd) {
    alpha = 0.65 - Math.abs(percent - 0.65) ;
  }

  canvasCtx.fillStyle = WIN_STYLE_FRAGMENT + alpha + ')';
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  if (time >= winAnimEnd) {
    canvasCtx.font = TEXT_FONT;
    canvasCtx.textAlign = 'center';
    canvasCtx.fillStyle = TEXT_STYLE;
    canvasCtx.fillText('You Win!', canvas.width/2, canvas.height/2);

    var blocks = remainingBlocks();
    var blocksStr = blocks === 0 ? 'You collected all blocks' : 'You missed ' + blocks + ' blocks';
    canvasCtx.font = SMALL_TEXT_FONT;
    canvasCtx.fillText(blocksStr, canvas.width/2, canvas.height/2 + 40);

    if (level + 1 < levels.length) {
      canvasCtx.fillText('Press enter to start next level', canvas.width/2, canvas.height/2 + 80);
    } else {
      canvasCtx.fillText("You've finished all the levels", canvas.width/2, canvas.height/2 + 80);
      canvasCtx.fillText("Press enter to restart game", canvas.width/2, canvas.height/2 + 95);
    }
  }
}

// Count remaining blocks on board, used for drawWin()
function remainingBlocks() {
  var blocks = 0;
  for(var b in boardRects) {
      if (boardRects.hasOwnProperty(b)) {
        if (boardRects[b] === 1 || boardRects[b] === 8) {
          blocks++;
        }
      }
  }
  return blocks;
}

// Draw the player onto the buffer
function drawPlayer(player, time, position) {
  if (player.dir != DIRECTION.none) {
    ctx.globalAlpha = 1.25/MOTION_BLUR_STEPS;
    switch(player.dir) {
    // case DIRECTION.none:
    //   break;
    case DIRECTION.up:
      for (var i = -MOTION_BLUR_STEPS; i < 0; i++) {
        ctx.drawImage(player.img, position.x + 2*BLOCK_WIDTH, position.y-i + 2*BLOCK_HEIGHT, BLOCK_WIDTH, BLOCK_HEIGHT);
      }
      break;
    case DIRECTION.right:
      for (var i = 0; i < MOTION_BLUR_STEPS; i++) {
        ctx.drawImage(player.img, position.x-i + 2*BLOCK_WIDTH, position.y + 2*BLOCK_HEIGHT, BLOCK_WIDTH, BLOCK_HEIGHT);
      }
      break;
    case DIRECTION.down:
      for (var i = -MOTION_BLUR_STEPS; i < 0; i++) {
        ctx.drawImage(player.img, position.x + 2*BLOCK_WIDTH, position.y+i + 2*BLOCK_HEIGHT, BLOCK_WIDTH, BLOCK_HEIGHT);
      }
      break;
    case DIRECTION.left:
      for (var i = 0; i < MOTION_BLUR_STEPS; i++) {
        ctx.drawImage(player.img, position.x+i + 2*BLOCK_WIDTH, position.y + 2*BLOCK_HEIGHT, BLOCK_WIDTH, BLOCK_HEIGHT)
      }
      break;
    }
    ctx.globalAlpha = 1;
  } else {
      ctx.drawImage(player.img, position.x + 2*BLOCK_WIDTH, position.y + 2*BLOCK_HEIGHT, BLOCK_WIDTH, BLOCK_HEIGHT);
  }

}

// Render the background and buffer to the canvas
function drawCamera(time) {
  // Fill background of canvas with background color
  canvasCtx.fillStyle = backgroundStyle;
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  // Clamp position values into bounds of background image
  // TODO: there's probably a less ugly way to do this that uses less repetition
  //var sx = Math.max(0, Math.min(-camera.xPos, backgroundImg.width));
  //var sy = Math.max(0, Math.min(-camera.yPos, backgroundImg.height));
  //var w = Math.min(canvas.width - Math.max(0, camera.xPos), backgroundImg.width - sx);
  //var h = Math.min(canvas.height - Math.max(0, camera.yPos), backgroundImg.height - sy);
  //var dx = sx + canvas.width > backgroundImg.width ? 0 : Math.max(0, canvas.width - w);
  //var dy = sy + canvas.height > backgroundImg.height ? 0 : Math.max(0, canvas.height - h);

  // Render the calculated portion of the transparent background image
  //canvasCtx.drawImage(backgroundImg, sx, sy, w, h, dx, dy, w, h);

  // TODO: replace this with working background calculations
  canvasCtx.drawImage(backgroundImg, camera.xPos, camera.yPos, backgroundImg.width * X_SCALE, backgroundImg.height * Y_SCALE);

  // Draw the rest of the game over the background
  canvasCtx.drawImage(buffer, camera.xPos - 2*BLOCK_WIDTH, camera.yPos - 2*BLOCK_HEIGHT);
}

// Main game loop
function drawFrame(time) {
  var delta = lastUpdate - time;

  // Update game state if the player hasn't died
  if (!players[0].dead && !players[1].dead ) {
    updateBoard(time);
    updatePlayer(players[0], time);
    updatePlayer(players[1], time);
  }
  var player0Pos = updatePlayerPos(players[0], time);
  var player1Pos = updatePlayerPos(players[1], time);
  if (!wonGame) {
    checkWin(time);
  }
  updateCamera(time, player0Pos, player1Pos);

  // Render the buffer and the canvas
  ctx.clearRect(0,0,buffer.width, buffer.height);
  drawBoard();
  drawPlayer(players[0], time, player0Pos);
  drawPlayer(players[1], time, player1Pos);
  drawCamera(time);
  if (wonGame) {
    drawWin(time);
  } else if (players[0].dead) {
    drawDeath(players[0], time);
  } else if (players[1].dead) {
    drawDeath(players[1], time);
  }

  // FPS calculation
  var thisFrameFPS = 1000 / (time - lastUpdate);
  fps = thisFrameFPS;
  lastUpdate = time;

  canvasCtx.font = SMALL_TEXT_FONT;
  canvasCtx.textAlign = 'left';
  canvasCtx.fillStyle = TEXT_STYLE;
  canvasCtx.fillText(fps.toFixed(1) + "fps", 0, 15);

  // Reregister the game loop callback
  window.requestAnimationFrame(drawFrame);
}

function loadAssets(callback) {
  var assetsLoaded = 0;

  // Callback onload of each asset to check if loading is complete
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

  // Load goal block sprite
  blockGoalImg = new Image();
  blockGoalImg.src = BLOCK_GOAL_IMG_SRC;
  blockGoalImg.onload = checkAssetsLoaded;

  // Load level backgrouonds
  for (var i = 0; i < levels.length; i++) {
    levels[i].backgroundImg = new Image();
    levels[i].backgroundImg.src = levels[i].backgroundImgSrc;
    levels[i].backgroundImg.onload = checkAssetsLoaded;
  }

  // Loud sound effects
  createjs.Sound.addEventListener("loadComplete", createjs.proxy(checkAssetsLoaded,this));
  createjs.Sound.registerSound(SND_HIT_SRC);
  createjs.Sound.registerSound(SND_HIT_PLAYER_SRC);
}

// Initialization and game loop
function initGame() {
  // Setup board and player blocks
  restartGame();

  // Instantiate sounds
  createjs.Sound.initializeDefaultPlugins();
  hitSnd = createjs.Sound.createInstance(SND_HIT_SRC);
  hitPlayerSnd = createjs.Sound.createInstance(SND_HIT_PLAYER_SRC);

  // Setup code for timers
  // init with fake values
  lastUpdate = 1;
  players[0].animStart = 1;
  players[0].animEnd = 2;
  players[1].animStart = 1;
  players[1].animEnd = 2;

  // Set up the main game loop to run
  // Note: a polyfill is used to allow this to work cross-browser
  window.requestAnimationFrame(drawFrame);
}

// Start or restart game. Setup level's board and player blocks
function restartGame() {
  level = 0;
  restartLevel();
}

function restartLevel() {
  board = levels[level].board;
  boardRects = generateBoardRects();

  backgroundStyle = levels[level].backgroundStyle;
  backgroundImg = levels[level].backgroundImg;

  players[0].x = players[0].destX = levels[level].startingPositions[0][0];
  players[0].y = players[0].destY = levels[level].startingPositions[0][1];
  players[0].dir = DIRECTION.none;
  players[0].dead = false;

  players[1].x = players[1].destX = levels[level].startingPositions[1][0];
  players[1].y = players[1].destY = levels[level].startingPositions[1][1];
  players[1].dir = DIRECTION.none;
  players[1].dead = false;

  wonGame = false;
  gamePaused = false;
}

function tryNextLevel() {
  if (wonGame) {
    level = (level + 1) % levels.length;
    restartLevel();
  }
}

// Listen for keypresses for movement and fullscreen
document.addEventListener('keydown', function(e) {
  switch (e.keyCode) {
    case 13: // ENTER
      e.preventDefault();
      if (players[0].dead || players[1].dead) {
        restartLevel();
      } else {
        tryNextLevel();
      }
      break;
    case 70: // f
      e.preventDefault();
      enterFullscreen();
      break;
    case 87: // w
      e.preventDefault();
      inputDirection(players[0], DIRECTION.up);
      break;
    case 68: // d
      e.preventDefault();
      inputDirection(players[0], DIRECTION.right);
      break;
    case 83: // s
      e.preventDefault();
      inputDirection(players[0], DIRECTION.down);
      break;
    case 65: // a
      e.preventDefault();
      inputDirection(players[0], DIRECTION.left);
      break;
    case 38: // up
      e.preventDefault();
      inputDirection(players[1], DIRECTION.up);
      break;
    case 39: // right
      e.preventDefault();
      inputDirection(players[1], DIRECTION.right);
      break;
    case 40: // down
      e.preventDefault();
      inputDirection(players[1], DIRECTION.down);
      break;
    case 37: // left
      e.preventDefault();
      inputDirection(players[1], DIRECTION.left);
      break;
    case 32: // space
      e.preventDefault();
      startPause();
      break;
    case 82: // r
      e.preventDefault();
      restartLevel();
      break;
  }
}, false);


// Listen for keyup on space for unpause
document.addEventListener('keyup', function(e) {
  switch (e.keyCode) {
    case 32: // space
      e.preventDefault();
      endPause();
      break;
  }
}, false);

// If device is touch capable
if (Modernizr.touch) {
  // Resize to fit screen
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  X_SCALE = 25 / BLOCK_WIDTH;
  BLOCK_WIDTH = 25;

  Y_SCALE = 25 / BLOCK_HEIGHT;
  BLOCK_HEIGHT = 25;

  // Prevent scrolling on touchmove
  document.addEventListener('touchmove', function(e) {
    e.preventDefault();
  }, false);

  // Capture new touches on the blocks
  document.addEventListener('touchstart', function(e) {
    e.preventDefault();
    var touches = e.changedTouches;

    // Freeze blocks while the player is touching the screen
    startPause();

    // Advance to the next level if complete
    tryNextLevel();

    // If dead, restart
    if (players[0].dead || players[1].dead) {
      restartLevel();
    }

    // Handle all new touches
    for (var i = 0; i < touches.length; i++) {
      for (var j = 0; j < players.length; j++) {
        var pos = currentPlayerPosAfterCamera(players[j], lastUpdate);
        // If the touch is inside a player block, plus or minus BLOCK_WIDTH/2
        if (touches[i].pageX > pos.x - BLOCK_WIDTH/2 && touches[i].pageX < pos.x + BLOCK_WIDTH + BLOCK_WIDTH/2&&
          touches[i].pageY > pos.y - BLOCK_WIDTH/2 && touches[i].pageY < pos.y + BLOCK_HEIGHT + BLOCK_WIDTH/2) {

          // Add the touch to the list of current touches
          currentTouches[touches[i].identifier] = {
            touch: touches[i],
            player: j
          };
        }
      }
    }
  }, false);

  // Capture finished touches
  document.addEventListener('touchend', function(e) {
    e.preventDefault();
    var touches = e.changedTouches;

    for (var i = 0; i < touches.length; i++) {
      // Ignore the touch unless we added it to the list of current touches
      if (currentTouches[touches[i].identifier] !== undefined) {
        var player = currentTouches[touches[i].identifier].player;
        var start = currentTouches[touches[i].identifier].touch;
        var end = touches[i];

        // Send the player in the direction of the touch swipe
        // Choose whichever axis most of the movement is on
        // If the swipe length is less than one block, ignore it
        var dir = [(end.pageX - start.pageX) / BLOCK_WIDTH, (end.pageY - start.pageY) / BLOCK_WIDTH];
        if (dir[0] > 1 && Math.abs(dir[0]) > Math.abs(dir[1])) {
          inputDirection(players[player], DIRECTION.right);
        } else if (dir[0] < -1 && Math.abs(dir[0]) > Math.abs(dir[1])) {
          inputDirection(players[player], DIRECTION.left);
        } else if (dir[1] > 1 && Math.abs(dir[1]) > Math.abs(dir[0])) {
          inputDirection(players[player], DIRECTION.down);
        } else if (dir[1] < -1 && Math.abs(dir[1]) > Math.abs(dir[0])) {
          inputDirection(players[player], DIRECTION.up);
        }

        // Remove the ended touch
        delete currentTouches[touches[i].identifier];
      }
    }

    // Unpause if no remaining touches
    if (e.touches.length === 0) {
      endPause();
    }
  }, false);


  // Capture cancelled touches
  document.addEventListener('touchcancel', function(e) {
    e.preventDefault();
    var touches = e.changedTouches;

    // Remove the cancelled touches
    for (var i = 0; i < touches.length; i++) {
      if (currentTouches[touches[i].identifier] !== undefined) {
        delete currentTouches[touches[i].identifier];
      }
    }

    // Unpause if no remaining touches
    if (e.touches.length === 0) {
      endPause();
    }

  }, false);

}

// Start the game
// First load assets, then initialize and start
loadAssets(initGame);