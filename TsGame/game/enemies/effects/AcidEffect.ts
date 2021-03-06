/// <reference path="LeveledEffect.ts"/>

class AcidEffect extends LeveledEffect {

    protected get effectColor(): RgbaColor { return RgbaColor.green }

    constructor(duration: number, strength: number) {
        super(duration, Utils.clamp(strength, 1, 4))
    }

    step(time: number): void {
        super.step(time)
        if (this.duration > 0 && this.affectedEnemy !== null) {
            this.affectedEnemy.corodeArmor(time * 20 * this._strength * this._strength)
            this.affectedEnemy.dealDamage(time * 2 * this._strength)
            if (Rand.chance(0.01)) {
                let v = Vec2.randUnit3d().mul(4)
                this.affectedEnemy.game.spawnParticle(
                    new BubbleParticle(
                        this.affectedEnemy.x + v.x,
                        this.affectedEnemy.y + v.y,
                        0, "#80ff00"
                    )
                )
            }
        }
    }

    incompatibleWith(effect: Effect): boolean {
        return effect instanceof AcidEffect
    }

    merge(effect: Effect): boolean {
        if (effect instanceof AcidEffect) {
            super.doMerge(effect)
            return true
        } else {
            return false
        }
    }
}
