/// <reference path="Turret.ts"/>

class SunTurret extends Turret {

    private static image: CanvasImageSource
    private static frameCount = 90
    private static turretName = "Sun Tower"
    private static turretDescription = "Damages and burns all enemies in range"

    private frame: number
    private angle: number
    private rays: { target: Vec2, color: string }[]

    get range(): number { return this.type.count * 64 - 32 }

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.frame = Rand.r(0, SunTurret.frameCount)
        this.angle = Angle.rand()
        this.rays = []
    }

    step(time: number): void {
        super.step(time)
        this.frame = (this.frame + time * 25) % SunTurret.frameCount
        this.rays.splice(0, this.rays.length)
        for (const e of this.game.findEnemiesInRange(this.center, this.range)) {
            let d = 1 - (this.center.distanceTo(e.pos) - 32) / (this.range - 32)
            e.dealDamage(time * (d * 20 + (this.type.count - 2) * 10))
            this.rays.push({ target: e.pos, color: "#FFFF00" + Utils.byteToHex(d * 255) })
            e.addEffect(new BurningEffect(0.2))
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx)
        ctx.lineWidth = 5
        for (const r of this.rays) {
            ctx.strokeStyle = r.color
            ctx.beginPath()
            ctx.moveTo(this.center.x, this.center.y)
            ctx.lineTo(r.target.x, r.target.y)
            ctx.stroke()
        }
        let r = 28 + 4 * (this.type.count - 3)
        ctx.translate(this.center.x, this.center.y)
        ctx.rotate(this.angle)
        ctx.drawImage(SunTurret.image, -r, -r, r * 2, r * 2)
        ctx.rotate(this.frame / SunTurret.frameCount * Angle.deg30)
        ctx.drawImage(SunTurret.image, -r, -r, r * 2, r * 2)
        ctx.resetTransform()
    }

    static renderPreview(ctx: CanvasRenderingContext2D, x: number, y: number, type: TurretType): void {
        let r = 28 + 4 * (type.count - 3)
        ctx.translate(x + 32, y + 32)
        ctx.drawImage(SunTurret.image, -r, -r, r * 2, r * 2)
        ctx.rotate(Angle.deg15)
        ctx.drawImage(SunTurret.image, -r, -r, r * 2, r * 2)
        ctx.resetTransform()
    }

    addType(type: TurretElement): void {
        if (this.type.count >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
            case TurretElement.Earth:
            case TurretElement.Fire:
                this.type.add(type)
                break
            case TurretElement.Water:
                this.tile.turret = new ArcaneTurret(this.tile, this.type.with(type))
                break
        }
    }

    static getInfo(type: TurretType): TurretInfo | undefined {
        return new TurretInfo(
            SunTurret.turretName,
            SunTurret.turretDescription,
            type.count * 64 - 32,
            type.count === 4 ? "20-40 + burning" : "10-30 + burning"
        )
    }

    getCurrentInfo(): TurretInfo | undefined { return SunTurret.getInfo(this.type) }

    getInfoAfterUpgrade(type: TurretElement): TurretInfo | undefined {
        if (this.type.count >= 4) {
            return undefined
        }
        switch (type) {
            case TurretElement.Air: return SunTurret.getInfo(this.type.with(type))
            case TurretElement.Earth: return SunTurret.getInfo(this.type.with(type))
            case TurretElement.Fire: return SunTurret.getInfo(this.type.with(type))
            case TurretElement.Water: return ArcaneTurret.getInfo(this.type.with(type))
        }
    }

    renderPreviewAfterUpgrade(ctx: CanvasRenderingContext2D, x: number, y: number, type: TurretElement): void {
        if (this.type.count >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                SunTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Earth:
                SunTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Fire:
                SunTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Water:
                ArcaneTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache("td_tower_AEFw_sun").then(tex => { SunTurret.image = tex }, () => new Promise<void>(resolve => {
            let c = new PreRenderedImage(64, 64)
            let ctx = c.ctx
            let grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
            grad.addColorStop(0.00000, "#FFFF40") //  0
            grad.addColorStop(0.09375, "#FFFD3D") //  3
            grad.addColorStop(0.18750, "#FFFA37") //  6
            grad.addColorStop(0.28125, "#FFF42A") //  9
            grad.addColorStop(0.37500, "#FFE000") // 12
            grad.addColorStop(0.40625, "#FFFFC0") // 13
            grad.addColorStop(1.00000, "#FFFFC000") // 32
            ctx.fillStyle = grad
            ctx.beginPath()
            for (let i = 0; i < 12; ++i) {
                let a0 = i * Angle.deg30
                let a1 = a0 + Angle.deg10
                let a2 = a0 + Angle.deg30
                ctx.arc(32, 32, 32, a0, a1)
                ctx.lineTo(Vec2.ldx(12, a1, 32), Vec2.ldy(12, a1, 32))
                ctx.arc(32, 32, 12, a1, a2)
                ctx.lineTo(Vec2.ldx(32, a2, 32), Vec2.ldy(32, a2, 32))
            }
            ctx.fill()
            c.cacheImage("td_tower_AEFw_sun")
            SunTurret.image = c.image
            resolve()
        }))
    }
}
