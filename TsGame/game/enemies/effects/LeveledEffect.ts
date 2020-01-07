/// <reference path="Effect.ts"/>

abstract class LeveledEffect extends Effect {

    strength: number

    constructor(duration: number, strength: number) {
        super(duration)
        this.strength = Utils.clamp(strength, 1, 4)
    }

    get expired(): boolean { return this.duration <= 0 }

    protected abstract get effectColor(): RgbaColor

    colorize(color: RgbaColor): RgbaColor {
        return this.duration > 0 ? color.lerp(this.effectColor, this.strength / 20 + 0.15) : color
    }

    protected doMerge(effect: LeveledEffect): void {
        if (effect.strength > this.strength) {
            if (this.duration < effect.duration) {
                this.duration = this.duration + (effect.duration - this.duration) * this.strength / effect.strength
            }
            this.strength = effect.strength
        } else if (effect.strength < this.strength) {
            this.duration += effect.duration * (1 + this.strength - effect.strength)
        } else {
            this.duration = Math.max(this.duration, effect.duration)
        }
    }

}
