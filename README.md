# Block to Block

A sliding block puzzle game

http://bburky.com/blocktoblock/

# Implementation

This version has been completely rewritten using the [Phaser](http://phaser.io/) game framework.

The motion blur requires a WebGL renderer because it uses a shader internally. The game should be playable with a non WebGL canvas but will not have motion blur.

Multitouch input has not yet been reimplemented.

The old raw, no game engine, canvas, version is in the `original` branch of this repository and is also [still online](http://bburky.com/blocktoblock/original/).
