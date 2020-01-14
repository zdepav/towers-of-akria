/// <reference path="ThrownProjectile.ts"/>

class CannonballProjectile extends ThrownProjectile {

    constructor(game: Game, position: Vec2, target: Vec2) {
        super(game, position, target, 640)
    }

    step(time: number): void {
        if (this.expired) {
            return
        }
        super.step(time)
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "#000000"
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, 3, 0, Angle.deg360)
        ctx.fill()
    }
}
