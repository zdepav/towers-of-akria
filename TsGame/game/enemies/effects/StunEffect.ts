/// <reference path="Effect.ts"/>

class StunEffect extends Effect {

    constructor(duration: number) {
        super(duration)
    }

    step(time: number): void {
        super.step(time)
        if (this.duration > 0) {
            this.affectedEnemy?.addSpeedMultiplier(0.1)
        }
    }

    colorize(color: RgbaColor): RgbaColor {
        return this.duration > 0 ? color.lerp(RgbaColor.white, 0.5) : color
    }

    incompatibleWith(effect: Effect): boolean {
        return effect instanceof StunEffect
    }

    merge(effect: Effect): boolean {
        if (effect instanceof StunEffect) {
            this._duration = Math.max(this._duration, effect._duration)
            return true
        } else {
            return false
        }
    }
}
