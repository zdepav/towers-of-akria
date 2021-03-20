/// <reference path="GuidedProjectile.ts"/>

class AcidProjectile extends GuidedProjectile {

    constructor(
        game: Game,
        position: Vec2,
        target: Enemy,
        strength: number,
        range: number,
        damage: number,
        acidDuration: number
    ) {
        super(game, position, target, 250, range)
        this.onhit = enemy => {
            enemy.dealDamage(damage)
            enemy.addEffect(new AcidEffect(acidDuration, strength))
        }
    }

    step(time: number): void {
        if (this.expired) {
            return
        }
        super.step(time)
        this.game.spawnParticle(new TrailParticle(this.position.x, this.position.y, '#d0ff00'))
    }

    render(ctx: CanvasRenderingContext2D): void { }
}
