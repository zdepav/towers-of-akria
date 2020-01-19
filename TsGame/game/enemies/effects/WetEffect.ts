/// <reference path="LeveledEffect.ts"/>

class WetEffect extends LeveledEffect {

    protected get effectColor(): RgbaColor { return RgbaColor.blue }

    constructor(duration: number, strength: number) {
        super(duration, Utils.clamp(strength, 1, 4))
    }

    step(time: number): void {
        super.step(time)
        if (this.duration > 0 && this.affectedEnemy !== null) {
            if (this._strength > 2) {
                this.affectedEnemy.corodeArmor(time * 5 * (this._strength - 2))
            }
            this.affectedEnemy.addSpeedMultiplier(1 - this._strength * 0.15)
            if (Rand.chance(0.01)) {
                let v = Vec2.randUnit3d().mul(4)
                this.affectedEnemy.game.spawnParticle(
                    new BubbleParticle(
                        this.affectedEnemy.x + v.x,
                        this.affectedEnemy.y + v.y,
                        0, "#0080ff"
                    )
                )
            }
        }
    }

    incompatibleWith(effect: Effect): boolean {
        return effect instanceof WetEffect
            || effect instanceof BurningEffect
    }

    merge(effect: Effect): boolean {
        if (effect instanceof WetEffect) {
            this.doMerge(effect)
            return true
        } else {
            return false
        }
    }
}
