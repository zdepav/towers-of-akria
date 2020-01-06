/// <reference path="Turret.ts"/>

class ArcherTurret extends Turret {

    private static image: CanvasImageSource
    private static turretName = "Archer Tower"
    private static turretDescription = "Precise tower with long range and decent damage"

    get range(): number { return 32 + this.type.count * 64 }

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
    }

    step(time: number): void {
        super.step(time)
        // this.cooldown = 1.5
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean): void {
        super.render(ctx, preRender)
        if (preRender) {
            return
        }
        ctx.drawImage(ArcherTurret.image, this.tile.pos.x, this.tile.pos.y)
    }

    addType(type: TurretElement): void {
        if (this.type.count >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
            case TurretElement.Earth:
                this.type.add(type)
                break
            case TurretElement.Fire:
                this.tile.turret = new SunTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Water:
                this.tile.turret = new MoonTurret(this.tile, this.type.add(type))
                break
        }
    }

    static getInfo(type: TurretType): TurretInfo | undefined {
        let a = type.air - 1
        let e = type.earth - 1
        return new TurretInfo(
            ArcherTurret.turretName,
            ArcherTurret.turretDescription,
            160 + a * 64 + e * 16,
            16 + a * 4 + e * 12
        )
    }

    getCurrentInfo(): TurretInfo | undefined { return AcidTurret.getInfo(this.type) }

    getInfoAfterUpgrade(type: TurretElement): TurretInfo | undefined {
        switch (type) {
            case TurretElement.Air: return MoonTurret.getInfo(this.type.add(type))
            case TurretElement.Earth: return AcidTurret.getInfo(this.type.add(type))
            case TurretElement.Fire: return EarthquakeTurret.getInfo(this.type.add(type))
            case TurretElement.Water: return AcidTurret.getInfo(this.type.add(type))
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache("td_tower_AEfw_archer").then(tex => { ArcherTurret.image = tex; }, () => new Promise<void>(resolve => {
            let c = new PreRenderedImage(64, 64)
            c.cacheImage("td_tower_AEfw_archer")
            ArcherTurret.image = c.image
            resolve()
        }))
    }

}
