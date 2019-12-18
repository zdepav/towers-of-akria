/// <reference path='Coords.ts'/>
/// <reference path='Tile.ts'/>
/// <reference path='Angles.ts'/>
/// <reference path='PreRenderedImage.ts'/>
/// <reference path='GameItem.ts'/>
/// <reference path='ColorRgb.ts'/>
/// <reference path="CellularTexture.ts"/>

class Turret extends GameItem {

    tile: Tile
    center: Coords
    hp: number
    cooldown: number
    upgraded: boolean

    constructor(tile: Tile) {
        super(tile.game)
        this.tile = tile
        this.center = new Coords(tile.pos.x + 32, tile.pos.y + 32)
        this.hp = 100
    }

    step(time: number) {
        if (this.cooldown > 0) {
            this.cooldown -= time
        }
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean) { }

}

class FireTurret extends Turret {

    static image: CanvasImageSource

    constructor(tile: Tile) {
        super(tile)
    }

    step(time: number) {
        super.step(time)

    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean) {
        super.render(ctx, preRender)
        if (preRender) {
            return
        }
        if (this.upgraded) {
            ctx.drawImage(FireTurret.image, this.tile.pos.x, this.tile.pos.y)
            ctx.fillStyle = "#404040"
            ctx.textAlign = "left"
            ctx.textBaseline = "top"
            ctx.font = "bold 10px serif"
            ctx.fillText('*', this.tile.pos.x + 2, this.tile.pos.y + 2)
        } else {
            ctx.drawImage(FireTurret.image, this.tile.pos.x + 8, this.tile.pos.y + 8, 48, 48)
        }
    }

    static init() {
        let c = new PreRenderedImage(64, 64)
        let texLava = new CellularTexture(
            64, 64, 36,
            new ColorRgb(255, 80, 32),
            new ColorRgb(192, 0, 0),
            CellularTextureType.Lava
        )
        let texRock = new CellularTexture(
            64, 64, 144,
            new ColorRgb(102, 45, 34),
            new ColorRgb(102, 45, 34),
            CellularTextureType.Balls
        )
        let renderable = new RenderablePathSet()
        let path = new Path2D()
        for (let k = 0; k < 36; ++k) {
            let radius = 20 + 4 * Math.random()
            let a = k * Angles.deg10
            if (k === 0) {
                path.moveTo(32 + radius * Math.cos(a), 32 - radius * Math.sin(a))
            } else {
                path.lineTo(32 + radius * Math.cos(a), 32 - radius * Math.sin(a))
            }
        }
        path.closePath()
        renderable.pushNew(path, c.ctx.createPattern(texRock.generate(), "no-repeat"))
        let grad = c.ctx.createRadialGradient(32, 32, 24, 32, 32, 10)
        grad.addColorStop(0, "#300000ff")
        grad.addColorStop(1, "#30000000")
        renderable.pushNew(path, grad)
        path = new Path2D()
        for (let k = 0; k < 18; ++k) {
            let radius = 9 + 2 * Math.random()
            let a = k * Angles.deg20
            if (k === 0) {
                path.moveTo(32 + radius * Math.cos(a), 32 - radius * Math.sin(a))
            } else {
                path.lineTo(32 + radius * Math.cos(a), 32 - radius * Math.sin(a))
            }
        }
        path.closePath()
        renderable.pushNew(path, c.ctx.createPattern(texLava.generate(), "no-repeat"))
        renderable.render(c.ctx)
        FireTurret.image = c.image
    }

}

class EarthTurret extends Turret {

    static image1: CanvasImageSource
    static image2: CanvasImageSource

    constructor(tile: Tile) {
        super(tile)
    }

