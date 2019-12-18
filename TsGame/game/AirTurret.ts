/// <reference path='Tile.ts'/>
/// <reference path='PreRenderedImage.ts'/>

class AirTurret extends Turret {

    static image: CanvasImageSource

    angle: number

    constructor(tile: Tile) {
        super(tile)
        this.angle = 0
    }

    static init() {
        let c = new PreRenderedImage(64, 64)
        let renderable = new RenderablePathSet()
        let path = new Path2D()
        path.ellipse(44, 32, 12, 8, 0, 0, Angles.deg180)
        let grad = c.ctx.createLinearGradient(32, 32, 32, 40)
        renderable.pushNew(path, grad)
        path = new Path2D()
        path.ellipse(20, 32, 12, 8, 0, Angles.deg180, 0)
        grad = c.ctx.createLinearGradient(32, 32, 32, 24)
        renderable.pushNew(path, grad)
        path = new Path2D()
        path.ellipse(32, 44, 8, 12, 0, Angles.deg90, Angles.deg270)
        grad = c.ctx.createLinearGradient(32, 32, 24, 32)
        renderable.pushNew(path, grad)
        path = new Path2D()
        path.ellipse(32, 20, 8, 12, 0, Angles.deg270, Angles.deg90)
        grad = c.ctx.createLinearGradient(32, 32, 40, 32)
        renderable.pushNew(path, grad)
        path = new Path2D()
        path.arc(32, 32, 8, 0, Angles.deg360)
        grad = c.ctx.createRadialGradient(32, 32, 8, 32, 32, 4)
        renderable.pushNew(path, grad)
        for (let rp of renderable.paths) {
            rp.path.closePath()
            const gr = rp.fill as CanvasGradient;
            gr.addColorStop(0, "#B2A5FF")
            gr.addColorStop(1, "#A0A0A0")
        }
        renderable.render(c.ctx)
        AirTurret.image = c.image
    }

    step(time: number) {
        super.step(time)
        this.angle = (this.angle + Angles.deg360 - time * Angles.deg120) % Angles.deg360
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean) {
        super.render(ctx, preRender)
        if (preRender) {
            return
        }
        ctx.translate(this.center.x, this.center.y)
        ctx.rotate(this.angle)
        ctx.drawImage(AirTurret.image, -32, -32)
        ctx.resetTransform()
        if (this.upgraded) {
            ctx.translate(this.center.x, this.center.y)
            ctx.rotate(this.angle + Angles.deg45)
            ctx.drawImage(AirTurret.image, -32, -32)
            ctx.resetTransform()
        }
    }

}
