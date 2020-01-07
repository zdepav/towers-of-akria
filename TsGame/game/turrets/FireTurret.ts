/// <reference path="Turret.ts"/>

class FireTurret extends Turret {

    private static image: CanvasImageSource
    private static turretName = "Fire Tower"
    private static turretDescription1 = "Can set enemies on fire"
    private static turretDescription2 = "Sets enemies on fire"

    private angle: number
    private smokeTimer: number

    get range(): number { return 96 + this.type.fire * 16 }

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.angle = Angle.rand()
        this.smokeTimer = Utils.randInt(0.5, 4)
    }

    spawnSmoke(): void {
        let x: number
        let y: number
        let r = 5 + this.type.fire
        do {
            x = Math.random() * r * 2 - r
            y = Math.random() * r * 2 - r
        } while (x * x + y * y > 100)
        this.smokeTimer = Utils.randInt(0.5, 6 - this.type.fire)
        this.game.spawnParticle(new SmokeParticle(this.center.x + x, this.center.y + y, 0))
    }

    step(time: number): void {
        super.step(time)
        this.smokeTimer -= time
        if (this.smokeTimer <= 0) {
            this.spawnSmoke()
        }
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean): void {
        super.render(ctx, preRender)
        if (preRender) {
            return
        }
        let r = 16 + 2 * this.type.fire
        ctx.translate(this.center.x, this.center.y)
        ctx.rotate(this.angle)
        ctx.drawImage(FireTurret.image, -r, -r, r * 2, r * 2)
        ctx.resetTransform()
    }

    addType(type: TurretElement): void {
        if (this.type.count >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new LightningTurret(this.tile, this.type.with(type))
                break
            case TurretElement.Earth:
                this.tile.turret = new CannonTurret(this.tile, this.type.with(type))
                break
            case TurretElement.Fire:
                this.type.add(type)
                break
            case TurretElement.Water:
                this.tile.turret = new FlamethrowerTurret(this.tile, this.type.with(type))
                break
        }
    }

    static getInfo(type: TurretType): TurretInfo | undefined {
        return new TurretInfo(
            FireTurret.turretName,
            type.fire > 2 ? FireTurret.turretDescription2 : FireTurret.turretDescription1,
            80 + type.fire * 16,
            `${6 + type.fire * 4} + burning`
        )
    }

    getCurrentInfo(): TurretInfo | undefined { return FireTurret.getInfo(this.type) }

    getInfoAfterUpgrade(type: TurretElement): TurretInfo | undefined {
        if (this.type.count >= 4) {
            return undefined
        }
        switch (type) {
            case TurretElement.Air: return LightningTurret.getInfo(this.type.with(type))
            case TurretElement.Earth: return CannonTurret.getInfo(this.type.with(type))
            case TurretElement.Fire: return FireTurret.getInfo(this.type.with(type))
            case TurretElement.Water: return FlamethrowerTurret.getInfo(this.type.with(type))
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache("td_tower_aeFw_fire").then(tex => { FireTurret.image = tex; }, () => new Promise<void>(resolve => {
            let c = new PreRenderedImage(48, 48)
            let texLava = new CellularTextureGenerator(48, 48, 36, "#FF5020", "#C00000", CellularTextureType.Balls)
            let texRock = new CellularTextureGenerator(48, 48, 144, "#662D22", "#44150D", CellularTextureType.Balls)
            let renderable = new RenderablePathSet()
            let path = new Path2D()
            for (let k = 0; k < 36; ++k) {
                let radius = 20 + 4 * Math.random()
                let a = k * Angle.deg10
                if (k === 0) {
                    path.moveTo(Utils.ldx(radius, a, 24), Utils.ldy(radius, a, 24))
                }
                else {
                    path.lineTo(Utils.ldx(radius, a, 24), Utils.ldy(radius, a, 24))
                }
            }
            path.closePath()
            renderable.pushNew(path, c.ctx.createPattern(texRock.generateImage(), "no-repeat"))
            let grad = c.ctx.createRadialGradient(24, 24, 24, 24, 24, 10)
            grad.addColorStop(0, "#300000")
            grad.addColorStop(1, "#30000000")
            renderable.pushNew(path, grad)
            path = new Path2D()
            for (let k = 0; k < 18; ++k) {
                let radius = 9 + 2 * Math.random()
                let a = k * Angle.deg20
                if (k === 0) {
                    path.moveTo(Utils.ldx(radius, a, 24), Utils.ldy(radius, a, 24))
                }
                else {
                    path.lineTo(Utils.ldx(radius, a, 24), Utils.ldy(radius, a, 24))
                }
            }
            path.closePath()
            renderable.pushNew(path, c.ctx.createPattern(texLava.generateImage(), "no-repeat"))
            renderable.render(c.ctx)
            c.cacheImage("td_tower_aeFw_fire")
            FireTurret.image = c.image
            resolve()
        }))
    }

}
