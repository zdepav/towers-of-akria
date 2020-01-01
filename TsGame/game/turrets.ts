/// <reference path='utils.ts'/>
/// <reference path='Game.ts'/>
/// <reference path="generators.ts"/>
/// <reference path="particles.ts"/>
/// <reference path="TurretType.ts"/>

class Turret {

    protected center: Vec2
    protected tile: Tile
    protected hp: number
    protected cooldown: number
    protected type: TurretType

    game: Game

    constructor(tile: Tile, type?: TurretType) {
        this.game = tile.game
        this.tile = tile
        this.center = new Vec2(tile.pos.x + 32, tile.pos.y + 32)
        this.hp = 100
        this.type = type === undefined ? new TurretType() : type
        this.cooldown = 0
    }

    step(time: number) {
        if (this.cooldown > 0) {
            this.cooldown -= time
        }
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean) { }

    getType(): TurretType { return this.type.copy() }

    /**
     * returns multiplier for upgrade cost if upgrade is possible or -1 if not
     * @param type upgrade type
     */
    upgradeCostMultiplier(type: TurretElement): number {
        switch (this.type.count()) {
            case 0: return 1
            case 1: return this.type.contains(type) ? 1 : 2
            case 2: return this.type.contains(type) ? 2 : 4
            case 3: return this.type.contains(type) ? 4 : 8
            default: return -1
        }
    }

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
                this.tile.turret = new WaterTurret(this.tile, this.type.add(type))
                break
        }
    }

    static init() {
        AirTurret.init()
        FireTurret.init()
        EarthTurret.init()
        WaterTurret.init()

        IceTurret.init()
        AcidTurret.init()
        CannonTurret.init()
        ArcherTurret.init()
        LightningTurret.init()
        FlamethrowerTurret.init()

        SunTurret.init()
        MoonTurret.init()
        PlasmaTurret.init()
        EarthquakeTurret.init()

        ArcaneTurret.init()
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
        this.angle = (this.angle + Angle.deg360 - time * Angle.deg120) % Angle.deg360
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
                ctx.rotate(Angle.deg90)
                ctx.drawImage(AirTurret.image, -32, -32)
                break
            case 2:
                ctx.rotate(Angle.deg60)
                ctx.drawImage(AirTurret.image, -32, -32)
                ctx.rotate(Angle.deg60)
                ctx.drawImage(AirTurret.image, -32, -32)
                break
            case 3:
                ctx.rotate(Angle.deg45)
                ctx.drawImage(AirTurret.image, -32, -32)
                ctx.rotate(Angle.deg45)
                ctx.drawImage(AirTurret.image, -32, -32)
                ctx.rotate(Angle.deg45)
                ctx.drawImage(AirTurret.image, -32, -32)
                break
            case 4:
                ctx.rotate(Angle.deg36)
                ctx.drawImage(AirTurret.image, -32, -32)
                ctx.rotate(Angle.deg36)
                ctx.drawImage(AirTurret.image, -32, -32)
                ctx.rotate(Angle.deg36)
                ctx.drawImage(AirTurret.image, -32, -32)
                ctx.rotate(Angle.deg36)
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
                this.tile.turret = new ArcherTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Fire:
                this.tile.turret = new LightningTurret(this.tile, this.type.add(type))
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
        path.ellipse(44, 32, 12, 8, 0, 0, Angle.deg180)
        let grad = c.ctx.createLinearGradient(32, 32, 32, 40)
        renderable.pushNew(path, grad)
        path = new Path2D()
        path.ellipse(20, 32, 12, 8, 0, Angle.deg180, 0)
        grad = c.ctx.createLinearGradient(32, 32, 32, 24)
        renderable.pushNew(path, grad)
        path = new Path2D()
        path.arc(32, 32, 8, 0, Angle.deg360)
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
        let corners = [{ x: 22, y: 22 }, { x: 42, y: 22 }, { x: 22, y: 42 }, { x: 42, y: 42 }]
        for (const corner of corners) {
            path = new Path2D()
            path.arc(corner.x, corner.y, 10, 0, Angle.deg360)
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
        path.arc(32, 32, 6, 0, Angle.deg360)
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
        let corners = [{ x: 21, y: 21 }, { x: 43, y: 21 }, { x: 21, y: 43 }, { x: 43, y: 43 }]
        for (const corner of corners) {
            path = new Path2D()
            path.arc(corner.x, corner.y, 10, 0, Angle.deg360)
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
        path.arc(32, 32, 6, 0, Angle.deg360)
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
        let corners = [{ x: 20, y: 20 }, { x: 44, y: 20 }, { x: 20, y: 44 }, { x: 44, y: 44 }]
        for (const corner of corners) {
            path = new Path2D()
            path.arc(corner.x, corner.y, 11, 0, Angle.deg360)
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
        path.arc(32, 32, 8, 0, Angle.deg360)
        grad = c.ctx.createRadialGradient(32, 32, 3, 32, 32, 8)
        grad.addColorStop(0, "#8ef260")
        grad.addColorStop(1, "#4ed314")
        renderable.pushNew(path, grad)
        renderable.render(c.ctx)
        EarthTurret.images[3] = c.image
    }

    private static preRender4() {
        let grad: RadialGradientSource
        let tex1 = new CamouflageTextureGenerator(64, 64, "#825D30", "#308236", 0.5)
        let tex2 = new CamouflageTextureGenerator(64, 64, "#92A33C", "#4ED314", 0.5)
        let src: ColorSource = RgbaColor.transparent.source()
        let corners = [
            { x: 20, y: 20 },
            { x: 44, y: 20 },
            { x: 20, y: 44 },
            { x: 44, y: 44 }
        ]
        for (const corner of corners) {
            grad = new RadialGradientSource(64, 64, corner.x, corner.y, 12, 6)
            grad.addColorStop(0, "#825D3000")
            grad.addColorStop(0.2, tex1)
            grad.addColorStop(1, tex2)
            src = new EllipseSource(64, 64, corner.x, corner.y, 12, 12, grad, src)
        }
        let path = new Path2D
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
        src = new PathSource(64, 64, path, tex2, src)
        grad = new RadialGradientSource(64, 64, 32, 32, 10, 4)
        grad.addColorStop(0, tex2)
        grad.addColorStop(1, "#B6FF00")
        EarthTurret.images[4] = new EllipseSource(64, 64, 32, 32, 10.5, 10.5, grad, src).generateImage()
    }

}

class FireTurret extends Turret {

    private static image: CanvasImageSource

    private angle: number
    private smokeTimer: number

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.angle = Angle.rand()
        this.smokeTimer = Utils.randInt(0.5, 4)
    }

    spawnSmoke() {
        let x: number
        let y: number
        let r = 5 + this.type.fire()
        do {
            x = Math.random() * r * 2 - r
            y = Math.random() * r * 2 - r
        } while (x * x + y * y > 100)
        this.smokeTimer = Utils.randInt(0.5, 6 - this.type.fire())
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
                this.tile.turret = new LightningTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Earth:
                this.tile.turret = new CannonTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Fire:
                this.type.add(type)
                break
            case TurretElement.Water:
                this.tile.turret = new FlamethrowerTurret(this.tile, this.type.add(type))
                break
        }
    }

    static init() {
        let c = new PreRenderedImage(64, 64)
        let texLava = new CellularTextureGenerator(64, 64, 36, "#FF5020", "#C00000", CellularTextureType.Balls)
        let texRock = new CellularTextureGenerator(64, 64, 144, "#662D22", "#44150D", CellularTextureType.Balls)
        let renderable = new RenderablePathSet()
        let path = new Path2D()
        for (let k = 0; k < 36; ++k) {
            let radius = 20 + 4 * Math.random()
            let a = k * Angle.deg10
            if (k === 0) {
                path.moveTo(Utils.ldx(radius, a, 32), Utils.ldy(radius, a, 32))
            } else {
                path.lineTo(Utils.ldx(radius, a, 32), Utils.ldy(radius, a, 32))
            }
        }
        path.closePath()
        renderable.pushNew(path, c.ctx.createPattern(texRock.generateImage(), "no-repeat"))
        let grad = c.ctx.createRadialGradient(32, 32, 24, 32, 32, 10)
        grad.addColorStop(0, "#300000")
        grad.addColorStop(1, "#30000000")
        renderable.pushNew(path, grad)
        path = new Path2D()
        for (let k = 0; k < 18; ++k) {
            let radius = 9 + 2 * Math.random()
            let a = k * Angle.deg20
            if (k === 0) {
                path.moveTo(Utils.ldx(radius, a, 32), Utils.ldy(radius, a, 32))
            } else {
                path.lineTo(Utils.ldx(radius, a, 32), Utils.ldy(radius, a, 32))
            }
        }
        path.closePath()
        renderable.pushNew(path, c.ctx.createPattern(texLava.generateImage(), "no-repeat"))
        renderable.render(c.ctx)
        FireTurret.image = c.image
    }

}

