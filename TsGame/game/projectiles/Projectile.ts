/// <reference path="../utils/Expirable.ts"/>

abstract class Projectile extends Expirable {

    game: Game

    constructor(game: Game) {
        super()
        this.game = game
    }

    abstract render(ctx: CanvasRenderingContext2D): void

}
