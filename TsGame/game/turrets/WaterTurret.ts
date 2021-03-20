/// <reference path="Turret.ts"/>

class WaterTurret extends Turret {

    private static images: CanvasImageSource
    private static turretName = 'Water Tower'
    private static turretDescription = [
        'Slows down enemies',
        'Slows down enemies, can push them back'
    ]

    private readonly angle: number

    get range(): number { return 112 + this.type.water * 16 }

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.angle = Angle.rand()
    }

    step(time: number): void {
        super.step(time)
        if (this.ready) {
            let enemy = Rand.item(this.game.findEnemiesInRange(this.center, this.range))
            if (enemy) {
                let pos = Vec2.randUnit3d().mul(this.type.water * 2 + 8).add(this.center)
                this.game.spawnProjectile(
                    new WaterProjectile(this.game, pos, enemy, this.type.water, this.range)
                )
                this.game.playSound('water')
                this.cooldown = 0.5 / this.type.count
            }
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx)
        ctx.translate(this.center.x, this.center.y)
        ctx.rotate(this.angle)
        ctx.drawImage(
            WaterTurret.images,
            0, (this.type.count - 1) * 48, 48, 48,
            -24, -24, 48, 48
        )
        ctx.resetTransform()
    }

    static renderPreview(
        ctx: CanvasRenderingContext2D,
        x: number, y: number,
        type: TurretType
    ): void {
        ctx.drawImage(
            WaterTurret.images,
            0, (type.count - 1) * 48, 48, 48,
            x + 8, y + 8, 48, 48
        )
    }

    addType(type: TurretElement): void {
        if (this.type.count >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new IceTurret(this.tile, this.type.with(type))
                break
            case TurretElement.Fire:
                this.tile.turret = new FlamethrowerTurret(this.tile, this.type.with(type))
                break
            case TurretElement.Earth:
                this.tile.turret = new AcidTurret(this.tile, this.type.with(type))
                break
            case TurretElement.Water:
                this.type.add(type)
                break
        }
    }

    static getInfo(type: TurretType): TurretInfo | undefined {
        return new TurretInfo(
            WaterTurret.turretName,
            WaterTurret.turretDescription[type.water > 1 ? 1 : 0],
            112 + type.water * 16,
            (type.water * 5).toString(),
            'wet(' + type.water + ') for 2s'
        )
    }

    getCurrentInfo(): TurretInfo | undefined { return WaterTurret.getInfo(this.type) }

    getInfoAfterUpgrade(type: TurretElement): TurretInfo | undefined {
        if (this.type.count >= 4) {
            return undefined
        }
        switch (type) {
            case TurretElement.Air: return IceTurret.getInfo(this.type.with(type))
            case TurretElement.Earth: return AcidTurret.getInfo(this.type.with(type))
            case TurretElement.Fire: return FlamethrowerTurret.getInfo(this.type.with(type))
            case TurretElement.Water: return WaterTurret.getInfo(this.type.with(type))
        }
    }

    renderPreviewAfterUpgrade(
        ctx: CanvasRenderingContext2D,
        x: number, y: number,
        type: TurretElement
    ): void {
        if (this.type.count >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                IceTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Earth:
                AcidTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Fire:
                FlamethrowerTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Water:
                WaterTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache('td_tower_aefW_water').then(
            tex => { WaterTurret.images = tex },
            () => new Promise<void>(resolve => {
                let sandTex = new NoiseTextureGenerator(
                    48, 48, '#F2EBC1', 0.08, 0, 1
                ).generateImage()
                let groundTex = new NoiseTextureGenerator(
                    48, 48, '#B9B5A0', 0.05, 0, 1
                ).generateImage()
                let c = new PreRenderedImage(48, 192)
                c.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex), 1, 1, 46, 46)
                c.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex), -2, 46, 52, 52)
                c.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex), -5, 91, 58, 58)
                c.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex), -8, 136)
                c.cacheImage('td_tower_aefW_water')
                WaterTurret.images = c.image
                resolve()
            })
        )
    }

    private static preRender(
        groundTex: CanvasImageSource,
        sandTex: CanvasImageSource
    ): CanvasImageSource {
        let waterTex = new CellularTextureGenerator(
            64, 64, Rand.i(16, 36), '#3584CE', '#3EB4EF', CellularTextureType.Balls
        ).generateImage()
        let textures = [groundTex, sandTex, waterTex]
        let pts: {
            pt_b: Vec2
            pt: Vec2
            pt_a: Vec2
        }[][] = [[], [], []]
        for (let i = 0; i < 8; ++i) {
            let d2 = Rand.r(16, 20)
            let d1 = Rand.r(d2 + 2, 24)
            let d0 = Rand.r(d1, 24)
            let a = i * Angle.deg45
            pts[0].push({ pt: Vec2.ld(d0, a, 32, 32), pt_b: Vec2.zero, pt_a: Vec2.zero })
            pts[1].push({ pt: Vec2.ld(d1, a, 32, 32), pt_b: Vec2.zero, pt_a: Vec2.zero })
            pts[2].push({ pt: Vec2.ld(d2, a, 32, 32), pt_b: Vec2.zero, pt_a: Vec2.zero })
        }
        for (let j = 0; j < 3; ++j) {
            let layer = pts[j]
            for (let i = 0; i < 8; ++i) {
                let ob = layer[(i + 7) % 8]
                let o = layer[i]
                let oa = layer[(i + 1) % 8]
                let angle = Angle.between(ob.pt.angleTo(o.pt), o.pt.angleTo(oa.pt))
                o.pt_a = Vec2.ld(5, angle, o.pt.x, o.pt.y)
                o.pt_b = Vec2.ld(5, angle + Angle.deg180, o.pt.x, o.pt.y)
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
                ctx.bezierCurveTo(o0.pt_a.x, o0.pt_a.y, o1.pt_b.x, o1.pt_b.y, o1.pt.x, o1.pt.y)
            }
            ctx.fillStyle = <CanvasPattern>ctx.createPattern(textures[j], 'repeat')
            ctx.fill()
        }
        return c.image
    }
}
