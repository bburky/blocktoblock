// Constants

var MIN_WIDTH = 800;
var MIN_HEIGHT = 600;
var X_SCALE = 1.0;
var Y_SCALE = 1.0;
var MAX_BLOCK_WIDTH = 45;
var MAX_BLOCK_HEIGHT = 45;
var BLOCK_WIDTH = MAX_BLOCK_WIDTH;
var BLOCK_HEIGHT = MAX_BLOCK_HEIGHT;
var BLOCK_IMG_SRCS = ['img/block1.png', 'img/block5.png', 'img/block7.png'];
var BLOCK_GOAL_IMG_SRC = 'img/blockGoal.png';

var SND_HIT = {id:'hit', src:'snd/ToneWobble.ogg'};
var SND_HIT_ID = 'hit';
var SND_HIT_PLAYER = {id:'hit_player', src:'snd/Game-Shot.ogg'};
var SND_HIT_PLAYER_ID = 'hit_player';

var TEXT_FONT = '50pt Helvetica, Arial';
var SMALL_TEXT_FONT = '12pt Helvetica, Arial';
var TEXT_STYLE = 'rgb(0,0,0)';

var PLAYER_SPEED = 10/1000;

var MOTION_BLUR_STEPS = 20;

// 2 player images, block images, 2 sound effects, and 1 background image per level
var TOTAL_ASSETS = 2 + BLOCK_IMG_SRCS.length + 2 + levels.length;

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
buffer.width = 2000;
buffer.height = 2000;
var ctx = buffer.getContext('2d');

// Div wrapper element of canvas
var wrapper = document.getElementById('game-wrapper');

// Image instances
var blockImgs = [];
var blockGoalImg;
var backgroundImg;
var backgroundStyle;

// Sound instances
var hitSnd;
var hitPlayerSnd;

// Are blocks frozen
var gamePaused;

// Has the game been won
var wonGame;
var winAnimStart;
var winAnimEnd;


// FPS data
var fps = 0.0;
var lastUpdate;

// Player state data
var players = [{
    x: 0,
    y: 0,
    destX: 0,
    destY: 0,
    dir: DIRECTION.none,
    dead: false,
    imgSrc: 'img/player1.png'
  }, {
    x: 1,
    y: 0,
    destX: 1,
    destY: 0,
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
// Array of board initialization data
var board;

// Current touches on screen
var currentTouches = {};
