/// <reference path="Enemy.ts"/>

class RegeneratingEnemy extends Enemy {

    private healingSpeed: number

    get baseSpeed(): number { return 64 }

    constructor(game: Game, wave: number, spawn: Tile, hp: number, armor: number) {
        super(game, wave, spawn, hp * 0.6, 0)
        this.healingSpeed = -0.1
    }

    step(time: number): void {
        super.step(time)
        if (this.healingSpeed > 0) {
            this._hp = Math.min(this.startHp, this._hp + this.healingSpeed)
        }
        this.healingSpeed = Math.min(this.healingSpeed + 0.5 * time, 0.5)
    }

    private renderHeart(ctx: CanvasRenderingContext2D, pts: Vec2[], r: number): void {
        ctx.beginPath()
        ctx.moveTo(this.x + pts[0].x * r, this.y + pts[0].y * r)
        ctx.bezierCurveTo(
            this.x + pts[1].x * r, this.y + pts[1].y * r,
            this.x + pts[2].x * r, this.y + pts[2].y * r,
            this.x + pts[3].x * r, this.y + pts[3].y * r
        )
        ctx.bezierCurveTo(
            this.x + pts[4].x * r, this.y + pts[4].y * r,
            this.x + pts[5].x * r, this.y + pts[5].y * r,
            this.x + pts[6].x * r, this.y + pts[6].y * r
        )
        ctx.bezierCurveTo(
            this.x + pts[7].x * r, this.y + pts[7].y * r,
            this.x + pts[8].x * r, this.y + pts[8].y * r,
            this.x + pts[9].x * r, this.y + pts[9].y * r
        )
        ctx.fill()
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.expired) {
            return
        }
        let angle = this.currTilePos.angleTo(this.nextTilePos)
        let va = Vec2.ld(1, angle)
        let vb = Vec2.ld(1, angle + Angle.deg90)
        let p1 = va.mul(-1.5)
        let p2 = va.mul(-0.5)
        let p3 = va.mul(0.5)
        let p4 = va.mul(1.5)
        let points: Vec2[] = [
            p1,
            p2,         p2.add(vb), p3.add(vb),
            p4.add(vb), p4.sub(vb), p3.sub(vb),
            p2.sub(vb), p2,         p1
        ]
        if (this.armor > 0) {
            ctx.fillStyle = this.effects.colorize(this.baseArmorColor).toCss()
            this.renderHeart(ctx, points, 8.5 + Utils.clamp(this.armor / 25, 0, 7))
        }
        ctx.fillStyle ='#000000'
        this.renderHeart(ctx, points, 8.5)
        if (this._hp < this.startHp) {
            ctx.fillStyle = this.effects.colorize(this.baseColor).toCss()
            this.renderHeart(ctx, points, 7)
        }
        ctx.fillStyle = this.effects.colorize(this.baseHpColor).toCss()
        this.renderHeart(ctx, points, 7 * this._hp / this.startHp)
    }

    dealDamage(ammount: number, ignoreArmor: boolean = false): void {
        super.dealDamage(ammount, ignoreArmor)
        this.healingSpeed = -0.1
    }
}
