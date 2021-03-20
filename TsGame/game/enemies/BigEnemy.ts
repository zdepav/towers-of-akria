/// <reference path="Enemy.ts"/>

class BigEnemy extends Enemy {

    get baseSpeed(): number { return 24 }

    constructor(game: Game, wave: number, spawn: Tile, hp: number, armor: number) {
        super(game, wave, spawn, hp * 4, armor * 1.5)
    }

    private renderCircle(ctx: CanvasRenderingContext2D, r: number): void {
        ctx.beginPath()
        ctx.arc(this.x, this.y, r, 0, Angle.deg360)
        ctx.fill()
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.expired) {
            return
        }
        if (this.armor > 0) {
            ctx.fillStyle = this.effects.colorize(this.baseArmorColor).toCss()
            this.renderCircle(ctx, 10 + Utils.clamp(this.armor / 30, 0, 6))
        }
        ctx.fillStyle = '#000000'
        this.renderCircle(ctx, 10)
        if (this._hp < this.startHp) {
            ctx.fillStyle = this.effects.colorize(this.baseColor).toCss()
            this.renderCircle(ctx, 8)
        }
        ctx.fillStyle = this.effects.colorize(this.baseHpColor).toCss()
        this.renderCircle(ctx, 8 * this._hp / this.startHp)
    }
}
