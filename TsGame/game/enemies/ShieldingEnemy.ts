/// <reference path="Enemy.ts"/>

class ShieldingEnemy extends Enemy {

    private shieldCooldown: number

    private shield: number

    get baseSpeed(): number { return this.shield > 0 ? 48 : 64 }

    constructor(game: Game, wave: number, spawn: Tile, hp: number, armor: number) {
        super(game, wave, spawn, hp, 0)
        this.shieldCooldown = 0
    }

    step(time: number): void {
        super.step(time)
        if (this.shieldCooldown > 0) {
            this.shieldCooldown -= time
        }
    }

    private renderShield(ctx: CanvasRenderingContext2D, pts: Vec2[], r: number): void {
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
        let p1 = va.mul(1.5)
        let p2 = va.mul(-1)
        let p3 = va.mul(-1.5)
        let points: Vec2[] = [
            p1,
            vb, vb, p3.add(vb),
            p2.add(vb), p2.sub(vb), p3.sub(vb),
            vb.negate(), vb.negate(), p1
        ]
        if (this.armor > 0) {
            ctx.fillStyle = this.effects.colorize(this.baseArmorColor).toCss()
            this.renderShield(ctx, points, 8.5 + Utils.clamp(this.armor / 25, 0, 7))
        }
        ctx.fillStyle = "#000000"
        this.renderShield(ctx, points, 8.5)
        if (this._hp < this.startHp) {
            ctx.fillStyle = this.effects.colorize(this.baseColor).toCss()
            this.renderShield(ctx, points, 7)
        }
        ctx.fillStyle = this.effects.colorize(this.baseHpColor).toCss()
        this.renderShield(ctx, points, 7 * this._hp / this.startHp)
        ctx.fillStyle = "#FFFF0080"
        this.renderShield(ctx, points, 70 * this.shield / this.startHp)
    }

    dealDamage(ammount: number): void {
        if (this.shield > 0) {
            if (ammount < this.shield) {
                this.shield -= ammount
            } else {
                let a = ammount - this.shield
                super.dealDamage(a)
                this.shield = 0
            }
        } else {
            super.dealDamage(ammount)
            if (this.shieldCooldown <= 0) {
                this.shield = this.startHp * 0.1
                this.shieldCooldown = 5
            }
        }
    }
}
