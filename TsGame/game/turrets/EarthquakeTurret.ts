/// <reference path="Turret.ts"/>

class EarthquakeTurret extends Turret {

    private static images: CanvasImageSource
    private static baseFrameCount = 12
    private static halfFrameCount = 24
    private static totalFrameCount = 48

    private frame: number

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.frame = Utils.rand(0, EarthquakeTurret.totalFrameCount)
    }

    step(time: number): void {
        super.step(time)
        this.frame = (this.frame + time * 25) % EarthquakeTurret.totalFrameCount
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean): void {
        super.render(ctx, preRender)
        if (preRender) {
            return
        }
        let a: number, b: number
        if (this.type.count == 3) {
            a = Math.floor(this.frame / EarthquakeTurret.halfFrameCount)
            b = Math.floor(this.frame % EarthquakeTurret.halfFrameCount)
        }
        else { // this.type.count == 4
            a = Math.floor(this.frame / EarthquakeTurret.baseFrameCount)
            b = Math.floor(this.frame % EarthquakeTurret.baseFrameCount) * 2
        }
        ctx.drawImage(EarthquakeTurret.images, a * 48, 0, 48, 48, this.tile.pos.x + 8, this.tile.pos.y + 8, 48, 48)
        ctx.drawImage(EarthquakeTurret.images, 192 + b * 48, 0, 48, 48, this.tile.pos.x + 8, this.tile.pos.y + 8, 48, 48)
    }

    addType(type: TurretElement): void {
        if (this.type.count >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new ArcaneTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Earth:
            case TurretElement.Fire:
            case TurretElement.Water:
                this.type.add(type)
                break
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache("td_tower_aEFW_earthquake_strip" + (EarthquakeTurret.halfFrameCount + 4)).then(tex => { EarthquakeTurret.images = tex; }, () => new Promise<void>(resolve => {
            let c = new PreRenderedImage(192 + EarthquakeTurret.halfFrameCount * 48, 48)
            let ctx = c.ctx
            for (let i = 0; i < 4; ++i) {
                let cel = new CellularTextureGenerator(48, 48, Utils.randInt(32, 128), "#808080", new PerlinNoiseTextureGenerator(48, 48, RgbaColor.black, "#808080", 0.75), CellularTextureType.Cells, CellularTextureDistanceMetric.Manhattan, Curve.sqr)
                cel = new CellularTextureGenerator(48, 48, Utils.randInt(32, 128), cel, new PerlinNoiseTextureGenerator(48, 48, RgbaColor.black, "#808080", 0.75), CellularTextureType.Cells, CellularTextureDistanceMetric.Chebyshev, Curve.sqr)
                cel.generateInto(ctx, i * 48, 0)
            }
            for (let i = 0; i < EarthquakeTurret.halfFrameCount; ++i) {
                ctx.fillStyle = "#808080" + Utils.byteToHex(Math.floor(i / EarthquakeTurret.halfFrameCount * 256))
                ctx.fillRect(192 + i * 48, 0, 48, 48)
                let grad = ctx.createRadialGradient(0, 0, 4, 0, 0, 12)
                let b = i / EarthquakeTurret.halfFrameCount
                grad.addColorStop(0.4, RgbaColor.fromHex("#E8E144").lerp(RgbaColor.fromHex("#E86544").lerp(RgbaColor.fromHex("#808080"), b), Curve.arc(b)).toCss())
                grad.addColorStop(0.5, "#606060")
                grad.addColorStop(1, "#000000")
                ctx.fillStyle = grad
                ctx.translate(216 + 48 * i, 24)
                ctx.rotate(b * Angle.deg90)
                EarthquakeTurret.path(ctx)
                ctx.fill()
                ctx.resetTransform()
            }
            c.cacheImage("td_tower_aEFW_earthquake_strip" + (EarthquakeTurret.halfFrameCount + 4))
            EarthquakeTurret.images = c.image
            resolve()
        }))
    }

    static path(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath()
        ctx.moveTo(12, -12)
        ctx.lineTo(Utils.ldx(8, -Angle.deg30), Utils.ldy(8, -Angle.deg30))
        ctx.arc(0, 0, 8, -Angle.deg30, Angle.deg30)
        ctx.lineTo(12, 12)
        ctx.lineTo(Utils.ldx(8, Angle.deg60), Utils.ldy(8, Angle.deg60))
        ctx.arc(0, 0, 8, Angle.deg60, Angle.deg120)
        ctx.lineTo(-12, 12)
        ctx.lineTo(Utils.ldx(8, Angle.deg150), Utils.ldy(8, Angle.deg150))
        ctx.arc(0, 0, 8, Angle.deg150, Angle.deg210)
        ctx.lineTo(-12, -12)
        ctx.lineTo(Utils.ldx(8, Angle.deg240), Utils.ldy(8, Angle.deg240))
        ctx.arc(0, 0, 8, Angle.deg240, Angle.deg300)
        ctx.closePath()
    }

}
