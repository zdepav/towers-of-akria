/// <reference path="Effect.ts"/>

class StunEffect extends Effect {

    duration: number

    constructor(duration: number) {
        super()
        this.duration = duration
    }

    get expired(): boolean { return this.duration <= 0 }

    step(time: number): void {
        if (this.duration <= 0) {
            return
        }
        this.affectedEnemy?.addSpeedMultiplier(0)
        this.duration -= time
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
