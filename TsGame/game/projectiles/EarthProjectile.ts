/// <reference path="ThrownProjectile.ts"/>

class EarthProjectile extends ThrownProjectile {

    private readonly r1: number
    private readonly r2: number
    private readonly angle: number

    constructor(game: Game, position: Vec2, target: Enemy, size: number) {
        super(
            game,
            position,
            target.posAhead(target.pos.distanceTo(position) / 300)
                  .add(Vec2.randUnit3d().mul(5.5)),
            300
        )
        this.r1 = size / 2 + 3
        this.r2 = Rand.r(this.r1 * 0.5, this.r1 * 0.75)
        this.angle = Angle.rand()
        let damage = 15 + size * 5
        this.onhit = pos => {
            let enemy = this.game.findEnemy(pos, 5)
            if (enemy) {
                enemy.dealDamage(damage)
                if (Rand.chance((damage - 12.5) * 0.04)) {
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
        ctx.ellipse(
            this.position.x, this.position.y,
            this.r1, this.r2,
            this.angle,
            0, Angle.deg360
        )
        ctx.fill()
    }
}
