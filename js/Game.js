/* jslint browser:true */
/* global Phaser:false, BlockToBlock */

(function () {
    "use strict";

    BlockToBlock.Game = function (game) {
        this.game = game;

        this.levelComplete = false;

        this.blurX = null;
        this.blurY = null;

        this.upKey = null;
        this.downKey = null;
        this.leftKey = null;
        this.rightKey = null;
        this.wKey = null;
        this.aKey = null;
        this.sKey = null;
        this.dKey = null;
        this.rKey = null;

        this.soundHitBlock = null;
        this.soundHitPlayer = null;

        this.backgroundSprite = null;

        this.players = null;
        this.blocks = null;

        this.player1 = null;
        this.player2 = null;

        this.collidingPlayer = null;
    };

    // Shortcut
    var Game = BlockToBlock.Game;

    // Constants
    Game.STATE = 'game';

    Game.BLOCK_SIZE = 45;
    Game.BORDER_WIDTH = 10;
    Game.PLAYER_SPEED = Game.BLOCK_SIZE * 2.25;
    Game.DIRECTION = {
        none: 0,
        up: 1,
        right: 2,
        down: 3,
        left: 4
    };
    Game.BLOCK_IMAGES = ['block-blue', 'block-red', 'block-green'];

    Game.LEVEL_NORMAL_BLOCK = 2;
    Game.LEVEL_GOAL_BLOCK = 1;

    // Static variables
    Game.level = 0;

    Game.prototype = {

        preload: function () {
            var i;

            this.game.load.script('filterX', 'js/BlurX.js');
            this.game.load.script('filterY', 'js/BlurY.js');

            this.game.load.image('player-1', 'img/player-1-border.png');
            this.game.load.image('player-2', 'img/player-2-border.png');
            this.game.load.image('block-blue', 'img/block-blue.png');
            this.game.load.image('block-red', 'img/block-red.png');
            this.game.load.image('block-green', 'img/block-green.png');
            this.game.load.image('block-goal', 'img/block-goal.png');
            this.game.load.audio('hit-block', ['snd/ToneWobble.mp3', 'snd/ToneWobble.ogg']);
            this.game.load.audio('hit-player', ['snd/Game-Shot.mp3', 'snd/Game-Shot.ogg']);

            for (i = 0; i < BlockToBlock.levels.length; i++) {
                this.game.load.image(
                    BlockToBlock.levels[i].backgroundImgSrc,
                    BlockToBlock.levels[i].backgroundImgSrc
                );
            }
        },

        create: function () {
            var block;

            this.blurX = this.game.add.filter('BlurX');
            this.blurY = this.game.add.filter('BlurY');

            this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
            this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
            this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
            this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
            this.wKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
            this.dKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
            this.aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
            this.sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
            this.rKey = this.game.input.keyboard.addKey(Phaser.Keyboard.R);

            this.soundHitBlock = this.game.add.audio('hit-block');
            this.soundHitPlayer = this.game.add.audio('hit-player');

            document.body.style.background = BlockToBlock.levels[Game.level].backgroundStyle;
            this.game.stage.backgroundColor = BlockToBlock.levels[Game.level].backgroundStyle;

            this.backgroundSprite = this.game.add.sprite(0, 0, BlockToBlock.levels[Game.level].backgroundImgSrc);
            this.backgroundSprite.centerOn(this.game.width / 2, this.game.height / 2);
            var offset = {
                x: this.backgroundSprite.x,
                y: this.backgroundSprite.y
            };
            this.game.world.bounds.x = this.backgroundSprite.x;
            this.game.world.bounds.y = this.backgroundSprite.y;
            this.game.world.bounds.width = this.backgroundSprite.width;
            this.game.world.bounds.height = this.backgroundSprite.height;

            this.blocks = this.game.add.group();
            this.players = this.game.add.group();

            this.levelComplete = false;

            this.player1 = this.players.create(offset.x + Game.BLOCK_SIZE * BlockToBlock.levels[Game.level].startingPositions[0][0] - Game.BORDER_WIDTH, offset.y + Game.BLOCK_SIZE * BlockToBlock.levels[Game.level].startingPositions[0][1] - Game.BORDER_WIDTH, 'player-1', this.players);
            this.player1.crop = new Phaser.Rectangle(-5, -5, this.player1.width + 5, this.player1.height + 5);
            this.player1.events.onOutOfBounds.add(this.outOfBounds, this);
            this.player1.name = 'player left';
            this.player1.destination = new Phaser.Point(this.player1.x, this.player1.y);
            this.player1.direction = Game.DIRECTION.none;
            this.player1.prevDirection = Game.DIRECTION.none;
            this.player1.moving = false;

            this.player2 = this.players.create(offset.x + Game.BLOCK_SIZE * BlockToBlock.levels[Game.level].startingPositions[1][0] - Game.BORDER_WIDTH, offset.y + Game.BLOCK_SIZE * BlockToBlock.levels[Game.level].startingPositions[1][1] - Game.BORDER_WIDTH, 'player-2', this.players);
            this.player2.events.onOutOfBounds.add(this.outOfBounds, this);
            this.player2.name = 'player right';
            this.player2.destination = new Phaser.Point(this.player2.x, this.player2.y);
            this.player2.direction = Game.DIRECTION.none;
            this.player2.prevDirection = Game.DIRECTION.none;
            this.player2.moving = false;

            for (var i = 0; i < BlockToBlock.levels[Game.level].board.length; i++) {
                for (var j = 0; j < BlockToBlock.levels[Game.level].board[i].length; j++) {
                    if (BlockToBlock.levels[Game.level].board[i][j] === Game.LEVEL_NORMAL_BLOCK) {
                        block = this.blocks.create(offset.x + Game.BLOCK_SIZE * j, offset.y + Game.BLOCK_SIZE * i, Game.BLOCK_IMAGES[(i + j) % Game.BLOCK_IMAGES.length]);
                        block.goal = false;
                    } else if (BlockToBlock.levels[Game.level].board[i][j] === Game.LEVEL_GOAL_BLOCK) {
                        block = this.blocks.create(offset.x + Game.BLOCK_SIZE * j, offset.y + Game.BLOCK_SIZE * i, 'block-goal');
                        block.goal = true;
                    }
                }
            }

            this.collidingPlayer = null;

            // FIXME: These aren't cleared when starting the state?
            this.game.input.keyboard.callbackContext = null;
            this.game.input.keyboard.onUpCallback = null;
        },

        update: function () {
            var i, newPosition, text, style, t;

            if (!this.levelComplete) {

                if (this.rKey.isDown) {
                    this.game.state.start(Game.STATE);
                }

                if (this.player1.direction === Game.DIRECTION.none) {
                    if (this.wKey.isDown && this.player1.prevDirection !== Game.DIRECTION.up) {
                        this.player1.prevDirection = this.player1.direction = Game.DIRECTION.up;
                    } else if (this.sKey.isDown && this.player1.prevDirection !== Game.DIRECTION.down) {
                        this.player1.prevDirection = this.player1.direction = Game.DIRECTION.down;
                    } else if (this.aKey.isDown && this.player1.prevDirection !== Game.DIRECTION.left) {
                        this.player1.prevDirection = this.player1.direction = Game.DIRECTION.left;
                    } else if (this.dKey.isDown && this.player1.prevDirection !== Game.DIRECTION.right) {
                        this.player1.prevDirection = this.player1.direction = Game.DIRECTION.right;
                    }
                }
                if (this.wKey.isUp && this.player1.prevDirection === Game.DIRECTION.up) {
                    this.player1.prevDirection = Game.DIRECTION.none;
                }
                if (this.sKey.isUp && this.player1.prevDirection === Game.DIRECTION.down) {
                    this.player1.prevDirection = Game.DIRECTION.none;
                }
                if (this.aKey.isUp && this.player1.prevDirection === Game.DIRECTION.left) {
                    this.player1.prevDirection = Game.DIRECTION.none;
                }
                if (this.dKey.isUp && this.player1.prevDirection === Game.DIRECTION.right) {
                    this.player1.prevDirection = Game.DIRECTION.none;
                }

                if (this.player2.direction === Game.DIRECTION.none) {
                    if (this.upKey.isDown && this.player2.prevDirection !== Game.DIRECTION.up) {
                        this.player2.prevDirection = this.player2.direction = Game.DIRECTION.up;
                    } else if (this.downKey.isDown && this.player2.prevDirection !== Game.DIRECTION.down) {
                        this.player2.prevDirection = this.player2.direction = Game.DIRECTION.down;
                    } else if (this.leftKey.isDown && this.player2.prevDirection !== Game.DIRECTION.left) {
                        this.player2.prevDirection = this.player2.direction = Game.DIRECTION.left;
                    } else if (this.rightKey.isDown && this.player2.prevDirection !== Game.DIRECTION.right) {
                        this.player2.prevDirection = this.player2.direction = Game.DIRECTION.right;
                    }
                }
                if (this.upKey.isUp && this.player2.prevDirection === Game.DIRECTION.up) {
                    this.player2.prevDirection = Game.DIRECTION.none;
                }
                if (this.downKey.isUp && this.player2.prevDirection === Game.DIRECTION.down) {
                    this.player2.prevDirection = Game.DIRECTION.none;
                }
                if (this.leftKey.isUp && this.player2.prevDirection === Game.DIRECTION.left) {
                    this.player2.prevDirection = Game.DIRECTION.none;
                }
                if (this.rightKey.isUp && this.player2.prevDirection === Game.DIRECTION.right) {
                    this.player2.prevDirection = Game.DIRECTION.none;
                }


                for (i = 0; i < this.players.length; i++) {
                    var player = this.players.getAt(i);
                    if (!player.moving) {
                        switch (player.direction) {
                        case Game.DIRECTION.up:
                            newPosition = new Phaser.Point(player.x, player.y - Game.BLOCK_SIZE);
                            this.goToPoint(player, newPosition);
                            break;

                        case Game.DIRECTION.down:
                            newPosition = new Phaser.Point(player.x, player.y + Game.BLOCK_SIZE);
                            this.goToPoint(player, newPosition);
                            break;

                        case Game.DIRECTION.left:
                            newPosition = new Phaser.Point(player.x - Game.BLOCK_SIZE, player.y);
                            this.goToPoint(player, newPosition);
                            break;

                        case Game.DIRECTION.right:
                            newPosition = new Phaser.Point(player.x + Game.BLOCK_SIZE, player.y);
                            this.goToPoint(player, newPosition);
                            break;
                        }
                    }
                }

                if (this.countLivingGoalBlocks() === 0) {
                    this.levelComplete = true;

                    text = "Level Complete";
                    if (Game.level === BlockToBlock.levels.length - 1) {
                        text = "You Win!";
                    }
                    style = {
                        font: "72px Arial",
                        fill: "#ff0044",
                        align: "center"
                    };
                    t = this.game.add.text(this.game.camera.width / 2, this.game.camera.height / 2, text, style);
                    t.anchor.setTo(0.5, 1);

                    var remainingBlocks = this.blocks.countLiving();
                    if (remainingBlocks !== 0) {
                        text = "You missed " + remainingBlocks + " blocks";
                        style = {
                            font: "36px Arial",
                            fill: "#ff0044",
                            align: "center"
                        };
                        t = this.game.add.text(this.game.camera.width / 2, this.game.camera.height / 2 + 54, text, style);
                        t.anchor.setTo(0.5, 1);
                    }

                    text = "Press any key to continue";
                    if (Game.level === BlockToBlock.levels.length - 1) {
                        text = "Press any key to restart game";
                    }
                    style = {
                        font: "36px Arial",
                        fill: "#ff0044",
                        align: "center"
                    };
                    t = this.game.add.text(this.game.camera.width / 2, this.game.camera.height / 2 + (remainingBlocks === 0 ? 0 : 54) + 54, text, style);
                    t.anchor.setTo(0.5, 1);

                    // TODO: this really should be onDown and verify that all other keys are up
                    this.game.input.keyboard.callbackContext = this;
                    this.game.input.keyboard.onUpCallback = function (e) {
                        // Ignore the onUp if it's the player releasing the direction
                        if (this.player1.prevDirection !== Game.DIRECTION.none || this.player2.prevDirection !== Game.DIRECTION.none) {
                            // FIXME: This only sort of works if the player holds down two directions and releases both during restart?
                            this.player1.prevDirection = Game.DIRECTION.none;
                            this.player2.prevDirection = Game.DIRECTION.none;
                            return;
                        }

                        // If the key was restart, don't advance levels
                        if (e.keyCode === Phaser.Keyboard.R) {
                            this.game.state.start(Game.STATE);
                            return;
                        }

                        Game.level = (Game.level + 1) % BlockToBlock.levels.length;
                        this.game.state.start(Game.STATE);
                    };
                    // TODO: This really should have a separate callback
                    this.game.input.onUp.addOnce(this.game.input.keyboard.onUpCallback, this);
                }

                this.game.camera.focusOnXY((this.player1.x + this.player2.x) / 2, (this.player1.y + this.player2.y) / 2);
            }
        },

        goToPoint: function (player, point) {
            // using global collidingPlayer
            var i, collidingBlock;

            for (i = 0; i < this.blocks.length; i++) {
                var block = this.blocks.getAt(i);
                if (block.alive) {
                    if (block.x === point.x + Game.BORDER_WIDTH && block.y === point.y + Game.BORDER_WIDTH) {
                        collidingBlock = block;
                        break;
                    }
                }
            }

            for (i = 0; i < this.players.length; i++) {
                var otherPlayer = this.players.getAt(i);
                if (otherPlayer !== player) {
                    if (otherPlayer.direction !== player.direction && otherPlayer.destination.equals(point)) {
                        this.collidingPlayer = otherPlayer;
                        break;
                    }
                }
            }

            player.moving = true;
            player.destination = point;
            if (this.game.renderType === Phaser.WEBGL) {
                if (player.direction === Game.DIRECTION.up || player.direction === Game.DIRECTION.down) {
                    player.filters = [this.blurY];
                } else {
                    player.filters = [this.blurX];
                }
            }
            var tween = this.game.add.tween(player);
            tween.to({
                x: point.x,
                y: point.y
            }, Game.PLAYER_SPEED);
            tween.onComplete.add(function () {
                player.moving = false;
                player.filters = undefined;

                if (collidingBlock) {
                    collidingBlock.kill(); // Note that if both players hit the same block, then it will be killed twice
                    player.direction = Game.DIRECTION.none;
                    this.soundHitBlock.play();
                }

                // This may have been set by the other player
                if (this.collidingPlayer) {
                    player.direction = Game.DIRECTION.none;
                    if (this.collidingPlayer !== player) {
                        this.collidingPlayer = undefined;
                        this.soundHitPlayer.play();
                    }
                }
            }, this);
            tween.start();
        },

        outOfBounds: function () {
            var text, style, t;

            this.levelComplete = true;
            this.game.tweens.removeAll();

            // Blend from the current background color to #F00 65% interpolated
            var originalBackground = this.parseBackgroundColor();
            var tween = this.game.add.tween({
                percent: 0.0
            });
            tween.to({
                percent: 65.0
            }, Game.PLAYER_SPEED * 6);
            tween.onUpdateCallback(function (tween) {
                var percent = tween._object.percent; // XXX: _object is undocumented
                var color = Phaser.Color.RGBtoWebstring(Phaser.Color.interpolateColor(originalBackground, 0xFF0000, 100, percent, 0));
                document.body.style.background = color;
                this.game.stage.backgroundColor = color;
            }, this);
            tween.start();


            text = "Game Over";
            style = {
                font: "72px Arial",
                fill: "#ff0044",
                align: "center"
            };
            t = this.game.add.text(this.game.camera.width / 2, this.game.camera.height / 2, text, style);
            t.fixedToCamera = true;
            t.anchor.setTo(0.5, 1);

            text = "Press R to restart";
            style = {
                font: "36px Arial",
                fill: "#ff0044",
                align: "center"
            };
            t = this.game.add.text(this.game.camera.width / 2, this.game.camera.height / 2 + 54, text, style);
            t.fixedToCamera = true;
            t.anchor.setTo(0.5, 1);

            // TODO: this really should be onDown and verify that all other keys are up
            this.game.input.keyboard.callbackContext = this;
            this.game.input.keyboard.onUpCallback = function () {
                // Ignore the onUp if it's the player releasing the direction
                if (this.player1.prevDirection !== Game.DIRECTION.none || this.player2.prevDirection !== Game.DIRECTION.none) {
                    // FIXME: This only sort of works if the player holds down two directions and releases both during restart?
                    // Really want to check that all keys are up
                    this.player1.prevDirection = Game.DIRECTION.none;
                    this.player2.prevDirection = Game.DIRECTION.none;
                    return;
                }

                this.game.state.start(Game.STATE);
            };
            // Don't restart level untill all keys released
            this.game.input.onUp.addOnce(this.game.input.keyboard.onUpCallback, this);
        },

        countLivingGoalBlocks: function () {
            var count = 0;
            for (var i = 0; i < this.blocks.length; i++) {
                var block = this.blocks.getAt(i);
                if (block.alive && block.goal) {
                    count++;
                }
            }
            return count;
        },

        parseBackgroundColor: function () {
            var m = getComputedStyle(document.body).backgroundColor.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
            if (m) {
                return parseInt(m[1], 10) << 8 * 2 | parseInt(m[2], 10) << 8 | parseInt(m[3], 10);
            } else {
                throw new Error("Color could not be parsed");
            }
        },
    };
})();