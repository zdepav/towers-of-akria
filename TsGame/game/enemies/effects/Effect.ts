/// <reference path="../../utils/Expirable.ts"/>

abstract class Effect extends Expirable {

    protected _duration: number

    affectedEnemy: Enemy | null

    get duration(): number { return this._duration }

    get expired(): boolean { return this._duration <= 0 }

    protected constructor(duration: number) {
        super()
        this._duration = duration
        this.affectedEnemy = null
    }

    step(time: number): void {
        if (this._duration > 0) {
            this._duration -= time
        }
    }

    abstract colorize(color: RgbaColor): RgbaColor

    abstract incompatibleWith(effect: Effect): boolean

    /**
     * merges effect into this if it is of the same type
     * @param effect effect to merge if possible
     * @returns true if successful, false otherwise
     */
    abstract merge(effect: Effect): boolean

}