class WaterTurret extends Turret {

    private static images: CanvasImageSource[]

    private angle: number

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.angle = Angle.rand()
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
        ctx.drawImage(WaterTurret.images[this.type.count() - 1], -32, -32)
        ctx.resetTransform()
    }

    addType(type: TurretElement) {
        if (this.type.count() >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new IceTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Fire:
                this.tile.turret = new FlamethrowerTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Earth:
                this.tile.turret = new AcidTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Water:
                this.type.add(type)
                break
        }
    }

    static init() {
        let sandTex = new NoiseTextureGenerator(64, 64, "#F2EBC1", 0.08, 0, 1).generateImage()
        let groundTex = new NoiseTextureGenerator(64, 64, "#B9B5A0", 0.05, 0, 1).generateImage()
        let c0 = new PreRenderedImage(64, 64)
        let c1 = new PreRenderedImage(64, 64)
        let c2 = new PreRenderedImage(64, 64)
        let c3 = WaterTurret.preRender(groundTex, sandTex)
        c0.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex).image, 9, 9, 46, 46)
        c1.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex).image, 6, 6, 52, 52)
        c2.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex).image, 3, 3, 58, 58)
        WaterTurret.images = [c0.image, c1.image, c2.image, c3.image]
    }

    private static preRender(groundTex: CanvasImageSource, sandTex: CanvasImageSource): PreRenderedImage {
        let waterTex = new CellularTextureGenerator(
            64, 64, Utils.randInt(16, 36),
            "#3584CE", "#3EB4EF",
            CellularTextureType.Balls
        ).generateImage()
        let textures = [groundTex, sandTex, waterTex]
        let pts: { pt_b: Vec2, pt: Vec2, pt_a: Vec2 }[][] = [[], [], []]
        for (let i = 0; i < 8; ++i) {
            let d2 = Utils.rand(16, 20)
            let d1 = Utils.rand(d2 + 2, 24)
            let d0 = Utils.rand(d1, 24)
            let a = i * Angle.deg45
            pts[0].push({ pt: Utils.ld(d0, a, 32, 32), pt_b: Vec2.zero, pt_a: Vec2.zero })
            pts[1].push({ pt: Utils.ld(d1, a, 32, 32), pt_b: Vec2.zero, pt_a: Vec2.zero })
            pts[2].push({ pt: Utils.ld(d2, a, 32, 32), pt_b: Vec2.zero, pt_a: Vec2.zero })
        }
        for (let j = 0; j < 3; ++j) {
            let layer = pts[j]
            for (let i = 0; i < 8; ++i) {
                let ob = layer[(i + 7) % 8]
                let o = layer[i]
                let oa = layer[(i + 1) % 8]
                let angle = Utils.angleBetween(
                    Utils.getAngle(ob.pt.x, ob.pt.y, o.pt.x, o.pt.y),
                    Utils.getAngle(o.pt.x, o.pt.y, oa.pt.x, oa.pt.y)
                )
                o.pt_a = Utils.ld(5, angle, o.pt.x, o.pt.y)
                o.pt_b = Utils.ld(5, angle + Angle.deg180, o.pt.x, o.pt.y)
            }
        }
        let c = new PreRenderedImage(64, 64)
        let ctx = c.ctx
        for (let j = 0; j < 3; ++j) {
            let layer = pts[j]
            ctx.beginPath()
            ctx.moveTo(layer[0].pt.x, layer[0].pt.y)
            for (let i = 0; i < 8; ++i) {
                let o0 = layer[i]
                let o1 = layer[(i + 1) % 8]
                ctx.bezierCurveTo(
                    o0.pt_a.x, o0.pt_a.y,
                    o1.pt_b.x, o1.pt_b.y,
                    o1.pt.x, o1.pt.y,
                )
            }
            ctx.fillStyle = ctx.createPattern(textures[j], "repeat") as CanvasPattern
            ctx.fill()
        }
        return c
    }

}