    step(time: number) {
        super.step(time)

    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean) {
        super.render(ctx, preRender)
        if (preRender) {
            return
        }
        if (this.upgraded) {
            ctx.drawImage(EarthTurret.image2, this.tile.pos.x, this.tile.pos.y)
            ctx.fillStyle = "#404040"
            ctx.textAlign = "left"
            ctx.textBaseline = "top"
            ctx.font = "bold 10px serif"
            ctx.fillText('*', this.tile.pos.x + 2, this.tile.pos.y + 2)
        } else {
            ctx.drawImage(EarthTurret.image1, this.tile.pos.x, this.tile.pos.y)
        }
    }

    static init() {
        EarthTurret.preRender1()
        EarthTurret.preRender2()
    }

    private static preRender1() {
        let c = new PreRenderedImage(64, 64)
        let renderable = new RenderablePathSet()
        let path: Path2D
        let grad: CanvasGradient
        let corners = [
            { x: 22, y: 22 },
            { x: 42, y: 22 },
            { x: 22, y: 42 },
            { x: 42, y: 42 }
        ]
        for (const corner of corners) {
            path = new Path2D()
            path.arc(corner.x, corner.y, 10, 0, Angles.deg360)
            grad = c.ctx.createRadialGradient(corner.x, corner.y, 5, corner.x, corner.y, 10)
            grad.addColorStop(0, "#90D173")
            grad.addColorStop(1, "#6BA370")
            renderable.pushNew(path, grad)
        }
        path = new Path2D()
        path.moveTo(20, 24)
        path.lineTo(24, 20)
        path.lineTo(44, 40)
        path.lineTo(40, 44)
        path.closePath()
        path.moveTo(44, 24)
        path.lineTo(40, 20)
        path.lineTo(20, 40)
        path.lineTo(24, 44)
        path.closePath()
        renderable.pushNew(path, "#90D173")
        path = new Path2D()
        path.arc(32, 32, 6, 0, Angles.deg360)
        grad = c.ctx.createRadialGradient(32, 32, 2, 32, 32, 6)
        grad.addColorStop(0, "#BEEFA7")
        grad.addColorStop(1, "#90D173")
        renderable.pushNew(path, grad)
        renderable.render(c.ctx)
        EarthTurret.image1 = c.image
    }

    private static preRender2() {
        let c = new PreRenderedImage(64, 64)
        let renderable = new RenderablePathSet()
        let path: Path2D
        let grad: CanvasGradient
        let corners = [
            { x: 20, y: 20 },
            { x: 44, y: 20 },
            { x: 20, y: 44 },
            { x: 44, y: 44 }
        ]
        for (const corner of corners) {
            path = new Path2D()
            path.arc(corner.x, corner.y, 11, 0, Angles.deg360)
            grad = c.ctx.createRadialGradient(corner.x, corner.y, 5, corner.x, corner.y, 10)
            grad.addColorStop(0, "#4ED314")
            grad.addColorStop(1, "#3DA547")
            renderable.pushNew(path, grad)
        }
        path = new Path2D()
        path.moveTo(19, 25)
        path.lineTo(25, 19)
        path.lineTo(45, 39)
        path.lineTo(39, 45)
        path.closePath()
        path.moveTo(45, 25)
        path.lineTo(39, 19)
        path.lineTo(19, 39)
        path.lineTo(25, 45)
        path.closePath()
        renderable.pushNew(path, "#4ED314")
        path = new Path2D()
        path.arc(32, 32, 8, 0, Angles.deg360)
        grad = c.ctx.createRadialGradient(32, 32, 3, 32, 32, 8)
        grad.addColorStop(0, "#8EF260")
        grad.addColorStop(1, "#4ED314")
        renderable.pushNew(path, grad)
        renderable.render(c.ctx)
        EarthTurret.image2 = c.image
    }

}

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
        for (const rp of renderable.paths) {
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
            ctx.fillStyle = "#404040"
            ctx.textAlign = "left"
            ctx.textBaseline = "top"
            ctx.font = "bold 10px serif"
            ctx.fillText('*', this.tile.pos.x + 2, this.tile.pos.y + 2)
        }
    }

}
