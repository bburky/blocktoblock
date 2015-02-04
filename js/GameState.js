/* jslint browser:true */
/* global Phaser:false, BlockToBlock */

(function () {
    "use strict";

    BlockToBlock.GameState = function (game) {
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
    };

    // Shortcut
    var GameState = BlockToBlock.GameState;

    // Constants
    GameState.STATE = 'game';

    GameState.BLOCK_SIZE = 45;
    GameState.PLAYER_SPEED = GameState.BLOCK_SIZE * 2.25;
    GameState.DIRECTION = {
        none: 0,
        up: 1,
        right: 2,
        down: 3,
        left: 4
    };
    GameState.BLOCK_IMAGES = ['block-blue', 'block-red', 'block-green'];

    GameState.LEVEL_NORMAL_BLOCK = 2;
    GameState.LEVEL_GOAL_BLOCK = 1;

    // Static variables
    GameState.level = 0;

    GameState.prototype = {

        preload: function () {
            this.game.load.script('filterX', 'js/BlurX.js');
            this.game.load.script('filterY', 'js/BlurY.js');

            this.game.load.image('player-1', 'img/player-1-border.png');
            this.game.load.image('player-2', 'img/player-2-border.png');
            this.game.load.image('block-blue', 'img/block-blue.png');
            this.game.load.image('block-red', 'img/block-red.png');
            this.game.load.image('block-green', 'img/block-green.png');
            this.game.load.image('block-blue-arrow', 'img/block-blue-arrow.png');
            this.game.load.image('block-red-arrow', 'img/block-red-arrow.png');
            this.game.load.image('block-green-arrow', 'img/block-green-arrow.png');
            this.game.load.image('block-goal', 'img/block-goal.png');
            this.game.load.audio('hit-block', ['snd/ToneWobble.mp3', 'snd/ToneWobble.ogg']);
            this.game.load.audio('hit-player', ['snd/Game-Shot.mp3', 'snd/Game-Shot.ogg']);

            for (var i = 0; i < BlockToBlock.levels.length; i++) {
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

            document.body.style.background = BlockToBlock.levels[GameState.level].backgroundStyle;
            this.game.stage.backgroundColor = BlockToBlock.levels[GameState.level].backgroundStyle;

            this.backgroundSprite = this.game.add.sprite(0, 0, BlockToBlock.levels[GameState.level].backgroundImgSrc);
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

            this.player1 = new BlockToBlock.Player(
                this,
                offset.x + GameState.BLOCK_SIZE * BlockToBlock.levels[GameState.level].startingPositions[0][0],
                offset.y + GameState.BLOCK_SIZE * BlockToBlock.levels[GameState.level].startingPositions[0][1],
                'player-1'
            );
            this.players.add(this.player1);

            this.player2 = new BlockToBlock.Player(
                this,
                offset.x + GameState.BLOCK_SIZE * BlockToBlock.levels[GameState.level].startingPositions[1][0],
                offset.y + GameState.BLOCK_SIZE * BlockToBlock.levels[GameState.level].startingPositions[1][1],
                'player-2'
            );
            this.players.add(this.player2);

            for (var i = 0; i < BlockToBlock.levels[GameState.level].board.length; i++) {
                for (var j = 0; j < BlockToBlock.levels[GameState.level].board[i].length; j++) {
                    if (BlockToBlock.levels[GameState.level].board[i][j] === GameState.LEVEL_NORMAL_BLOCK) {
                        block = new BlockToBlock.Block(
                            this,
                            offset.x + GameState.BLOCK_SIZE * j,
                            offset.y + GameState.BLOCK_SIZE * i,
                            GameState.BLOCK_IMAGES[(i + j) % GameState.BLOCK_IMAGES.length],
                            this.soundHitBlock
                        );
                        this.blocks.add(block);
                    } else if (BlockToBlock.levels[GameState.level].board[i][j] === GameState.LEVEL_GOAL_BLOCK) {
                        block = new BlockToBlock.GoalBlock(
                            this,
                            offset.x + GameState.BLOCK_SIZE * j,
                            offset.y + GameState.BLOCK_SIZE * i,
                            this.soundHitBlock
                        );
                        this.blocks.add(block);
                    } else if (BlockToBlock.levels[GameState.level].board[i][j] === 3) {
                        // TODO: make better
                        block = new BlockToBlock.BounceBlock(
                            this,
                            offset.x + GameState.BLOCK_SIZE * j,
                            offset.y + GameState.BLOCK_SIZE * i,
                            GameState.BLOCK_IMAGES[(i + j) % GameState.BLOCK_IMAGES.length] + '-arrow',
                            this.soundHitBlock,
                            GameState.DIRECTION.right
                        );
                        this.blocks.add(block);
                    }
                }
            }

            // FIXME: These aren't cleared when starting the state?
            this.game.input.keyboard.callbackContext = null;
            this.game.input.keyboard.onUpCallback = null;
        },

        update: function () {
            var text, style, t;

            if (!this.levelComplete) {

                if (this.rKey.isDown) {
                    this.game.state.start(GameState.STATE);
                }

                if (this.player1.direction === GameState.DIRECTION.none) {
                    if (this.wKey.isDown && this.player1.prevDirection !== GameState.DIRECTION.up) {
                        this.player1.prevDirection = this.player1.direction = GameState.DIRECTION.up;
                    } else if (this.sKey.isDown && this.player1.prevDirection !== GameState.DIRECTION.down) {
                        this.player1.prevDirection = this.player1.direction = GameState.DIRECTION.down;
                    } else if (this.aKey.isDown && this.player1.prevDirection !== GameState.DIRECTION.left) {
                        this.player1.prevDirection = this.player1.direction = GameState.DIRECTION.left;
                    } else if (this.dKey.isDown && this.player1.prevDirection !== GameState.DIRECTION.right) {
                        this.player1.prevDirection = this.player1.direction = GameState.DIRECTION.right;
                    }
                }
                if (this.wKey.isUp && this.player1.prevDirection === GameState.DIRECTION.up) {
                    this.player1.prevDirection = GameState.DIRECTION.none;
                }
                if (this.sKey.isUp && this.player1.prevDirection === GameState.DIRECTION.down) {
                    this.player1.prevDirection = GameState.DIRECTION.none;
                }
                if (this.aKey.isUp && this.player1.prevDirection === GameState.DIRECTION.left) {
                    this.player1.prevDirection = GameState.DIRECTION.none;
                }
                if (this.dKey.isUp && this.player1.prevDirection === GameState.DIRECTION.right) {
                    this.player1.prevDirection = GameState.DIRECTION.none;
                }

                if (this.player2.direction === GameState.DIRECTION.none) {
                    if (this.upKey.isDown && this.player2.prevDirection !== GameState.DIRECTION.up) {
                        this.player2.prevDirection = this.player2.direction = GameState.DIRECTION.up;
                    } else if (this.downKey.isDown && this.player2.prevDirection !== GameState.DIRECTION.down) {
                        this.player2.prevDirection = this.player2.direction = GameState.DIRECTION.down;
                    } else if (this.leftKey.isDown && this.player2.prevDirection !== GameState.DIRECTION.left) {
                        this.player2.prevDirection = this.player2.direction = GameState.DIRECTION.left;
                    } else if (this.rightKey.isDown && this.player2.prevDirection !== GameState.DIRECTION.right) {
                        this.player2.prevDirection = this.player2.direction = GameState.DIRECTION.right;
                    }
                }
                if (this.upKey.isUp && this.player2.prevDirection === GameState.DIRECTION.up) {
                    this.player2.prevDirection = GameState.DIRECTION.none;
                }
                if (this.downKey.isUp && this.player2.prevDirection === GameState.DIRECTION.down) {
                    this.player2.prevDirection = GameState.DIRECTION.none;
                }
                if (this.leftKey.isUp && this.player2.prevDirection === GameState.DIRECTION.left) {
                    this.player2.prevDirection = GameState.DIRECTION.none;
                }
                if (this.rightKey.isUp && this.player2.prevDirection === GameState.DIRECTION.right) {
                    this.player2.prevDirection = GameState.DIRECTION.none;
                }


                for (var i = 0; i < this.players.length; i++) {
                    this.updatePlayer(this.players.getAt(i));
                }

                if (this.countLivingGoalBlocks() === 0) {
                    this.levelComplete = true;
                    this.game.tweens.removeAll();

                    text = "Level Complete";
                    if (GameState.level === BlockToBlock.levels.length - 1) {
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
                    if (GameState.level === BlockToBlock.levels.length - 1) {
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
                        if (this.player1.prevDirection !== GameState.DIRECTION.none || this.player2.prevDirection !== GameState.DIRECTION.none) {
                            // FIXME: This only sort of works if the player holds down two directions and releases both during restart?
                            this.player1.prevDirection = GameState.DIRECTION.none;
                            this.player2.prevDirection = GameState.DIRECTION.none;
                            return;
                        }

                        // If the key was restart, don't advance levels
                        if (e.keyCode === Phaser.Keyboard.R) {
                            this.game.state.start(GameState.STATE);
                            return;
                        }

                        GameState.level = (GameState.level + 1) % BlockToBlock.levels.length;
                        this.game.state.start(GameState.STATE);
                    };
                    // TODO: This really should have a separate callback
                    this.game.input.onUp.addOnce(this.game.input.keyboard.onUpCallback, this);
                }

                this.game.camera.focusOnXY((this.player1.x + this.player2.x) / 2, (this.player1.y + this.player2.y) / 2);
            }
        },

        updatePlayer: function (player) {
            var i;

            if (player.moving || player.direction === GameState.DIRECTION.none) {
                // Don't need to update already moving or stationary players
                return;
            }

            switch (player.direction) {
            case GameState.DIRECTION.up:
                player.destination = new Phaser.Point(player.x, player.y - GameState.BLOCK_SIZE);
                break;

            case GameState.DIRECTION.down:
                player.destination = new Phaser.Point(player.x, player.y + GameState.BLOCK_SIZE);
                break;

            case GameState.DIRECTION.left:
                player.destination = new Phaser.Point(player.x - GameState.BLOCK_SIZE, player.y);
                break;

            case GameState.DIRECTION.right:
                player.destination = new Phaser.Point(player.x + GameState.BLOCK_SIZE, player.y);
                break;
            }

            for (i = 0; i < this.blocks.length; i++) {
                var block = this.blocks.getAt(i);
                if (block.alive) {
                    if (block.x === player.destination.x && block.y === player.destination.y) {
                        var collidingBlock = block;
                        break;
                    }
                }
            }

            for (i = 0; i < this.players.length; i++) {
                var otherPlayer = this.players.getAt(i);
                if (otherPlayer !== player) {
                    if (otherPlayer.direction !== player.direction && otherPlayer.destination.equals(player.destination)) {
                        var collidingPlayer = otherPlayer;
                        collidingPlayer.direction = GameState.DIRECTION.none;
                        break;
                    }
                }
            }

            player.moving = true;
            if (this.game.renderType === Phaser.WEBGL) {
                if (player.direction === GameState.DIRECTION.up || player.direction === GameState.DIRECTION.down) {
                    player.filters = [this.blurY];
                } else {
                    player.filters = [this.blurX];
                }
            }
            var tween = this.game.add.tween(player);
            tween.to({
                x: player.destination.x,
                y: player.destination.y
            }, GameState.PLAYER_SPEED);
            tween.onComplete.add(function () {
                player.moving = false;
                player.filters = null;

                // This may have been set by the other player
                if (collidingPlayer) {
                    player.filters = null; // Potentially a block's onKilled set this
                    player.direction = GameState.DIRECTION.none;
                    this.soundHitPlayer.play();
                }

                if (collidingBlock) {
                    player.direction = GameState.DIRECTION.none;
                    collidingBlock.killedBy = player;
                    collidingBlock.kill(); // Note that if both players hit the same block, then it will be killed twice
                }

                tween = null;
            }, this);
            tween.start();
        },

        outOfBounds: function () {
            var text, style, t;

            if (this.levelComplete) {
                // The player managed to lose during level complete, ignore the game over
                return;
            }

            this.levelComplete = true;
            this.game.tweens.removeAll();

            // Blend from the current background color to #F00 65% interpolated
            var originalBackground = this.parseBackgroundColor();
            var tween = this.game.add.tween({
                percent: 0.0
            });
            tween.to({
                percent: 65.0
            }, GameState.PLAYER_SPEED * 6);
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
                if (this.player1.prevDirection !== GameState.DIRECTION.none || this.player2.prevDirection !== GameState.DIRECTION.none) {
                    // FIXME: This only sort of works if the player holds down two directions and releases both during restart?
                    // Really want to check that all keys are up
                    this.player1.prevDirection = GameState.DIRECTION.none;
                    this.player2.prevDirection = GameState.DIRECTION.none;
                    return;
                }

                this.game.state.start(GameState.STATE);
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