class IceTurret extends Turret {

    private static images: CanvasImageSource[]

    private angle: number

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.angle = Angle.rand()
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
        let i = Utils.sign(this.type.water() - this.type.air()) + 1
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
                this.tile.turret = new MoonTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Fire:
                this.tile.turret = new PlasmaTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Air:
            case TurretElement.Water:
                this.type.add(type)
                break
        }
    }

    static init() {
        let tex = new CellularTextureGenerator(64, 64, 64, "#D1EFFF", "#70BECC", CellularTextureType.Lava)
        let c0 = new PreRenderedImage(64, 64)
        let c1 = new PreRenderedImage(64, 64)
        let c2 = new PreRenderedImage(64, 64)
        let fill = c1.ctx.createPattern(tex.generateImage(), "no-repeat") as CanvasPattern
        IceTurret.preRender(c1.ctx, fill, true)
        c0.ctx.drawImage(c1.image, 0, 0)
        IceTurret.preRender(c0.ctx, "#FFFFFF80")
        c2.ctx.drawImage(c1.image, 0, 0)
        IceTurret.preRender(c2.ctx, "#51AFCC80")
        IceTurret.images = [c0.image, c1.image, c2.image]
    }

    private static mkBranch(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, size: number) {
        if (size >= 2.5) {
            ctx.beginPath()
            ctx.moveTo(x, y)
            let x2 = Utils.ldx(8, angle, x)
            let y2 = Utils.ldy(8, angle, y)
            ctx.lineTo(x2, y2)
            ctx.lineWidth = 3
            ctx.stroke()
            IceTurret.mkBranch(ctx, (x + x2) / 2, (y + y2) / 2, angle - Angle.deg60, 2)
            IceTurret.mkBranch(ctx, (x + x2) / 2, (y + y2) / 2, angle + Angle.deg60, 2)
            IceTurret.mkBranch(ctx, x2, y2, angle, 2)
        } else if (size >= 1.5) {
            ctx.beginPath()
            ctx.moveTo(x, y)
            let x2 = Utils.ldx(6, angle, x)
            let y2 = Utils.ldy(6, angle, y)
            ctx.lineTo(x2, y2)
            ctx.lineWidth = 2
            ctx.stroke()
            IceTurret.mkBranch(ctx, (x + x2) / 2, (y + y2) / 2, angle - Angle.deg45, 1)
            IceTurret.mkBranch(ctx, (x + x2) / 2, (y + y2) / 2, angle + Angle.deg45, 1)
            IceTurret.mkBranch(ctx, x2, y2, angle, 1)
        } else if (size >= 0.5) {
            ctx.beginPath()
            ctx.moveTo(x, y)
            let x2 = Utils.ldx(4, angle, x)
            let y2 = Utils.ldy(4, angle, y)
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
            let a = k * Angle.deg60
            if (k === 0) {
                centerPath.moveTo(Utils.ldx(8, a, 32), Utils.ldy(8, a, 32))
            } else {
                centerPath.lineTo(Utils.ldx(8, a, 32), Utils.ldy(8, a, 32))
            }
            IceTurret.mkBranch(ctx, Utils.ldx(8, a, 32), Utils.ldy(8, a, 32), a, 3)
        }
        centerPath.closePath()
        ctx.restore()
        ctx.fillStyle = fill
        ctx.fill(centerPath)
        if (drawCenter) {
            let grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 6)
            grad.addColorStop(0, "#FFFFFF")
            grad.addColorStop(1, "#D1EFFF00")
            ctx.fillStyle = grad
            ctx.fill(centerPath)
        }
    }

}

