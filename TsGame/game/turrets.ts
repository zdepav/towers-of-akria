/// <reference path='Coords.ts'/>
/// <reference path='Tile.ts'/>
/// <reference path='Angles.ts'/>
/// <reference path='PreRenderedImage.ts'/>
/// <reference path='GameItem.ts'/>
/// <reference path='ColorRgb.ts'/>
/// <reference path="CellularTexture.ts"/>
/// <reference path="ParticleSystem.ts"/>
/// <reference path="TurretType.ts"/>

class Turret extends GameItem {

    protected center: Coords
    protected tile: Tile
    protected hp: number
    protected cooldown: number
    protected type: TurretType

    constructor(tile: Tile, type: TurretType = null) {
        super(tile.game)
        this.tile = tile
        this.center = new Coords(tile.pos.x + 32, tile.pos.y + 32)
        this.hp = 100
        this.type = type === null ? new TurretType() : type
    }

    step(time: number) {
        if (this.cooldown > 0) {
            this.cooldown -= time
        }
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean) { }

    getType(): TurretType { return this.type.copy() }

    addType(type: TurretElement) {
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new AirTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Earth:
                this.tile.turret = new EarthTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Fire:
                this.tile.turret = new FireTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Water:
                //this.tile.turret = new WaterTurret(this.tile, this.type.add(type))
                break
        }
    }

    static init() {
        AirTurret.init()
        FireTurret.init()
        EarthTurret.init()
        //WaterTurret.init()

        IceTurret.init()
        AcidTurret.init()
        //???Turret.init()
        //CannonTurret.init()
        //LightningTurret.init()
        //FlamethrowerTurret.init()

        //SunTurret.init()
        //MoonTurret.init()
        //PlasmaTurret.init()
        //EarthquakeTurret.init()

        //ArcaneTurret.init()
    }

}

class AirTurret extends Turret {

    static image: CanvasImageSource

    angle: number

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.angle = 0
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
        switch (this.type.air()) {
            case 1:
                ctx.rotate(Angles.deg90)
                ctx.drawImage(AirTurret.image, -32, -32)
                break
            case 2:
                ctx.rotate(Angles.deg60)
                ctx.drawImage(AirTurret.image, -32, -32)
                ctx.rotate(Angles.deg60)
                ctx.drawImage(AirTurret.image, -32, -32)
                break
            case 3:
                ctx.rotate(Angles.deg45)
                ctx.drawImage(AirTurret.image, -32, -32)
                ctx.rotate(Angles.deg45)
                ctx.drawImage(AirTurret.image, -32, -32)
                ctx.rotate(Angles.deg45)
                ctx.drawImage(AirTurret.image, -32, -32)
                break
            case 4:
                ctx.rotate(Angles.deg36)
                ctx.drawImage(AirTurret.image, -32, -32)
                ctx.rotate(Angles.deg36)
                ctx.drawImage(AirTurret.image, -32, -32)
                ctx.rotate(Angles.deg36)
                ctx.drawImage(AirTurret.image, -32, -32)
                ctx.rotate(Angles.deg36)
                ctx.drawImage(AirTurret.image, -32, -32)
                break
        }
        ctx.resetTransform()
    }

    addType(type: TurretElement) {
        if (this.type.count() >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                this.type.add(type)
                break
            case TurretElement.Earth:
                //this.tile.turret = new ???Turret(this.tile, this.type.add(type))
                break
            case TurretElement.Fire:
                //this.tile.turret = new LightningTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Water:
                this.tile.turret = new IceTurret(this.tile, this.type.add(type))
                break
        }
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

}

class EarthTurret extends Turret {

