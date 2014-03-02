/* jslint browser:true */
/* global Phaser:false, BlockToBlock */

(function () {
    "use strict";

    // From http://stackoverflow.com/questions/4152931/javascript-inheritance-call-super-constructor-or-use-prototype-chain
    function extend(base, sub) {
        // Avoid instantiating the base class just to setup inheritance
        // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
        // for a polyfill
        sub.prototype = Object.create(base.prototype);
        // Remember the constructor property was set wrong, let's fix it
        sub.prototype.constructor = sub;
        // In ECMAScript5+ (all modern browsers), you can make the constructor property
        // non-enumerable if you define it like this instead
        Object.defineProperty(sub.prototype, 'constructor', {
            enumerable: false,
            value: sub
        });
    }

    BlockToBlock.Block = function (gameState, x, y, spriteKey, killSound) {
        Phaser.Sprite.call(this, gameState.game, x + BlockToBlock.GameState.BLOCK_SIZE / 2, y + BlockToBlock.GameState.BLOCK_SIZE / 2, spriteKey);

        this.anchor.setTo(0.5, 0.5);

        this.gameState = gameState;
        this.game = this.gameState.game;
        this.goal = false;
        this.killSound = killSound;

        this.killedBy = null;
        // Note that if both players hit the same block, then it will be killed twice
        // (That should still be true, consider addOnce() instead?)
        this.events.onKilled.add(function () {
            this.killSound.play();
        }, this);
    };

    // BlockToBlock.Player extends Phaser.Sprite
    // The constructor will be called at runtime
    extend(Phaser.Sprite, BlockToBlock.Block);



    BlockToBlock.GoalBlock = function (gameState, x, y, killSound) {
        BlockToBlock.Block.call(this, gameState, x, y, 'block-goal', killSound);

        this.goal = true;
    };

    // BlockToBlock.GoalBlock extends Phaser.Block
    extend(BlockToBlock.Block, BlockToBlock.GoalBlock);



    BlockToBlock.BounceBlock = function (gameState, x, y, spriteKey, killSound, bounceDirection) {
        BlockToBlock.Block.call(this, gameState, x, y, spriteKey, killSound);

        this.bounceDirection = bounceDirection;

        // Direction is up initially
        if (this.bounceDirection === BlockToBlock.GameState.DIRECTION.right) {
            this.angle = 90;
        } else if (this.bounceDirection === BlockToBlock.GameState.DIRECTION.down) {
            this.angle = 180;
        } else if (this.bounceDirection === BlockToBlock.GameState.DIRECTION.left) {
            this.angle = -90;
        }

        this.events.onKilled.add(function () {
            this.killedBy.direction = this.bounceDirection;
            this.gameState.updatePlayer(this.killedBy); // Trigger an immediate player update to avoid races
            if (this.game.renderType === Phaser.WEBGL) {
                if (this.bounceDirection === BlockToBlock.GameState.DIRECTION.up || this.bounceDirection === BlockToBlock.GameState.DIRECTION.down) {
                    this.killedBy.filters = [this.gameState.blurY];
                } else {
                    this.killedBy.filters = [this.gameState.blurX];
                }
            }
        }, this);
    };

    // BlockToBlock.GoalBlock extends Phaser.Block
    extend(BlockToBlock.Block, BlockToBlock.BounceBlock);
})();