class AcidTurret extends Turret {

    private static images: CanvasImageSource[][]
    private static frameCount: number

    private frame: number

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.frame = 0
    }

    step(time: number) {
        super.step(time)
        this.frame = (this.frame + time * 25) % AcidTurret.frameCount
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean) {
        super.render(ctx, preRender)
        if (preRender) {
            return
        }
        let f = AcidTurret.images[Math.floor(this.frame)][this.type.water() + this.type.earth() - 2]
        ctx.drawImage(f, this.center.x - 32, this.center.y - 32)
    }

    addType(type: TurretElement) {
        if (this.type.count() >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new MoonTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Fire:
                this.tile.turret = new EarthquakeTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Earth:
            case TurretElement.Water:
                this.type.add(type)
                break
        }
    }

    static init() {
        let acidTex = new CellularTextureGenerator(
            64, 64, 9,
            "#E0FF00",
            "#5B7F00",
            CellularTextureType.Balls
        ).generateImage()
        AcidTurret.images = []
        AcidTurret.frameCount = 100
        for (let i = 0; i < AcidTurret.frameCount; ++i) {
            AcidTurret.images.push(AcidTurret.preRenderFrame(acidTex, i))
        }
    }

    private static preRenderFrame(texture: CanvasImageSource, frame: number): CanvasImageSource[] {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg") as SVGSVGElement
        let offset = frame / AcidTurret.frameCount * 64
        let c0 = new PreRenderedImage(64, 64)
        let c1 = new PreRenderedImage(64, 64)
        let c2 = new PreRenderedImage(64, 64)
        let c = [c0, c1, c2]
        let ctx = c0.ctx
        ctx.beginPath()
        ctx.moveTo(26, 20)
        ctx.arcTo(44, 20, 44, 26, 6)
        ctx.arcTo(44, 44, 38, 44, 6)
        ctx.arcTo(20, 44, 20, 38, 6)
        ctx.arcTo(20, 20, 26, 20, 6)
        ctx.closePath()
        ctx.fillStyle = "#B0B0B0"
        ctx.fill()
        ctx.strokeStyle = "#D0D0D0"
        ctx.lineWidth = 2
        ctx.stroke()
        c1.ctx.drawImage(c0.image, 0, 0)
        c2.ctx.drawImage(c0.image, 0, 0)
        for (let i = 0; i < 3; ++i) {
            let w = 8 + 2 * i
            let ca = new PreRenderedImage(w, w)
            ctx = ca.ctx
            ctx.fillStyle = "#D0D0D060"
            ctx.fillRect(0, 0, w, w)
            ctx.fillStyle = "#D0D0D0"
            ctx.fillRect(0, 1, w, w - 2)
            ctx.fillRect(1, 0, w - 2, w)
            let pattern = ctx.createPattern(texture, "repeat") as CanvasPattern
            pattern.setTransform(svg.createSVGMatrix().translate(-offset, 0))
            ctx.fillStyle = pattern
            ctx.fillRect(1, 1, w - 2, w - 2)
            ctx = c[i].ctx
            ctx.translate(32, 32)
            ctx.drawImage(ca.image, 12, -4 - i)
            ctx.rotate(Angle.deg90)
            ctx.drawImage(ca.image, 12, -4 - i)
            ctx.rotate(Angle.deg90)
            ctx.drawImage(ca.image, 12, -4 - i)
            ctx.rotate(Angle.deg90)
            ctx.drawImage(ca.image, 12, -4 - i)
            ctx.resetTransform()
            pattern = ctx.createPattern(texture, "repeat") as CanvasPattern
            pattern.setTransform(svg.createSVGMatrix().translate(offset, offset))
            ctx.fillStyle = pattern
            ctx.beginPath()
            ctx.arc(32, 32, 6 + i, 0, Angle.deg360)
            ctx.closePath()
            ctx.fill()
            ctx.fillStyle = "#60606080"
            ctx.fill()
            let grad = ctx.createLinearGradient(25 - i / 2, 25 - i / 2, 38 + i / 2, 38 + i / 2)
            grad.addColorStop(0, "#808080")
            grad.addColorStop(1, "#404040")
            ctx.strokeStyle = grad
            ctx.lineWidth = 2 + i
            ctx.stroke()
        }
        return [c0.image, c1.image, c2.image]
    }

}

