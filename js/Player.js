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

    BlockToBlock.Player = function (gameState, x, y, spriteKey) {
        Phaser.Sprite.call(this, gameState.game, x + BlockToBlock.GameState.BLOCK_SIZE / 2, y + BlockToBlock.GameState.BLOCK_SIZE / 2, spriteKey);

        this.gameState = gameState;
        this.game = this.gameState.game;

        this.anchor.setTo(0.5, 0.5);

        this.crop = new Phaser.Rectangle(-5, -5, this.width + 5, this.height + 5);

        // Attach the onOutOfBounds signal to onOutOfBounds from GameState
        this.events.onOutOfBounds.add(this.gameState.outOfBounds, this.gameState);

        this.name = spriteKey; // reuse the spriteKey as the name

        // Initialize some values
        this.destination = new Phaser.Point(this.x, this.y);
        this.direction = BlockToBlock.GameState.DIRECTION.none;
        this.prevDirection = BlockToBlock.GameState.DIRECTION.none;
        this.moving = false;
    };

    // BlockToBlock.Player extends Phaser.Sprite
    // The constructor will be called at runtime
    extend(Phaser.Sprite, BlockToBlock.Player);
})();