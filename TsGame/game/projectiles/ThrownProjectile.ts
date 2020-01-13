/// <reference path="Projectile.ts"/>

abstract class ThrownProjectile extends Projectile {

    private relPos: number
    private _expired: boolean
    private startPosition: Vec2
    private target: Vec2
    private speed: number

    protected position: Vec2
    
    onhit: ((position: Vec2) => void) | null

    get expired(): boolean { return this._expired }

    constructor(game: Game, position: Vec2, target: Vec2, speed: number) {
        super(game)
        this.relPos = 0
        this._expired = false
        this.startPosition = position
        this.position = position
        this.target = target
        this.speed = speed
    }

    step(time: number): void {
        if (this._expired) {
            return
        }
        this.relPos += time * this.speed
        let direction = this.target.sub(this.startPosition)
        let distance = direction.length
        if (this.relPos >= distance) {
            if (this.onhit) {
                this.onhit(this.target)
            }
            this._expired = true
            return
        }
        this.position = this.target.sub(this.startPosition)
                                   .mul(this.relPos / distance)
                                   .add(this.startPosition)
    }
}