class CannonTurret extends Turret {

    private static image: CanvasImageSource

    private angle: number

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.angle = Angle.rand()
    }

    step(time: number) {
        super.step(time)
        if (this.cooldown <= 0) {
            this.cooldown = 2
        }
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean) {
        super.render(ctx, preRender)
        if (preRender) {
            return
        }
        let r = 24 + 2 * this.type.earth() + 2 * this.type.fire()
        ctx.translate(this.center.x, this.center.y)
        ctx.rotate(this.angle)
        ctx.translate(-2 * this.cooldown, 0)
        ctx.drawImage(CannonTurret.image, -r, -r, r * 2, r * 2)
        ctx.resetTransform()
    }

    addType(type: TurretElement) {
        if (this.type.count() >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new SunTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Earth:
            case TurretElement.Fire:
                this.type.add(type)
                break
            case TurretElement.Water:
                this.tile.turret = new EarthquakeTurret(this.tile, this.type.add(type))
                break
        }
    }

    static init() {
        let c = new PreRenderedImage(64, 64)
        let ctx = c.ctx
        let grad = ctx.createLinearGradient(20, 32, 40, 32)
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
        ctx.fillRect(20, 19, 20, 26)
        ctx.beginPath()
        ctx.arc(20, 32, 7, Angle.deg90, Angle.deg270)
        ctx.arcTo(42, 25, 52, 28, 50)
        ctx.arc(54, 28, 2, Angle.deg180, Angle.deg360)
        ctx.lineTo(56, 36)
        ctx.arc(54, 36, 2, 0, Angle.deg180)
        ctx.arcTo(45, 39, 38, 39, 50)
        ctx.closePath()
        ctx.strokeStyle = "#101010"
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = "#303030"
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(52, 28)
        ctx.lineTo(52, 36)
        ctx.lineWidth = 1
        ctx.stroke()
        CannonTurret.image = c.image
    }
}

