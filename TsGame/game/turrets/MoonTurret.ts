/// <reference path="Turret.ts"/>

class MoonTurret extends Turret {

    private static images: CanvasImageSource
    private static frameCount = 50
    private static turretName = "Moon Tower"
    private static turretDescription = "Damages and slows down all enemies in range"

    private frame: number
    private rays: { target: Vec2, color: string }[]

    get range(): number { return this.type.count * 64 - 32 }

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.frame = Utils.rand(0, MoonTurret.frameCount)
        this.rays = []
    }

    step(time: number): void {
        super.step(time)
        this.frame = (this.frame + time * 25) % MoonTurret.frameCount
        this.rays.splice(0, this.rays.length)
        for (const e of this.game.findEnemiesInRange(this.center, this.range)) {
            let d = 1 - (this.center.distanceTo(e.pos) - 32) / (this.range - 32)
            e.dealDamage(time * (d * 20 + (this.type.count - 2) * 10))
            this.rays.push({ target: e.pos, color: "#FFFFFF" + Utils.byteToHex(d * 255) })
            e.addEffect(new FreezeEffect(0.2, 2))
        }
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean): void {
        super.render(ctx, preRender)
        if (preRender) {
            return
        }
        ctx.lineWidth = 7
        for (const r of this.rays) {
            ctx.strokeStyle = r.color
            ctx.beginPath()
            ctx.moveTo(this.center.x, this.center.y)
            ctx.lineTo(r.target.x, r.target.y)
            ctx.stroke()
        }
        let r = 28 + 4 * (this.type.count - 3)
        ctx.drawImage(MoonTurret.images, Math.floor(this.frame) * 64, 0, 64, 64, this.center.x - r, this.center.y - r, r * 2, r * 2)
    }

    addType(type: TurretElement): void {
        if (this.type.count >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
            case TurretElement.Earth:
            case TurretElement.Water:
                this.type.add(type)
                break
            case TurretElement.Fire:
                this.tile.turret = new ArcaneTurret(this.tile, this.type.with(type))
                break
        }
    }

    static getInfo(type: TurretType): TurretInfo | undefined {
        return new TurretInfo(
            MoonTurret.turretName,
            MoonTurret.turretDescription,
            type.count * 64 - 32,
            type.count === 4 ? "20-40" : "10-30"
        )
    }

    getCurrentInfo(): TurretInfo | undefined { return MoonTurret.getInfo(this.type) }

    getInfoAfterUpgrade(type: TurretElement): TurretInfo | undefined {
        if (this.type.count >= 4) {
            return undefined
        }
        switch (type) {
            case TurretElement.Air: return MoonTurret.getInfo(this.type.with(type))
            case TurretElement.Earth: return MoonTurret.getInfo(this.type.with(type))
            case TurretElement.Fire: return ArcaneTurret.getInfo(this.type.with(type))
            case TurretElement.Water: return MoonTurret.getInfo(this.type.with(type))
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache("td_tower_AEfW_moon_strip" + MoonTurret.frameCount).then(tex => { MoonTurret.images = tex; }, () => new Promise<void>(resolve => {
            let c = new PreRenderedImage(MoonTurret.frameCount * 64, 64)
            let colorA = ColorSource.get("#E0E0E0")
            let colorB = ColorSource.get("#FFFFFF00")
            let s: ColorSource = new CellularTextureGenerator(64, 32, 49, "#A0A0A0", colorA, CellularTextureType.Balls)
            for (let i = 0; i < 3; ++i) {
                s = new CellularTextureGenerator(64, 32, 49, s, colorA, CellularTextureType.Cells)
            }
            s = new BufferedColorSource(64, 32, s)
            let p = new PerlinNoiseTextureGenerator(64, 64, "#FFFFFF00", "#FFFFFF80", 0.4)
            for (let i = 0; i < MoonTurret.frameCount; ++i) {
                let coef = i / MoonTurret.frameCount
                let t1 = new TranslatingSource(64, 64, s, -64 * coef, 0)
                let ns: ColorSource = new ScalingSource(64, 64, t1, 0.5, 32, 32)
                let t2 = new TranslatingSource(64, 64, p, 64 * coef, 0)
                let grad = new RadialGradientSource(64, 64, 32, 32, 16, 32)
                grad.addColorStop(0, t2)
                grad.addColorStop(1, colorB)
                ns = new FisheyeSource(64, 64, ns, 0.5, 32, 32, 16)
                ns = new CircleSource(64, 64, 32, 32, 16, ns, grad)
                ns.generateInto(c.ctx, i * 64, 0)
            }
            c.cacheImage("td_tower_AEfW_moon_strip" + MoonTurret.frameCount)
            MoonTurret.images = c.image
            resolve()
        }))
    }

}
