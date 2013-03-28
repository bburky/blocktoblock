// Constants

var BLOCK_WIDTH = 45;
var BLOCK_HEIGHT = 45;
var BLOCK_IMG_SRCS = ['img/block1.png', 'img/block3.png', 'img/block5.png', 'img/block7.png'];

var TUTORIALBG_SRC = 'img/tutorial.png';

var SND_HIT_SRC = 'snd/ToneWobble.mp3|snd/ToneWobble.ogg';
var SND_HIT_PLAYER_SRC = 'snd/Game-Shot.mp3|snd/Game-Shot.ogg';

var BACKGROUND_STYLE = 'rgb(41,171,226)';

var TEXT_FONT = '50pt Helvetica, Arial';
var SMALL_TEXT_FONT = '12pt Helvetica, Arial';
var TEXT_STYLE = 'rgb(0,0,0)';

var PLAYER_SPEED = 10/1000;

var MOTION_BLUR_STEPS = 20;

// 2 player images, block images, background image and 2 sound effects
var TOTAL_ASSETS = 2 + BLOCK_IMG_SRCS.length + 1 + 2;

var DEATH_STYLE_FRAGMENT = 'rgba(200,0,0,';
var DEATH_SPEED = 1.5/1000;

var WIN_STYLE_FRAGMENT = 'rgba(0,0,200,';
var WIN_SPEED = 1.5/1000;

var KEYPRESS_DELAY = 100;

var DIRECTION = {
  none: 0,
  up: 1,
  right: 2,
  down: 3,
  left: 4
};



// Canvas and state variables

// This is the visible on screen canvas
var canvas = document.getElementById('canvas');
var canvasCtx = canvas.getContext('2d');

// Create a second buffer to be blited onto the canvas
var buffer = document.createElement("canvas");
buffer.width = 4000;
buffer.height = 3000;
var ctx = buffer.getContext('2d');

// Div wrapper element of canvas
var wrapper = document.getElementById('game-wrapper');

// Image instances
var blockImgs = [];
var tutorialBg;

// Sound instances
var hitSnd;
var hitPlayerSnd;

// Are blocks frozen
var gamePaused = false;

// Has the game been won
var wonGame = false;
var winAnimStart;
var winAnimEnd;


// FPS data
var fps = 0.0;
var lastUpdate;
var started = false;

// Player state data
var players = [{
    x: 8,
    y: 8,
    destX: 8,
    destY: 8,
    dir: DIRECTION.none,
    dead: false,
    imgSrc: 'img/player1.png'
  }, {
    x: 12,
    y: 8,
    destX: 12,
    destY: 8,
    dir: DIRECTION.none,
    dead: false,
    imgSrc: 'img/player2.png'
  }];

// Camera position state data
var camera = {
  x: 0,
  y: 0,
  destX: 0,
  destY: 0
};

// Actual board. A dictionary with coordinate keys
var boardRects;

// Board array in board.js with initialization data