class ArcherTurret extends Turret {

    private static image: CanvasImageSource

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
        ctx.drawImage(ArcherTurret.image, this.tile.pos.x, this.tile.pos.y)
    }

    addType(type: TurretElement) {
        if (this.type.count() >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
            case TurretElement.Earth:
                this.type.add(type)
                break
            case TurretElement.Fire:
                this.tile.turret = new SunTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Water:
                this.tile.turret = new MoonTurret(this.tile, this.type.add(type))
                break
        }
    }

    static init() {
        let c = new PreRenderedImage(64, 64)
        ArcherTurret.image = c.image
    }
}

class LightningTurret extends Turret {

    private static images: CanvasImageSource[]

    private animationTimer: number

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.animationTimer = Math.random()
    }

    step(time: number) {
        super.step(time)
        this.animationTimer = (this.animationTimer + time * (this.type.air() + this.type.fire() - 1) * 0.5) % 1
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean) {
        super.render(ctx, preRender)
        if (preRender) {
            return
        }
        ctx.drawImage(
            LightningTurret.images[Math.floor(this.animationTimer * 8)],
            this.tile.pos.x, this.tile.pos.y
        )
    }

    addType(type: TurretElement) {
        if (this.type.count() >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
            case TurretElement.Fire:
                this.type.add(type)
                break
            case TurretElement.Earth:
                this.tile.turret = new SunTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Water:
                this.tile.turret = new PlasmaTurret(this.tile, this.type.add(type))
                break
        }
    }

    static init() {
        let c: PreRenderedImage[] = []
        for (let i = 0; i < 8; ++i) {
            c[i] = new PreRenderedImage(64, 64)
        }
        let ctx = c[0].ctx
        let grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 18)
        grad.addColorStop(0, "#FFFFFF")
        grad.addColorStop(0.33, "#A97FFF")
        grad.addColorStop(1, "#D6BFFF")
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.moveTo(50, 32)
        for (let i = 1; i < 16; ++i) {
            let r = i % 2 == 0 ? 21 : 7
            let a = i * Angle.deg45 / 2
            ctx.lineTo(Utils.ldx(r, a, 32), Utils.ldy(r, a, 32))
        }
        ctx.closePath()
        ctx.fill()
        grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 3)
        grad.addColorStop(0, "#F8F2FF")
        grad.addColorStop(1, "#C199FF")
        ctx.fillStyle = grad
        let j = true
        for (let i = 0; i < 8; ++i, j = !j) {
            let a = i * Angle.deg45
            ctx.translate(Utils.ldx(18, a, 32), Utils.ldy(18, a, 32))
            if (j) {
                ctx.rotate(Angle.deg45)
            }
            ctx.fillRect(-3, -3, 6, 6)
            ctx.resetTransform()
        }
        for (let i = 1; i < 8; ++i) {
            c[i].ctx.drawImage(c[0].image, 0, 0)
        }
        for (let i = 0; i < 8; ++i, j = !j) {
            ctx = c[7 - i].ctx
            grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 8)
            grad.addColorStop(0, "#FFFFFFC0")
            grad.addColorStop(1, "#F8F2FF00")
            ctx.fillStyle = grad
            let a = i * Angle.deg45
            ctx.translate(Utils.ldx(18, a, 32), Utils.ldy(18, a, 32))
            ctx.beginPath()
            ctx.arc(0, 0, 8, 0, Angle.deg360)
            ctx.closePath()
            ctx.fill()
            ctx.resetTransform()
        }
        LightningTurret.images = []
        for (let i = 0; i < 8; ++i) {
            LightningTurret.images.push(c[i].image)
        }
    }
}

