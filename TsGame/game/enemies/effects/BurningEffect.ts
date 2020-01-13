/// <reference path="Effect.ts"/>

class BurningEffect extends Effect {

    constructor(duration: number) {
        super(duration)
    }

    step(time: number): void {
        super.step(time)
        if (this.duration > 0 && this.affectedEnemy !== null) {
            this.affectedEnemy.dealDamage(5 * time)
            if (Math.random() < 0.05) {
                let v = Vec2.randUnit3d().mul(4)
                this.affectedEnemy.game.spawnParticle(
                    new SmokeParticle(
                        this.affectedEnemy.x + v.x,
                        this.affectedEnemy.y + v.y,
                        0
                    )
                )
            }
        }
    }

    colorize(color: RgbaColor): RgbaColor {
        return this.duration > 0 ? color.lerp(RgbaColor.red, 0.25) : color
    }

    incompatibleWith(effect: Effect): boolean {
        return effect instanceof BurningEffect
            || effect instanceof WetEffect
    }

    merge(effect: Effect): boolean {
        if (effect instanceof BurningEffect) {
            this.duration = Math.max(this.duration, effect.duration)
            return true
        } else {
            return false
        }
    }
}
