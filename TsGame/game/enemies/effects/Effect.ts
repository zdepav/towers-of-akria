/// <reference path="../../utils/Expirable.ts"/>

abstract class Effect extends Expirable {

    protected duration: number

    affectedEnemy: Enemy | null

    get expired(): boolean { return this.duration <= 0 }

    constructor(duration: number) {
        super()
        this.duration = duration
        this.affectedEnemy = null
    }

    step(time: number): void {
        if (this.duration > 0) {
            this.duration -= time
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
