// Constants
var BLOCK_WIDTH = 45;
var BLOCK_HEIGHT = 45;
var BLOCK_STYLE = 'rgb(200,0,0)';
var BLOCK_IMG_SRCS = ['img/block1.png', 'img/block2.png'];

var TUTORIALBG_SRC = 'img/tutorial.png';

var PLAYER_WIDTH = 15;
var PLAYER_HEIGHT = 15;
var PLAYER_SPEED = 10/1000;

var MOTION_BLUR_STEPS = 20;

var BACKGROUND_STYLE = 'rgb(255,255,255)';
var TEXT_FONT = '50pt Helvetica, Arial';
var FPS_TEXT_FONT = '12pt Helvetica, Arial';
var TEXT_STYLE = 'rgb(0,0,0)';
var CAMERA_WIDTH = 10;
var CAMERA_HEIGHT = 10;
var CAMERA_SPEED = 1/1000;
var CAMERA_X_OFFSET = 1080/2;
var CAMERA_Y_OFFSET = 1920/2;

// 2 player images, block images, and background (later audio too)
var TOTAL_ASSETS = 2 + BLOCK_IMG_SRCS.length + 1;

var DEATH_STYLE_FRAGMENT = 'rgba(200,0,0,';
var DEATH_SPEED = 1.5/1000;
var KEYPRESS_DELAY = 100;

var DIRECTION = {
  none: 0,
  up: 1,
  right: 2,
  down: 3,
  left: 4
};



// Canvas and state variables
var blockImgs = [];
var tutorialBg;

var wrapper = document.getElementById('game-wrapper');

// This is the visible on screen canvas
var canvas = document.getElementById('canvas');
var canvasCtx = canvas.getContext('2d');

// Create a second buffer to be blited onto the canvas
var buffer = document.createElement("canvas");
buffer.width = 4000;
buffer.height = 3000;
var ctx = buffer.getContext('2d');

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