class FlamethrowerTurret extends Turret {

    private static image: CanvasImageSource

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
        ctx.drawImage(FlamethrowerTurret.image, this.tile.pos.x, this.tile.pos.y)
    }

    addType(type: TurretElement) {
        if (this.type.count() >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new PlasmaTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Earth:
                this.tile.turret = new EarthquakeTurret(this.tile, this.type.add(type))
                break
            case TurretElement.Fire:
            case TurretElement.Water:
                this.type.add(type)
                break
        }
    }

    static init() {
        let c = new PreRenderedImage(64, 64)
        FlamethrowerTurret.image = c.image
    }
}

class SunTurret extends Turret {

    private static images: CanvasImageSource[]
    private static frameCount: number

    private frame: number

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.frame = 0
    }

    step(time: number) {
        super.step(time)
        this.frame = (this.frame + time * 25) % SunTurret.frameCount
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean) {
        super.render(ctx, preRender)
        if (preRender) {
            return
        }
        let r = 16 + 4 * this.type.count()
        ctx.drawImage(
            SunTurret.images[Math.floor(this.frame)],
            this.center.x - r, this.center.y - r,
            r * 2, r * 2
        )
    }

    addType(type: TurretElement) {
        if (this.type.count() >= 4) {
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

    static init() {
        SunTurret.images = []
        SunTurret.frameCount = 90
        let c = new PreRenderedImage(64, 64)
        let ctx = c.ctx
        let grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
        grad.addColorStop(0.00000, "#FFFF40")   //  0
        grad.addColorStop(0.09375, "#FFFD3D")   //  3
        grad.addColorStop(0.18750, "#FFFA37")   //  6
        grad.addColorStop(0.28125, "#FFF42A")   //  9
        grad.addColorStop(0.37500, "#FFE000")   // 12
        grad.addColorStop(0.40625, "#FFFFC0")   // 13
        grad.addColorStop(1.00000, "#FFFFC000") // 32
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
        for (let i = 0; i < SunTurret.frameCount; ++i) {
            SunTurret.images.push(SunTurret.preRenderFrame(c.image, i))
        }
    }

    private static preRenderFrame(texture: CanvasImageSource, frame: number): CanvasImageSource {
        let offset = frame / SunTurret.frameCount * Angle.deg30
        let c = new PreRenderedImage(64, 64)
        let ctx = c.ctx
        ctx.translate(32, 32)
        ctx.drawImage(texture, -32, -32)
        ctx.rotate(offset)
        ctx.drawImage(texture, -32, -32)
        ctx.resetTransform()
        return c.image
    }

}

class MoonTurret extends Turret {

    private static image: CanvasImageSource

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
        ctx.drawImage(MoonTurret.image, this.tile.pos.x, this.tile.pos.y)
    }

    addType(type: TurretElement) {
        if (this.type.count() >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
            case TurretElement.Earth:
            case TurretElement.Water:
                this.type.add(type)
                break
            case TurretElement.Fire:
                this.tile.turret = new ArcaneTurret(this.tile, this.type.add(type))
                break
        }
    }

    static init() {
        let c = new PreRenderedImage(64, 64)
        MoonTurret.image = c.image
    }
}

