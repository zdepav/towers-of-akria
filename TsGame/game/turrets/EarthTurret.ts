/// <reference path="Turret.ts"/>

class EarthTurret extends Turret {

    private static images: CanvasImageSource
    private static turretName = "Earth Tower"
    private static turretDescription1 = "High damage but low accuracy"
    private static turretDescription2 = "High damage but low accuracy, can stun enemies"

    get range(): number { return 128 + type.earth * 16 }

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
    }

    step(time: number): void {
        super.step(time)
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean): void {
        super.render(ctx, preRender)
        if (preRender) {
            return
        }
        ctx.drawImage(EarthTurret.images, 0, this.type.earth * 48 - 48, 48, 48, this.tile.pos.x + 8, this.tile.pos.y + 8, 48, 48)
    }

    addType(type: TurretElement): void {
        if (this.type.count >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new ArcherTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Earth:
                this.type.add(type)
                break
            case TurretElement.Fire:
                this.tile.turret = new CannonTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Water:
                this.tile.turret = new AcidTurret(this.tile, this.type.add(type))
                break
        }
    }

    static getInfo(type: TurretType): TurretInfo | undefined {
        return new TurretInfo(
            EarthTurret.turretName,
            type.earth > 2 ? EarthTurret.turretDescription2 : EarthTurret.turretDescription1,
            112 + type.earth * 16,
            `${15 + type.earth * 5}`
        )
    }

    getCurrentInfo(): TurretInfo | undefined { return EarthTurret.getInfo(this.type) }

    getInfoAfterUpgrade(type: TurretElement): TurretInfo | undefined {
        switch (type) {
            case TurretElement.Air: return ArcherTurret.getInfo(this.type.add(type))
            case TurretElement.Earth: return EarthTurret.getInfo(this.type.add(type))
            case TurretElement.Fire: return CannonTurret.getInfo(this.type.add(type))
            case TurretElement.Water: return AcidTurret.getInfo(this.type.add(type))
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache("td_tower_aEfw_earth").then(tex => { EarthTurret.images = tex; }, () => new Promise<void>(resolve => {
            let c = new PreRenderedImage(48, 192)
            EarthTurret.preRender1(c.ctx, 0)
            EarthTurret.preRender2(c.ctx, 48)
            EarthTurret.preRender3(c.ctx, 96)
            EarthTurret.preRender4(c.ctx, 144)
            c.cacheImage("td_tower_aEfw_earth")
            EarthTurret.images = c.image
            resolve()
        }))
    }

    private static preRender1(ctx: CanvasRenderingContext2D, y: number): void {
        let renderable = new RenderablePathSet()
        let path: Path2D
        let grad: CanvasGradient
        let corners = [{ x: 14, y: 14 }, { x: 34, y: 14 }, { x: 14, y: 34 }, { x: 34, y: 34 }]
        for (const corner of corners) {
            path = new Path2D()
            path.arc(corner.x, y + corner.y, 10, 0, Angle.deg360)
            grad = ctx.createRadialGradient(corner.x, y + corner.y, 5, corner.x, y + corner.y, 10)
            grad.addColorStop(0, "#90d173")
            grad.addColorStop(1, "#6ba370")
            renderable.pushNew(path, grad)
        }
        renderable.pushPolygon([12, 16, 16, 12, 36, 32, 32, 36], "#90d173", 0, y)
        renderable.pushPolygon([36, 16, 32, 12, 12, 32, 16, 36], "#90d173", 0, y)
        path = new Path2D()
        path.arc(24, y + 24, 6, 0, Angle.deg360)
        grad = ctx.createRadialGradient(24, y + 24, 2, 24, y + 24, 6)
        grad.addColorStop(0, "#beefa7")
        grad.addColorStop(1, "#90d173")
        renderable.pushNew(path, grad)
        renderable.render(ctx)
    }

    private static preRender2(ctx: CanvasRenderingContext2D, y: number): void {
        let renderable = new RenderablePathSet()
        let path: Path2D
        let grad: CanvasGradient
        let corners = [{ x: 13, y: 13 }, { x: 35, y: 13 }, { x: 13, y: 35 }, { x: 35, y: 35 }]
        for (const corner of corners) {
            path = new Path2D()
            path.arc(corner.x, y + corner.y, 10, 0, Angle.deg360)
            grad = ctx.createRadialGradient(corner.x, y + corner.y, 5, corner.x, y + corner.y, 10)
            grad.addColorStop(0, "#6fd243")
            grad.addColorStop(1, "#54a45b")
            renderable.pushNew(path, grad)
        }
        renderable.pushPolygon([12, 16, 16, 12, 36, 32, 32, 36], "#6fd243", 0, y)
        renderable.pushPolygon([36, 16, 32, 12, 12, 32, 16, 36], "#6fd243", 0, y)
        path = new Path2D()
        path.arc(24, y + 24, 6, 0, Angle.deg360)
        grad = ctx.createRadialGradient(24, y + 24, 2, 24, y + 24, 6)
        grad.addColorStop(0, "#a6f083")
        grad.addColorStop(1, "#6fd243")
        renderable.pushNew(path, grad)
        renderable.render(ctx)
    }

    private static preRender3(ctx: CanvasRenderingContext2D, y: number): void {
        let renderable = new RenderablePathSet()
        let path: Path2D
        let grad: CanvasGradient
        let corners = [{ x: 12, y: 12 }, { x: 36, y: 12 }, { x: 12, y: 36 }, { x: 36, y: 36 }]
        for (const corner of corners) {
            path = new Path2D()
            path.arc(corner.x, y + corner.y, 11, 0, Angle.deg360)
            grad = ctx.createRadialGradient(corner.x, y + corner.y, 5, corner.x, y + corner.y, 10)
            grad.addColorStop(0, "#4ed314")
            grad.addColorStop(1, "#3da547")
            renderable.pushNew(path, grad)
        }
        renderable.pushPolygon([11, 17, 17, 11, 37, 31, 31, 37], "#4ed314", 0, y)
        renderable.pushPolygon([37, 17, 31, 11, 11, 31, 17, 37], "#4ed314", 0, y)
        path = new Path2D()
        path.arc(24, y + 24, 8, 0, Angle.deg360)
        grad = ctx.createRadialGradient(24, y + 24, 3, 24, y + 24, 8)
        grad.addColorStop(0, "#8ef260")
        grad.addColorStop(1, "#4ed314")
        renderable.pushNew(path, grad)
        renderable.render(ctx)
    }

    private static preRender4(ctx: CanvasRenderingContext2D, y: number): void {
        let grad: RadialGradientSource
        let tex1 = new CamouflageTextureGenerator(48, 48, "#825D30", "#308236", 0.5)
        let tex2 = new CamouflageTextureGenerator(48, 48, "#92A33C", "#4ED314", 0.5)
        let src: ColorSource = RgbaColor.transparent.source()
        let corners = [{ x: 12, y: 12 }, { x: 36, y: 12 }, { x: 12, y: 36 }, { x: 36, y: 36 }]
        for (const corner of corners) {
            grad = new RadialGradientSource(48, 48, corner.x, corner.y, 12, 6)
            grad.addColorStop(0, "#825D3000")
            grad.addColorStop(0.2, tex1)
            grad.addColorStop(1, tex2)
            src = new CircleSource(48, 48, corner.x, corner.y, 12.5, grad, src)
        }
        let path = new Path2D
        path.moveTo(10, 18)
        path.lineTo(18, 10)
        path.lineTo(38, 30)
        path.lineTo(30, 38)
        path.closePath()
        path.moveTo(38, 18)
        path.lineTo(30, 10)
        path.lineTo(10, 30)
        path.lineTo(18, 38)
        path.closePath()
        src = new PathSource(48, 48, path, tex2, src)
        grad = new RadialGradientSource(48, 48, 24, 24, 10, 4)
        grad.addColorStop(0, tex2)
        grad.addColorStop(1, "#B6FF00")
        new CircleSource(48, 48, 24, 24, 10.5, grad, src).generateInto(ctx, 0, y)
    }

}