    private static images: CanvasImageSource[]

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
    }

    step(time: number) {
        super.step(time)
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean) {
        super.render(ctx, preRender)
        if (preRender) {
            return
        }
        ctx.drawImage(EarthTurret.images[this.type.earth()], this.tile.pos.x, this.tile.pos.y)
    }

    addType(type: TurretElement) {
        if (this.type.count() >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                //this.tile.turret = new ???Turret(this.tile, this.type.add(type))
                break
            case TurretElement.Earth:
                this.type.add(type)
                break
            case TurretElement.Fire:
                //this.tile.turret = new CannonTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Water:
                this.tile.turret = new AcidTurret(this.tile, this.type.add(type))
                break
        }
    }

    static init() {
        EarthTurret.images = []
        EarthTurret.preRender1()
        EarthTurret.preRender2()
        EarthTurret.preRender3()
        EarthTurret.preRender4()
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
            grad.addColorStop(0, "#90d173")
            grad.addColorStop(1, "#6ba370")
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
        renderable.pushNew(path, "#90d173")
        path = new Path2D()
        path.arc(32, 32, 6, 0, Angles.deg360)
        grad = c.ctx.createRadialGradient(32, 32, 2, 32, 32, 6)
        grad.addColorStop(0, "#beefa7")
        grad.addColorStop(1, "#90d173")
        renderable.pushNew(path, grad)
        renderable.render(c.ctx)
        EarthTurret.images[1] = c.image
    }

    private static preRender2() {
        let c = new PreRenderedImage(64, 64)
        let renderable = new RenderablePathSet()
        let path: Path2D
        let grad: CanvasGradient
        let corners = [
            { x: 21, y: 21 },
            { x: 43, y: 21 },
            { x: 21, y: 43 },
            { x: 43, y: 43 }
        ]
        for (const corner of corners) {
            path = new Path2D()
            path.arc(corner.x, corner.y, 10, 0, Angles.deg360)
            grad = c.ctx.createRadialGradient(corner.x, corner.y, 5, corner.x, corner.y, 10)
            grad.addColorStop(0, "#6fd243")
            grad.addColorStop(1, "#54a45b")
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
        renderable.pushNew(path, "#6fd243")
        path = new Path2D()
        path.arc(32, 32, 6, 0, Angles.deg360)
        grad = c.ctx.createRadialGradient(32, 32, 2, 32, 32, 6)
        grad.addColorStop(0, "#a6f083")
        grad.addColorStop(1, "#6fd243")
        renderable.pushNew(path, grad)
        renderable.render(c.ctx)
        EarthTurret.images[2] = c.image
    }

    private static preRender3() {
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
            grad.addColorStop(0, "#4ed314")
            grad.addColorStop(1, "#3da547")
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
        renderable.pushNew(path, "#4ed314")
        path = new Path2D()
        path.arc(32, 32, 8, 0, Angles.deg360)
        grad = c.ctx.createRadialGradient(32, 32, 3, 32, 32, 8)
        grad.addColorStop(0, "#8ef260")
        grad.addColorStop(1, "#4ed314")
        renderable.pushNew(path, grad)
        renderable.render(c.ctx)
        EarthTurret.images[3] = c.image
    }

    private static preRender4() {
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
            grad = c.ctx.createRadialGradient(corner.x, corner.y, 6, corner.x, corner.y, 10)
            grad.addColorStop(0, "#4ed314")
            grad.addColorStop(1, "#3da547")
            renderable.pushNew(path, grad)
        }
        path = new Path2D()
        path.moveTo(18, 26)
        path.lineTo(26, 18)
        path.lineTo(46, 38)
        path.lineTo(38, 46)
        path.closePath()
        path.moveTo(46, 26)
        path.lineTo(38, 18)
        path.lineTo(18, 38)
        path.lineTo(26, 46)
        path.closePath()
        renderable.pushNew(path, "#4ed314")
        path = new Path2D()
        path.arc(32, 32, 10, 0, Angles.deg360)
        grad = c.ctx.createRadialGradient(32, 32, 4, 32, 32, 10)
        grad.addColorStop(0, "#b6ff00")
        grad.addColorStop(1, "#4ed314")
        renderable.pushNew(path, grad)
        renderable.render(c.ctx)
        EarthTurret.images[4] = c.image
    }

}

