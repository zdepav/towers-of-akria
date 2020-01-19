/// <reference path="../utils/Expirable.ts"/>

abstract class Enemy extends Expirable {

    private targetTile: Tile | null
    protected currTilePos: Vec2
    protected nextTilePos: Vec2
    private relPos: number
    private relDist: number
    private position: Vec2
    private speedMultiplier: number
    private prevSpeedMultiplier: number
    private pushTimeout: number
    private wave: number

    protected _hp: number
    protected startHp: number
    protected armor: number
    protected effects: EffectSet

    protected baseColor: RgbaColor
    protected baseHpColor: RgbaColor
    protected baseArmorColor: RgbaColor

    game: Game

    get x(): number { return this.position.x }
    get y(): number { return this.position.y }
    get pos(): Vec2 { return this.position }
    get hp(): number { return this._hp }
    get expired(): boolean { return this._hp <= 0 }
    get armorProtection(): number { return 1 + Math.log10(1 + this.armor * 0.1) }

    abstract get baseSpeed(): number

    constructor(game: Game, wave: number, spawn: Tile, hp: number, armor: number) {
        super()
        this.targetTile = spawn.next
        this.currTilePos = spawn.pos.addu(0, Rand.i(16, 48))
        this.nextTilePos = Enemy.positionInTile(spawn.next as Tile)
        this.relDist = this.currTilePos.distanceTo(this.nextTilePos)
        this.relPos = 0
        this.speedMultiplier = 1
        this.prevSpeedMultiplier = 1
        this.pushTimeout = 0
        this.position = this.currTilePos
        this.startHp = hp
        this._hp = this.startHp
        this.wave = wave
        this.armor = armor
        this.effects = new EffectSet()
        this.game = game
        this.baseColor = RgbaColor.fromHex("#303030")
        this.baseHpColor = RgbaColor.fromHex("#C08080")
        this.baseArmorColor = RgbaColor.fromHex("#8080C0")
    }

    step(time: number): void {
        if (this.expired) {
            return
        }
        this.effects.step(time)
        if (this.speedMultiplier > 0) {
            this.relPos += this.baseSpeed * 1.5 * this.speedMultiplier * time
            while (this.relPos >= this.relDist) {
                this.relPos -= this.relDist
                if (this.targetTile === null) {
                    this.game.takeLife()
                    this._hp = -1
                    return
                } else if (this.targetTile.next === null) {
                    this.currTilePos = this.nextTilePos
                    this.nextTilePos = this.targetTile.pos.addu(112, Rand.i(16, 48))
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
        this.prevSpeedMultiplier = this.speedMultiplier
        this.speedMultiplier = 1
        if (this.pushTimeout > 0) {
            this.pushTimeout -= time
        }
    }

    abstract render(ctx: CanvasRenderingContext2D): void

    dealDamage(ammount: number, ignoreArmor: boolean = false): void {
        if (this._hp > 0) {
            if (ignoreArmor) {
                this._hp = Math.max(this._hp - ammount * this.game.towerDamageMultiplier, 0)
            } else {
                this._hp = Math.max(this._hp - ammount * this.game.towerDamageMultiplier / this.armorProtection, 0)
            }
            if (this._hp <= 0) {
                this.death()
            }
        }
    }

    corodeArmor(ammount: number): void {
        this.armor = Math.max(this.armor - ammount, 0)
    }

    addEffect(effect: Effect): void {
        effect.affectedEnemy = this
        this.effects.add(effect)
    }

    getEffect(selector: (effect: Effect) => boolean): Effect | null {
        return this.effects.find(selector)
    }

    addSpeedMultiplier(mult: number): void {
        this.speedMultiplier *= mult
    }

    pushBack(): void {
        if (this.pushTimeout <= 0) {
            this.relPos = Math.max(this.relPos - Rand.r(4, 16), -8)
            this.pushTimeout = 2
        }
    }

    posAhead(timeAhead: number): Vec2 {
        let relPos = this.relPos + this.prevSpeedMultiplier * this.baseSpeed * 1.5 * timeAhead
        return this.currTilePos.lerp(this.nextTilePos, relPos / this.relDist)
    }

    death(): void {
        this.game.addCurrency(this.wave)
        let c = Rand.i(5, 10)
        for (let i = 0; i < c; ++i) {
            let r = Rand.r()
            let color: string
            if (this.armor > 10 && r < 0.2) {
                color = this.effects.colorize(this.baseArmorColor).toRgbCss()
            } else if (r < 0.8) {
                color = this.effects.colorize(this.baseHpColor).toRgbCss()
            } else {
                color = this.effects.colorize(this.baseColor).toRgbCss()
            }
            this.game.spawnParticle(new EnemyDeathParticle(this.x, this.y, color))
        }
    }

    private static positionInTile(tile: Tile): Vec2 {
        return tile.pos.addu(Rand.i(16, 48), Rand.i(16, 48))
    }
}
