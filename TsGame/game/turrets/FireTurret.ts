/// <reference path="Turret.ts"/>

class FireTurret extends Turret {

    private static image: CanvasImageSource
    private static turretName = 'Fire Tower'
    private static turretDescription1 = 'Can set enemies on fire'
    private static turretDescription2 = 'Sets enemies on fire (deals 5 damage per second)'

    private readonly angle: number

    private smokeTimer: number

    get range(): number { return 96 + this.type.fire * 16 }

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.angle = Angle.rand()
        this.smokeTimer = Rand.i(0.5, 4)
    }

    spawnSmoke(): void {
        let x: number
        let y: number
        let r = 5 + this.type.fire
        do {
            x = Rand.r(r * 2) - r
            y = Rand.r(r * 2) - r
        } while (x * x + y * y > 100)
        this.smokeTimer = Rand.i(0.5, 6 - this.type.fire)
        this.game.spawnParticle(new SmokeParticle(this.center.x + x, this.center.y + y, 0))
    }

    step(time: number): void {
        super.step(time)
        this.smokeTimer -= time
        if (this.smokeTimer <= 0) {
            this.spawnSmoke()
        }
        if (this.ready) {
            let enemies = this.game.findEnemiesInRange(this.center, this.range)
            let enemy: Enemy | null = null
            let bestDistance: number = Infinity
            let bestDuration: number = Infinity
            for (const e of enemies) {
                let effect = e.getEffect(eff => eff instanceof BurningEffect)
                let distance = this.center.distanceTo(e.pos)
                let duration = effect ? (effect as BurningEffect).duration : 0
                if (duration < bestDuration) {
                    enemy = e
                    bestDistance = distance
                    bestDuration = duration
                } else if (duration == bestDuration && distance < bestDistance) {
                    enemy = e
                    bestDistance = distance
                    bestDuration = duration
                }
            }
            if (enemy) {
                this.game.spawnProjectile(new FireProjectile(
                    this.game,
                    this.center,
                    enemy,
                    9 / this.type.fire + 6,
                    this.type.fire / 2 + 1,
                    this.range
                ))
                this.game.playSound('fire')
                this.cooldown = 1.5 / this.type.fire
            }
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx)
        let r = 16 + 2 * this.type.fire
        ctx.translate(this.center.x, this.center.y)
        ctx.rotate(this.angle)
        ctx.drawImage(FireTurret.image, -r, -r, r * 2, r * 2)
        ctx.resetTransform()
    }

    static renderPreview(
        ctx: CanvasRenderingContext2D,
        x: number, y: number,
        type: TurretType
    ): void {
        let r = 16 + 2 * type.fire
        ctx.drawImage(FireTurret.image, x + 32 - r, y + 32 - r, r * 2, r * 2)
    }

    addType(type: TurretElement): void {
        if (this.type.count >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new LightningTurret(this.tile, this.type.with(type))
                break
            case TurretElement.Earth:
                this.tile.turret = new CannonTurret(this.tile, this.type.with(type))
                break
            case TurretElement.Fire:
                this.type.add(type)
                break
            case TurretElement.Water:
                this.tile.turret = new FlamethrowerTurret(this.tile, this.type.with(type))
                break
        }
    }

    static getInfo(type: TurretType): TurretInfo | undefined {
        return new TurretInfo(
            FireTurret.turretName,
            type.fire > 2 ? FireTurret.turretDescription2 : FireTurret.turretDescription1,
            96 + type.fire * 16,
            (6 + type.fire * 4).toString(),
            'burning for ' + (type.fire / 2 + 1) + 's'
        )
    }

    getCurrentInfo(): TurretInfo | undefined { return FireTurret.getInfo(this.type) }

    getInfoAfterUpgrade(type: TurretElement): TurretInfo | undefined {
        if (this.type.count >= 4) {
            return undefined
        }
        switch (type) {
            case TurretElement.Air:
                return LightningTurret.getInfo(this.type.with(type))
            case TurretElement.Earth:
                return CannonTurret.getInfo(this.type.with(type))
            case TurretElement.Fire:
                return FireTurret.getInfo(this.type.with(type))
            case TurretElement.Water:
                return FlamethrowerTurret.getInfo(this.type.with(type))
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
                LightningTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Earth:
                CannonTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Fire:
                FireTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Water:
                FlamethrowerTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache('td_tower_aeFw_fire').then(
            tex => { FireTurret.image = tex },
            () => new Promise<void>(resolve => {
                let c = new PreRenderedImage(48, 48)
                let texLava = new CellularTextureGenerator(
                    48, 48, 36, '#FF5020', '#C00000', CellularTextureType.Balls
                )
                let texRock = new CellularTextureGenerator(
                    48, 48, 144, '#662D22', '#44150D', CellularTextureType.Balls
                )
                let renderable = new RenderablePathSet()
                let path = new Path2D()
                for (let k = 0; k < 36; ++k) {
                    let radius = 20 + Rand.r(4)
                    let a = k * Angle.deg10
                    if (k === 0) {
                        path.moveTo(Vec2.ldx(radius, a, 24), Vec2.ldy(radius, a, 24))
                    }
                    else {
                        path.lineTo(Vec2.ldx(radius, a, 24), Vec2.ldy(radius, a, 24))
                    }
                }
                path.closePath()
                renderable.pushNew(path, c.ctx.createPattern(texRock.generateImage(), 'no-repeat'))
                let grad = c.ctx.createRadialGradient(24, 24, 24, 24, 24, 10)
                grad.addColorStop(0, '#300000')
                grad.addColorStop(1, '#30000000')
                renderable.pushNew(path, grad)
                path = new Path2D()
                for (let k = 0; k < 18; ++k) {
                    let radius = 9 + Rand.r(2)
                    let a = k * Angle.deg20
                    if (k === 0) {
                        path.moveTo(Vec2.ldx(radius, a, 24), Vec2.ldy(radius, a, 24))
                    }
                    else {
                        path.lineTo(Vec2.ldx(radius, a, 24), Vec2.ldy(radius, a, 24))
                    }
                }
                path.closePath()
                renderable.pushNew(path, c.ctx.createPattern(texLava.generateImage(), 'no-repeat'))
                renderable.render(c.ctx)
                c.cacheImage('td_tower_aeFw_fire')
                FireTurret.image = c.image
                resolve()
            })
        )
    }
}
