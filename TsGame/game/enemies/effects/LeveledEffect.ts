/// <reference path="Effect.ts"/>

abstract class LeveledEffect extends Effect {

    protected _strength: number

    get strength(): number { return this._strength }

    constructor(duration: number, strength: number) {
        super(duration)
        this._strength = Utils.clamp(strength, 1, 4)
    }

    get expired(): boolean { return this.duration <= 0 }

    protected abstract get effectColor(): RgbaColor

    colorize(color: RgbaColor): RgbaColor {
        return this.duration > 0 ? color.lerp(this.effectColor, this._strength / 20 + 0.15) : color
    }

    protected doMerge(effect: LeveledEffect): void {
        if (effect._strength > this._strength) {
            if (this._duration < effect._duration) {
                this._duration = this._duration + (effect._duration - this._duration) * this._strength / effect._strength
            }
            this._strength = effect._strength
        } else if (effect._strength < this._strength) {
            this._duration += effect.duration * (1 + this._strength - effect._strength)
        } else {
            this._duration = Math.max(this._duration, effect.duration)
        }
    }
}
