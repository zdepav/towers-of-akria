/// <reference path="Projectile.ts"/>

abstract class GuidedProjectile extends Projectile {

    private relPos: number
    private _expired: boolean
    private startPosition: Vec2
    private target: Vec2
    private speed: number
    
    protected targetEnemy: Enemy
    protected position: Vec2
    
    onhit: ((enemy: Enemy) => void) | null

    get expired(): boolean { return this._expired }

    constructor(game: Game, position: Vec2, target: Enemy, speed: number) {
        super(game)
        this.relPos = 0
        this._expired = false
        this.startPosition = position
        this.position = position
        this.target = target.pos
        this.targetEnemy = target
        this.speed = speed
    }

    step(time: number): void {
        if (this._expired) {
            return
        }
        if (!this.targetEnemy.expired) {
            this.target = this.targetEnemy.pos
        }
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
    }
}
