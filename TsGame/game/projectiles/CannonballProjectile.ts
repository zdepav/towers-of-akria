/// <reference path="ThrownProjectile.ts"/>

class CannonballProjectile extends ThrownProjectile {

    constructor(game: Game, position: Vec2, target: Vec2) {
        super(game, position, target, 640)
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this._expired) {
            return
        }
        ctx.fillStyle = "#000000"
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, 3, 0, Angle.deg360)
        ctx.fill()
    }
}
