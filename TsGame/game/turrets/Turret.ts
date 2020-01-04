/// <reference path="../game.d.ts"/>

class Turret {

    protected center: Vec2
    protected tile: Tile
    protected hp: number
    protected cooldown: number
    protected type: TurretType

    game: Game

    get ready(): boolean { return this.cooldown <= 0 }

    constructor(tile: Tile, type?: TurretType) {
        this.game = tile.game
        this.tile = tile
        this.center = new Vec2(tile.pos.x + 32, tile.pos.y + 32)
        this.hp = 100
        this.type = type === undefined ? new TurretType() : type
        this.cooldown = 0
    }

    step(time: number): void {
        if (this.cooldown > 0) {
            this.cooldown = Math.max(0, time)
        }
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean): void { }

    getType(): TurretType { return this.type.copy() }

    /**
     * returns multiplier for upgrade cost if upgrade is possible or -1 if not
     * @param type upgrade type
     */
    upgradeCostMultiplier(type: TurretElement): number {
        switch (this.type.count()) {
            case 0: return 1
            case 1: return this.type.contains(type) ? 1 : 2
            case 2: return this.type.contains(type) ? 2 : 4
            case 3: return this.type.contains(type) ? 4 : 8
            default: return -1
        }
    }

    addType(type: TurretElement): void {
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new AirTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Earth:
                this.tile.turret = new EarthTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Fire:
                this.tile.turret = new FireTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Water:
                this.tile.turret = new WaterTurret(this.tile, this.type.add(type))
                break
        }
    }

    getInfo(type?: TurretType): TurretInfo | undefined { return undefined }

    static initAll(): Promise<void[]> {
        return Promise.all([
            // 1 elements
            AirTurret.init(),
            FireTurret.init(),
            EarthTurret.init(),
            WaterTurret.init(),
            // 2 elements
            IceTurret.init(),
            AcidTurret.init(),
            CannonTurret.init(),
            ArcherTurret.init(),
            LightningTurret.init(),
            FlamethrowerTurret.init(),
            // 3 elements
            SunTurret.init(),
            MoonTurret.init(),
            PlasmaTurret.init(),
            EarthquakeTurret.init(),
            // 4 elements
            ArcaneTurret.init()
        ])
    }

}

