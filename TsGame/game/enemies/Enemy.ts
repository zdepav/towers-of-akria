/// <reference path="../utils/Expirable.ts"/>

abstract class Enemy extends Expirable {

    private targetTile: Tile | null
    protected currTilePos: Vec2
    protected nextTilePos: Vec2
    private relPos: number
    private relDist: number
    private position: Vec2
    private speedMultiplier: number

    protected hp: number
    protected startHp: number
    protected armor: number
    protected effects: EffectSet

    game: Game

    get x(): number { return this.position.x }

    get y(): number { return this.position.y }

    get pos(): Vec2 { return this.position }

    get expired(): boolean { return this.hp <= 0 }

    get armorProtection(): number { return 1 + this.armor * 0.04 }

    abstract get baseSpeed(): number

    constructor(game: Game, spawn: Tile, hp: number, armor: number) {
        super()
        this.targetTile = spawn
        this.currTilePos = spawn.pos.addu(0, Utils.randInt(16, 48))
        this.nextTilePos = Enemy.positionInTile(spawn.next as Tile)
        this.relDist = this.currTilePos.distanceTo(this.nextTilePos)
        this.relPos = 0
        this.speedMultiplier = 1
        this.position = this.currTilePos
        this.hp = hp
        this.startHp = hp
        this.armor = armor
        this.effects = new EffectSet()
        this.game = game
    }

    step(time: number): void {
        if (this.expired) {
            return
        }
        this.effects.step(time)
        if (this.baseSpeed * this.speedMultiplier > 0) {
            this.relPos += this.baseSpeed * this.speedMultiplier * time
            while (this.relPos >= this.relDist) {
                this.relPos -= this.relDist
                if (this.targetTile === null) {
                    this.game.takeLife()
                    this.hp = -1
                    return
                } else if (this.targetTile.next === null) {
                    this.currTilePos = this.nextTilePos
                    this.nextTilePos = this.targetTile.pos.addu(112, Utils.randInt(16, 48))
                    this.relDist = this.currTilePos.distanceTo(this.nextTilePos)
                    this.targetTile = null
                } else {
                    this.targetTile = this.targetTile.next
                    this.currTilePos = this.nextTilePos
                    this.nextTilePos = Enemy.positionInTile(this.targetTile)
                    this.relDist = this.currTilePos.distanceTo(this.nextTilePos)
                }
            }
            this.position = this.currTilePos.lerp(this.nextTilePos, this.relPos / this.relDist)
        }
        this.speedMultiplier = 1
    }

    abstract render(ctx: CanvasRenderingContext2D): void

    dealDamage(ammount: number): void {
        this.hp = Math.max(this.hp - ammount * this.game.towerDamageMultiplier / this.armorProtection, 0)
    }

    corodeArmor(ammount: number): void {
        this.armor = Math.max(this.armor - ammount, 0)
    }

    addEffect(effect: Effect): void {
        effect.affectedEnemy = this
        this.effects.add(effect)
    }

    addSpeedMultiplier(mult: number): void {
        this.speedMultiplier *= mult
    }

    pushBack(): void {
        this.relPos  = 0
    }

    private static positionInTile(tile: Tile): Vec2 {
        return tile.pos.addu(Utils.randInt(16, 48), Utils.randInt(16, 48))
    }

}
