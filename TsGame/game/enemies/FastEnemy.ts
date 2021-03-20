/// <reference path="Enemy.ts"/>

class FastEnemy extends Enemy {

    get baseSpeed(): number { return 128 }

    constructor(game: Game, wave: number, spawn: Tile, hp: number, armor: number) {
        super(game, wave, spawn, hp * 0.35, armor * 0.25)
    }

    private renderTriangle(
        ctx: CanvasRenderingContext2D,
        a: Vec2, b: Vec2, c: Vec2, r: number
    ): void {
        ctx.beginPath()
        ctx.moveTo(this.x + a.x * r, this.y + a.y * r)
        ctx.lineTo(this.x + b.x * r, this.y + b.y * r)
        ctx.lineTo(this.x + c.x * r, this.y + c.y * r)
        ctx.closePath()
        ctx.fill()
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.expired) {
            return
        }
        let angle = this.currTilePos.angleTo(this.nextTilePos)
        let va = Vec2.ld(1, angle)
        let vb = Vec2.ld(1, angle + Angle.deg120)
        let vc = Vec2.ld(1, angle - Angle.deg120)
        if (this.armor > 0) {
            ctx.fillStyle = this.effects.colorize(this.baseArmorColor).toCss()
            this.renderTriangle(ctx, va, vb, vc, 8.5 + Utils.clamp(this.armor / 25, 0, 7))
        }
        ctx.fillStyle = '#000000'
        this.renderTriangle(ctx, va, vb, vc, 8.5)
        if (this._hp < this.startHp) {
            ctx.fillStyle = this.effects.colorize(this.baseColor).toCss()
            this.renderTriangle(ctx, va, vb, vc, 7)
        }
        ctx.fillStyle = this.effects.colorize(this.baseHpColor).toCss()
        this.renderTriangle(ctx, va, vb, vc, 7 * this._hp / this.startHp)
    }
}
