/// <reference path="GuidedProjectile.ts"/>

class FireProjectile extends GuidedProjectile {

    constructor(
        game: Game,
        position: Vec2,
        target: Enemy,
        damage: number,
        duration: number,
        range: number
    ) {
        super(game, position, target, 250, range)
        this.onhit = enemy => {
            enemy.dealDamage(damage)
            enemy.addEffect(new BurningEffect(duration))
        }
    }

    step(time: number): void {
        if (this.expired) {
            return
        }
        super.step(time)
        let r = Rand.r()
        if (r < 0.27) {
            this.game.spawnParticle(new TrailParticle(this.position.x, this.position.y, '#ff5000'))
        } else if (r < 0.54) {
            this.game.spawnParticle(new TrailParticle(this.position.x, this.position.y, '#ff2000'))
        } else if (r < 0.81) {
            this.game.spawnParticle(new TrailParticle(this.position.x, this.position.y, '#d00000'))
        } else {
            this.game.spawnParticle(new SmokeParticle(this.position.x, this.position.y, 1))
        }
    }

    render(ctx: CanvasRenderingContext2D): void { }
}