class PlasmaTurret extends Turret {

    private static images: CanvasImageSource
    private static frameCount: number

    private frame: number

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.frame = 0
    }

    step(time: number) {
        super.step(time)
        this.frame = (this.frame + time * 25) % PlasmaTurret.frameCount
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean) {
        super.render(ctx, preRender)
        if (preRender) {
            return
        }
        ctx.drawImage(
            PlasmaTurret.images,
            Math.floor(this.frame) * 64, (this.type.count() - 3) * 64, 64, 64,
            this.tile.pos.x, this.tile.pos.y, 64, 64
        )
    }

    addType(type: TurretElement) {
        if (this.type.count() >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
            case TurretElement.Fire:
            case TurretElement.Water:
                this.type.add(type)
                break
            case TurretElement.Earth:
                this.tile.turret = new ArcaneTurret(this.tile, this.type.add(type))
                break
        }
    }

    static init() {
        PlasmaTurret.frameCount = 100
        let background = "#552BA800"
        let color1 = new PerlinNoiseTextureGenerator(64, 64, /*BA8CFF*/"#4B007A00", "#FFFFFF", 0.5)
        let tex1a = new CirclesTextureGenerator(64, 64, "#A389FFC0", color1, background, 0.4, 2, 0.7)
        let tex1b = new CirclesTextureGenerator(64, 64, "#A389FFC0", color1, background, 0.28, 3, 0.7)
        let color2 = new PerlinNoiseTextureGenerator(64, 64, "#552BA800", "#AF84FF", 0.5)
        let back2 = new LerpingSource(64, 64, background, color2, 0.5)
        let tex2a = new CirclesTextureGenerator(64, 64, color2, back2, background, 0.4, 2, 0.1)
        let tex2b = new CirclesTextureGenerator(64, 64, color2, back2, background, 0.28, 3, 0.1)
        let c = new PreRenderedImage(64 * PlasmaTurret.frameCount, 128)
        PlasmaTurret.preRender(c.ctx, tex1a, tex2a, 0)
        PlasmaTurret.preRender(c.ctx, tex1b, tex2b, 64)
        c.saveImage("plasma")
        PlasmaTurret.images = c.image
    }

    private static preRender(ctx: CanvasRenderingContext2D, tex1: ColorSource, tex2: ColorSource, y: number) {
        y += 32
        for (let i = 0; i < PlasmaTurret.frameCount; ++i) {
            let a = i * Angle.deg360 / PlasmaTurret.frameCount, x = i * 64 + 32
            let src = new AddingSource(
                64, 64,
                new RotatingSource(64, 64, tex1, a, 32, 32),
                new RotatingSource(64, 64, tex2, -a, 32, 32)
            )
            ctx.fillStyle = ctx.createPattern(src.generateImage(), "repeat") as CanvasPattern
            ctx.beginPath()
            ctx.arc(x, y, 30, 0, Angle.deg360)
            ctx.fill()
        }
    }

}

class EarthquakeTurret extends Turret {

    private static image: CanvasImageSource

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
        ctx.drawImage(EarthquakeTurret.image, this.tile.pos.x, this.tile.pos.y)
    }

    addType(type: TurretElement) {
        if (this.type.count() >= 4) {
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

    static init() {
        let c = new PreRenderedImage(64, 64)
        EarthquakeTurret.image = c.image
    }
}

class ArcaneTurret extends Turret {

    private static image: CanvasImageSource

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
        ctx.drawImage(ArcaneTurret.image, this.tile.pos.x, this.tile.pos.y)
    }

    addType(type: TurretElement) { }

    static init() {
        let c = new PreRenderedImage(64, 64)
        ArcaneTurret.image = c.image
    }
}