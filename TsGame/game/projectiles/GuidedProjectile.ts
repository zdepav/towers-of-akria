/// <reference path="Projectile.ts"/>

abstract class GuidedProjectile extends Projectile {

    protected relPos: number
    protected _expired: boolean
    protected startPosition: Vec2
    protected speed: number
    protected target: Vec2
    protected targetEnemy: Enemy
    protected position: Vec2
    protected range: number
    
    onhit: ((enemy: Enemy) => void) | null

    get expired(): boolean { return this._expired }

    constructor(game: Game, position: Vec2, target: Enemy, speed: number, range: number) {
        super(game)
        this.relPos = 0
        this._expired = false
        this.startPosition = position
        this.position = position
        this.target = target.pos
        this.targetEnemy = target
        this.speed = speed
        this.range = range
    }

    protected adjustTargetPosition(): void {
        if (!this.targetEnemy.expired) {
            this.target = this.targetEnemy.pos
        }
    }

    step(time: number): void {
        if (this._expired) {
            return
        }
        this.adjustTargetPosition()
        this.relPos += time * this.speed
        let direction = this.target.sub(this.startPosition)
        let distance = direction.length
        if (this.relPos >= distance) {
            if (this.onhit && !this.targetEnemy.expired) {
                this.onhit(this.targetEnemy)
            }
            this._expired = true
            return
        }
        this.position = this.target.sub(this.startPosition)
                                   .mul(this.relPos / distance)
                                   .add(this.startPosition)
        if (this.startPosition.distanceTo(this.position) > this.range) {
            this._expired = true
        }
    }
}
