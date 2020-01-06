/// <reference path="Turret.ts"/>

class SunTurret extends Turret {

    private static image: CanvasImageSource
    private static frameCount= 90

    private frame: number
    private angle: number

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.frame = Utils.rand(0, SunTurret.frameCount)
        this.angle = Angle.rand()
    }

    step(time: number): void {
        super.step(time)
        this.frame = (this.frame + time * 25) % SunTurret.frameCount
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean): void {
        super.render(ctx, preRender)
        if (preRender) {
            return
        }
        let r = 28 + 4 * (this.type.count - 3)
        ctx.translate(this.center.x, this.center.y)
        ctx.rotate(this.angle)
        ctx.drawImage(SunTurret.image, -r, -r, r * 2, r * 2)
        ctx.rotate(this.frame / SunTurret.frameCount * Angle.deg30)
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
                this.tile.turret = new ArcaneTurret(this.tile, this.type.add(type))
                break
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache("td_tower_AEFw_sun").then(tex => { SunTurret.image = tex; }, () => new Promise<void>(resolve => {
            let c = new PreRenderedImage(64, 64)
            let ctx = c.ctx
            let grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
            grad.addColorStop(0.00000, "#FFFF40"); //  0
            grad.addColorStop(0.09375, "#FFFD3D"); //  3
            grad.addColorStop(0.18750, "#FFFA37"); //  6
            grad.addColorStop(0.28125, "#FFF42A"); //  9
            grad.addColorStop(0.37500, "#FFE000"); // 12
            grad.addColorStop(0.40625, "#FFFFC0"); // 13
            grad.addColorStop(1.00000, "#FFFFC000"); // 32
            ctx.fillStyle = grad
            ctx.beginPath()
            for (let i = 0; i < 12; ++i) {
                let a0 = i * Angle.deg30
                let a1 = a0 + Angle.deg10
                let a2 = a0 + Angle.deg30
                ctx.arc(32, 32, 32, a0, a1)
                ctx.lineTo(Utils.ldx(12, a1, 32), Utils.ldy(12, a1, 32))
                ctx.arc(32, 32, 12, a1, a2)
                ctx.lineTo(Utils.ldx(32, a2, 32), Utils.ldy(32, a2, 32))
            }
            ctx.fill()
            c.cacheImage("td_tower_AEFw_sun")
            SunTurret.image = c.image
            resolve()
        }))
    }

}
