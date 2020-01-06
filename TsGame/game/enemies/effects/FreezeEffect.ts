/// <reference path="LeveledEffect.ts"/>

class FreezeEffect extends LeveledEffect {

    protected get effectColor(): RgbaColor { return RgbaColor.cyan }

    constructor(duration: number, strength: number) {
        super(duration, Utils.clamp(strength, 1, 3))
    }

    step(time: number): void {
        super.step(time)
        if (this.duration > 0) {
            this.affectedEnemy?.addSpeedMultiplier((10 - this.strength * 1.5) / 10)
        }
    }

    incompatibleWith(effect: Effect): boolean {
        return effect instanceof FreezeEffect
    }

    merge(effect: Effect): boolean {
        if (effect instanceof FreezeEffect) {
            super.doMerge(effect)
            return true
        } else {
            return false
        }
    }

}
