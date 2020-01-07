/// <reference path="Effect.ts"/>

class StunEffect extends Effect {

    constructor(duration: number) {
        super(duration)
    }

    step(time: number): void {
        super.step(time)
        if (this.duration > 0) {
            this.affectedEnemy?.addSpeedMultiplier(0)
        }
    }

    colorize(color: RgbaColor): RgbaColor {
        return color
    }

    incompatibleWith(effect: Effect): boolean {
        return effect instanceof StunEffect
    }

    merge(effect: Effect): boolean {
        if (effect instanceof StunEffect) {
            this.duration = Math.max(this.duration, effect.duration)
            return true
        } else {
            return false
        }
    }

}