class FireTurret extends Turret {

    private static image: CanvasImageSource

    private angle: number
    private smokeTimer: number

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.angle = Math.random() * Angles.deg360
        this.smokeTimer = Math.random() * 3.5 + 0.5
    }

    spawnSmoke() {
        let x: number
        let y: number
        let r = 5 + this.type.fire()
        do {
            x = Math.random() * r * 2 - r
            y = Math.random() * r * 2 - r
        } while (x * x + y * y > 100)
        this.smokeTimer = Math.random() * (5.5 - this.type.fire()) + 0.5
        this.game.particles.add(new SmokeParticle(this.center.x + x, this.center.y + y, 0))
    }

    step(time: number) {
        super.step(time)
        this.smokeTimer -= time
        if (this.smokeTimer <= 0) {
            this.spawnSmoke()
        }
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean) {
        super.render(ctx, preRender)
        if (preRender) {
            return
        }
        let r = 20 + 3 * this.type.fire()
        ctx.translate(this.center.x, this.center.y)
        ctx.rotate(this.angle)
        ctx.drawImage(FireTurret.image, -r, -r, r * 2, r * 2)
        ctx.resetTransform()
    }

    addType(type: TurretElement) {
        if (this.type.count() >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                //this.tile.turret = new LightningTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Earth:
                //this.tile.turret = new CannonTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Fire:
                this.type.add(type)
                break
            case TurretElement.Water:
                //this.tile.turret = new FlamethrowerTurret(this.tile, this.type.add(type))
                break
        }
    }

    static init() {
        let c = new PreRenderedImage(64, 64)
        let texLava = new CellularTexture(
            64, 64, 36,
            new ColorRgb(255, 80, 32),
            new ColorRgb(192, 0, 0),
            CellularTextureType.Balls
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

class IceTurret extends Turret {

    private static images: CanvasImageSource[]

    private angle: number

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.angle = Math.random() * Angles.deg360
    }

    step(time: number) {
        super.step(time)
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean) {
        super.render(ctx, preRender)
        if (preRender) {
            return
        }
        let r = 24 + 2 * this.type.water() + 2 * this.type.air()
        let i = Math.sign(this.type.water() - this.type.air()) + 1
        ctx.translate(this.center.x, this.center.y)
        ctx.rotate(this.angle)
        ctx.drawImage(IceTurret.images[i], -r, -r, r * 2, r * 2)
        ctx.resetTransform()
    }

    addType(type: TurretElement) {
        if (this.type.count() >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Earth:
                //this.tile.turret = new MoonTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Fire:
                //this.tile.turret = new SunTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Air:
            case TurretElement.Water:
                this.type.add(type)
                break
        }
    }

    static init() {
        let tex = new CellularTexture(
            64, 64, 64,
            new ColorRgb(209, 239, 255),
            new ColorRgb(112, 190, 204),
            CellularTextureType.Lava
        )
        let c0 = new PreRenderedImage(64, 64)
        let c1 = new PreRenderedImage(64, 64)
        let c2 = new PreRenderedImage(64, 64)
        let fill = c1.ctx.createPattern(tex.generate(), "no-repeat")
        IceTurret.preRender(c1.ctx, fill, true)
        c0.ctx.drawImage(c1.image, 0, 0)
        IceTurret.preRender(c0.ctx, "#ffffff80")
        c2.ctx.drawImage(c1.image, 0, 0)
        IceTurret.preRender(c2.ctx, "#51afcc80")
        IceTurret.images = [c0.image, c1.image, c2.image]
    }

    private static mkBranch(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, size: number) {
        if (size >= 2.5) {
            ctx.beginPath()
            ctx.moveTo(x, y)
            let x2 = x + 8 * Math.cos(angle)
            let y2 = y - 8 * Math.sin(angle)
            ctx.lineTo(x2, y2)
            ctx.lineWidth = 3
            ctx.stroke()
            IceTurret.mkBranch(ctx, (x + x2) / 2, (y + y2) / 2, angle - Angles.deg60, 2)
            IceTurret.mkBranch(ctx, (x + x2) / 2, (y + y2) / 2, angle + Angles.deg60, 2)
            IceTurret.mkBranch(ctx, x2, y2, angle, 2)
        } else if (size >= 1.5) {
            ctx.beginPath()
            ctx.moveTo(x, y)
            let x2 = x + 6 * Math.cos(angle)
            let y2 = y - 6 * Math.sin(angle)
            ctx.lineTo(x2, y2)
            ctx.lineWidth = 2
            ctx.stroke()
            IceTurret.mkBranch(ctx, (x + x2) / 2, (y + y2) / 2, angle - Angles.deg45, 1)
            IceTurret.mkBranch(ctx, (x + x2) / 2, (y + y2) / 2, angle + Angles.deg45, 1)
            IceTurret.mkBranch(ctx, x2, y2, angle, 1)
        } else if (size >= 0.5) {
            ctx.beginPath()
            ctx.moveTo(x, y)
            let x2 = x + 4 * Math.cos(angle)
            let y2 = y - 4 * Math.sin(angle)
            ctx.lineTo(x2, y2)
            ctx.lineWidth = 1
            ctx.stroke()
        }
    }

    private static preRender(ctx: CanvasRenderingContext2D, fill: string | CanvasPattern, drawCenter: boolean = false) {
        ctx.save()
        ctx.lineCap = "round"
        ctx.strokeStyle = fill
        let centerPath = new Path2D()
        for (let k = 0; k < 6; ++k) {
            let a = k * Angles.deg60
            if (k === 0) {
                centerPath.moveTo(32 + 8 * Math.cos(a), 32 - 8 * Math.sin(a))
            } else {
                centerPath.lineTo(32 + 8 * Math.cos(a), 32 - 8 * Math.sin(a))
            }
            IceTurret.mkBranch(ctx, 32 + 8 * Math.cos(a), 32 - 8 * Math.sin(a), a, 3)
        }
        centerPath.closePath()
        ctx.restore()
        ctx.fillStyle = fill
        ctx.fill(centerPath)
        if (drawCenter) {
            let grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 6)
            grad.addColorStop(0, "#ffffffff")
            grad.addColorStop(1, "#d1efff00")
            ctx.fillStyle = grad
            ctx.fill(centerPath)
        }
    }

}

