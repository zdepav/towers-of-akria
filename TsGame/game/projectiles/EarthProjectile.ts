/// <reference path="ThrownProjectile.ts"/>

class EarthProjectile extends ThrownProjectile {

    private angle: number

    constructor(game: Game, position: Vec2, target: Enemy, damage: number) {
        super(
            game,
            position,
            target.posAhead(target.pos.distanceTo(position) / 300)
                  .add(Vec2.randUnit3d().mul(6)),
            300
        )
        this.angle = Angle.rand()
        this.onhit = pos => {
            let enemy = this.game.findEnemy(pos, 5)
            if (enemy) {
                enemy.dealDamage(damage)
                if (damage > 14 && Math.random() < (damage - 12.5) * 0.04) {
                    enemy.addEffect(new StunEffect(0.5))
                }
            } else {
                this.game.spawnParticle(new SmokeParticle(pos.x, pos.y, 5))
            }
        }
    }

    step(time: number): void {
        if (this.expired) {
            return
        }
        super.step(time)
    }
    
    render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "#C0C0C0"
        ctx.beginPath()
        ctx.ellipse(this.position.x, this.position.y, 4, 2, this.angle, 0, Angle.deg360)
        ctx.fill()
    }
}
