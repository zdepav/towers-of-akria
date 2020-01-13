/// <reference path="Turret.ts"/>

class CannonTurret extends Turret {

    private static image: CanvasImageSource

    private angle: number

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.angle = Angle.rand()
    }

    step(time: number): void {
        super.step(time)
        if (this.cooldown <= 0) {
            this.cooldown = 2
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx)
        let r = 12 + this.type.count
        ctx.translate(this.center.x, this.center.y)
        ctx.rotate(this.angle)
        ctx.translate(-2 * this.cooldown, 0)
        ctx.drawImage(CannonTurret.image, -r * 2, -r, r * 4, r * 2)
        ctx.resetTransform()
    }

    static renderPreview(ctx: CanvasRenderingContext2D, x: number, y: number, type: TurretType): void {
        let r = 12 + type.count
        ctx.drawImage(CannonTurret.image, x + 32 - r * 2, y + 32 - r, r * 4, r * 2)
    }

    addType(type: TurretElement): void {
        if (this.type.count >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new SunTurret(this.tile, this.type.with(type))
                break
            case TurretElement.Earth:
            case TurretElement.Fire:
                this.type.add(type)
                break
            case TurretElement.Water:
                this.tile.turret = new EarthquakeTurret(this.tile, this.type.with(type))
                break
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache("td_tower_aEFw_cannon").then(tex => { CannonTurret.image = tex; }, () => new Promise<void>(resolve => {
            let c = new PreRenderedImage(64, 32)
            let ctx = c.ctx
            let grad = ctx.createLinearGradient(20, 16, 40, 16)
            grad.addColorStop(0.000, "#543B2C")
            grad.addColorStop(0.125, "#664936")
            grad.addColorStop(0.250, "#6C4D38")
            grad.addColorStop(0.375, "#6F4F3A")
            grad.addColorStop(0.500, "#70503B")
            grad.addColorStop(0.625, "#6F4F3A")
            grad.addColorStop(0.750, "#6C4D38")
            grad.addColorStop(0.875, "#664936")
            grad.addColorStop(1.000, "#543B2C")
            ctx.fillStyle = grad
            ctx.fillRect(20, 3, 20, 26)
            ctx.beginPath()
            ctx.arc(20, 16, 7, Angle.deg90, Angle.deg270)
            ctx.arcTo(42, 9, 52, 12, 50)
            ctx.arc(54, 12, 2, Angle.deg180, Angle.deg360)
            ctx.lineTo(56, 20)
            ctx.arc(54, 20, 2, 0, Angle.deg180)
            ctx.arcTo(45, 23, 38, 23, 50)
            ctx.closePath()
            ctx.strokeStyle = "#101010"
            ctx.lineWidth = 2
            ctx.stroke()
            ctx.fillStyle = "#303030"
            ctx.fill()
            ctx.beginPath()
            ctx.moveTo(52, 12)
            ctx.lineTo(52, 20)
            ctx.lineWidth = 1
            ctx.stroke()
            c.cacheImage("td_tower_aEFw_cannon")
            CannonTurret.image = c.image
            resolve()
        }))
    }
}
