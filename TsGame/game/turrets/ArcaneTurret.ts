/// <reference path="Turret.ts"/>

class ArcaneTurret extends Turret {

    private static images: CanvasImageSource
    private static frameCount: number = 50
    private static orbitCount: number = 16
    private static maxCooldown: number = 16
    private static orbitColors: string[]
    private static turretName = "Arcane Tower"
    private static turretDescription = "Increases damage of all other towers by 25%, can instantly kill any enemy with a cooldown of 16 seconds"

    private frame: number
    private orbits: {
        r1: number
        r2: number
        angle: number
        pos: number
        speed: number
        size: number
    }[]

    get range(): number { return 96 }

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.frame = 0
        this.orbits = []
        for (let i = 0; i < ArcaneTurret.orbitCount; ++i) {
            this.orbits.push({
                r1: Rand.r(36, 64),
                r2: Rand.r(64, 92),
                angle: Angle.rand(),
                pos: Angle.rand(),
                speed: Rand.sign(Rand.r(Angle.deg120, Angle.deg240)),
                size: Rand.r(1.5, 2.5)
            })
        }
        this.cooldown = ArcaneTurret.maxCooldown
    }

    step(time: number): void {
        super.step(time)
        this.frame = (this.frame + time * 25) % ArcaneTurret.frameCount
        let orbitCount = (1 - this.cooldown / ArcaneTurret.maxCooldown) * ArcaneTurret.orbitCount
        for (let i = 0; i < orbitCount; ++i) {
            let pt = this.orbits[i]
            pt.pos = Angle.wrap(pt.pos + time * pt.speed)
        }
        if (this.ready) {
            let enemy = this.game.findEnemy(this.center, this.range)
            if (enemy) {
                for (let i = 0; i < ArcaneTurret.orbitCount; ++i) {
                    let pt = this.orbits[i]
                    let v = Vec2.onEllipse(pt.r1, pt.r2, pt.pos).rotate(pt.angle).add(this.center)
                    this.game.spawnParticle(new LineParticle(
                        v.x, v.y,
                        enemy.x, enemy.y,
                        pt.size / 2.5,
                        ArcaneTurret.orbitColors[i % 4],
                        pt.size - 0.5
                    ))
                    this.game.spawnParticle(new SparkParticle(enemy.x, enemy.y, ArcaneTurret.orbitColors[i % 4]))
                    this.game.spawnParticle(new SparkParticle(enemy.x, enemy.y, ArcaneTurret.orbitColors[i % 4]))
                    this.game.spawnParticle(new SparkParticle(enemy.x, enemy.y, ArcaneTurret.orbitColors[i % 4]))
                }
                enemy.dealDamage(Infinity)
                this.cooldown = ArcaneTurret.maxCooldown
            }
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx)
        ctx.drawImage(ArcaneTurret.images, Math.floor(this.frame) * 64, 0, 64, 64, this.tile.pos.x, this.tile.pos.y, 64, 64)
        let orbitCount = (1 - this.cooldown / ArcaneTurret.maxCooldown) * ArcaneTurret.orbitCount
        for (let i = 0; i < orbitCount; ++i) {
            ctx.fillStyle = ArcaneTurret.orbitColors[i % 4]
            let pt = this.orbits[i]
            let v = Vec2.onEllipse(pt.r1, pt.r2, pt.pos).rotate(pt.angle).add(this.center)
            ctx.beginPath()
            ctx.arc(v.x, v.y, pt.size, 0, Angle.deg360)
            ctx.fill()
        }
    }

    static renderPreview(ctx: CanvasRenderingContext2D, x: number, y: number, type: TurretType): void {
        ctx.drawImage(ArcaneTurret.images, 0, 0, 64, 64, x, y, 64, 64)
    }

    addType(type: TurretElement): void { }

    static getInfo(type: TurretType): TurretInfo | undefined {
        return new TurretInfo(
            ArcaneTurret.turretName,
            ArcaneTurret.turretDescription,
            96, `-`
        )
    }

    getCurrentInfo(): TurretInfo | undefined { return ArcaneTurret.getInfo(this.type) }

    getInfoAfterUpgrade(type: TurretElement): TurretInfo | undefined { return undefined }

    renderPreviewAfterUpgrade(ctx: CanvasRenderingContext2D, x: number, y: number, type: TurretElement): void { }

    static init(): Promise<void> {
        ArcaneTurret.orbitColors = new TurretType([1, 1, 1, 1]).toColorArray()
        return Utils.getImageFromCache("td_tower_AEFW_arcane").then(tex => { ArcaneTurret.images = tex }, () => new Promise<void>(resolve => {
            let c = new PreRenderedImage(ArcaneTurret.frameCount * 64, 64)
            let r: ColorSource = this.prepareGradient(RgbaColor.red)
            let g: ColorSource = new RotatingSource(64, 64, this.prepareGradient(RgbaColor.green), Angle.deg60, 32, 32)
            let b: ColorSource = new RotatingSource(64, 64, this.prepareGradient(RgbaColor.blue), Angle.deg120, 32, 32)
            let rgb: ColorSource = new BufferedColorSource(64, 64, new AddingSource(64, 64, r, new AddingSource(64, 64, g, b)))
            let v: ColorSource = new BufferedColorSource(64, 64, new VelvetTextureGenerator(64, 64, "#FFFFFF00", "#FFFFFF", 0.5))
            let i = 0
            function curve(x: number): number {
                return Math.cos(i * Angle.deg360 / ArcaneTurret.frameCount + x * Angle.deg360) / 2 + 0.5
            }
            let glass = new GlassTextureGenerator(64, 64, "#707070", "#909090", 0.5, 0.5, curve)
            for (; i < ArcaneTurret.frameCount; ++i) {
                let ic = i * 64 / ArcaneTurret.frameCount
                let s: ColorSource = new TranslatingSource(192, 64, v, 0, ic)
                s = new PolarSource(64, 64, s, 192, 64)
                s = new FisheyeSource(64, 64, s, 0.5, 32, 32, 24)
                s = new BlendingSource(64, 64, rgb, s)
                let grad = new RadialGradientSource(64, 64, 32, 32, 0, 4)
                grad.addColorStop(0, RgbaColor.white)
                grad.addColorStop(1, s)
                new CircleSource(64, 64, 32, 32, 24, grad, ArcaneTurret.prepareGround(glass)).generateInto(c.ctx, i * 64, 0)
            }
            c.cacheImage("td_tower_AEFW_arcane")
            ArcaneTurret.images = c.image
            resolve()
        }))
    }

    static prepareGradient(color: RgbaColor): LinearGradientSource {
        let grad = new LinearGradientSource(64, 64, 32, 16, 32, 48)
        grad.addColorStop(0, RgbaColor.black)
        grad.addColorStop(1, RgbaColor.black)
        for (let i = 0; i < 8; ++i) {
            let c = RgbaColor.black.lerp(color, Curve.sin(i / 8))
            grad.addColorStop(i / 16, c)
            grad.addColorStop(32 - i / 16, c)
        }
        grad.addColorStop(0.5, color)
        return grad
    }

    static prepareGround(base: ColorSource): ColorSource {
        let l1 = new BlendingSource(64, 64, base, "#FFFFFF40")
        let l2 = new BlendingSource(64, 64, base, "#FFFFFF20")
        let d1 = new BlendingSource(64, 64, base, "#00000040")
        let d2 = new BlendingSource(64, 64, base, "#00000020")
        let ground: ColorSource = new RectangleSource(64, 64, 0, 0, 62, 62, l1, base)
        ground = new RectangleSource(64, 64, 2, 2, 62, 62, d1, ground)
        ground = new RectangleSource(64, 64, 2, 2, 60, 60, base, ground)
        ground = new RectangleSource(64, 64, 6, 6, 50, 50, d2, ground)
        ground = new RectangleSource(64, 64, 8, 8, 50, 50, l2, ground)
        return new RectangleSource(64, 64, 8, 8, 48, 48, base, ground)
    }
}
