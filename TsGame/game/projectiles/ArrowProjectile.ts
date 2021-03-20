/// <reference path="Projectile.ts"/>

class ArrowProjectile extends GuidedProjectile {

    constructor(game: Game, position: Vec2, target: Enemy, damage: number) {
        super(game, position, target, 640, Infinity)
        this.target = target.posAhead(position.distanceTo(target.pos) / 640)
        this.onhit = enemy => enemy.dealDamage(damage)
    }

    protected adjustTargetPosition(): void {
        if (!this.targetEnemy.expired) {
            this.target = this.targetEnemy.posAhead(
                this.position.distanceTo(this.targetEnemy.pos) / 640
            )
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this._expired) {
            return
        }
        let dv = this.target.sub(this.position).normalize()
        let a = dv.mul(-4).add(this.position)
        let b = dv.mul(4).add(this.position)
        ctx.strokeStyle = '#542F00'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
    }
}
