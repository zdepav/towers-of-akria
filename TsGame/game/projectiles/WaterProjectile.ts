/// <reference path="GuidedProjectile.ts"/>

class WaterProjectile extends GuidedProjectile {

    constructor(game: Game, position: Vec2, target: Enemy, strength: number, range: number) {
        super(game, position, target, 350, range)
        this.onhit = enemy => {
            enemy.dealDamage(strength / 2 + 0.5)
            enemy.addEffect(new WetEffect(2, strength))
            if (strength > 1 && Rand.chance(strength * 0.2)) {
                enemy.pushBack()
            }
        }
    }

    step(time: number): void {
        if (this.expired) {
            return
        }
        super.step(time)
        let r = Rand.r()
        if (r < 0.25) {
            this.game.spawnParticle(new TrailParticle(this.position.x, this.position.y, "#3584CE", 0.75))
        } else if (r < 0.5) {
            this.game.spawnParticle(new TrailParticle(this.position.x, this.position.y, "#399CDE", 0.75))
        }
    }
    
    render(ctx: CanvasRenderingContext2D): void {
        if (this._expired) {
            return
        }
        ctx.fillStyle = "#3584CE"
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, 3, 0, Angle.deg360)
        ctx.fill()
    }
}