class AcidTurret extends Turret {

    private static image: CanvasImageSource

    private angle: number

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.angle = Math.random() * Angles.deg360
    }

    step(time: number) {
        super.step(time)
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean) {
        super.render(ctx, preRender)
        if (preRender) {
            return
        }
        ctx.translate(this.center.x, this.center.y)
        ctx.rotate(this.angle)
        ctx.drawImage(AcidTurret.image, -32, -32)
        ctx.resetTransform()
        ctx.fillStyle = "#404040"
        ctx.textAlign = "left"
        ctx.textBaseline = "top"
        ctx.font = "bold 10px serif"
        ctx.fillText('*', this.tile.pos.x + 2, this.tile.pos.y + 2)
    }

    addType(type: TurretElement) {
        if (this.type.count() >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                //this.tile.turret = new MoonTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Fire:
                //this.tile.turret = new EarthquakeTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Earth:
            case TurretElement.Water:
                this.type.add(type)
                break
        }
    }

    static init() {
        let c = new PreRenderedImage(64, 64)
        let tex = new CellularTexture(
            64, 64, 16,
            new ColorRgb(224, 255, 0),
            new ColorRgb(91, 127, 0),
            CellularTextureType.Balls
        )
        c.ctx.fillStyle = c.ctx.createPattern(tex.generate(), "repeat")
        c.ctx.fillRect(8, 8, 48, 48)
        AcidTurret.image = c.image
    }

}