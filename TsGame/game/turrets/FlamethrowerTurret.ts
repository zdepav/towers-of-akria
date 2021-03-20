/// <reference path="Turret.ts"/>

class FlamethrowerTurret extends Turret {

    private static image: CanvasImageSource
    private static turretName = 'Flamethrower Tower'
    private static turretDescription = 'Constantly sprays enemies with fire'

    private angle: number

    private sound: Sound

    get range(): number { return 64 + this.type.count * 16 }

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.angle = Angle.rand()
        this.sound = this.game.createSound('flamethrower', true)
    }

    dispose(): void {
        this.sound.stop()
    }

    step(time: number): void {
        super.step(time)
        let enemies = this.game.findEnemiesInRange(this.center, this.range)
        let enemy: Enemy | null = null
        let closestAngle = Infinity
        for (const e of enemies) {
            let dist = this.center.distanceTo(e.pos)
            let a = this.center.angleTo(e.posAhead(dist * 0.5 / this.range))
            let diff = Angle.toDegrees(Angle.absDifference(this.angle, a)) +
                this.center.distanceTo(e.pos)
            if (diff < closestAngle) {
                enemy = e
                closestAngle = diff
            }
        }
        if (enemy) {
            let dist = this.center.distanceTo(enemy.pos)
            let a = this.center.angleTo(enemy.posAhead(dist * 0.5 / this.range))
            this.angle = Angle.rotateTo(this.angle, a, Angle.deg180 * time)
            let spread = Angle.deg(15 + this.type.count * 5)
            if (this.ready && Angle.absDifference(a, this.angle) < spread / 4) {
                let firingPos = this.center.addld(18 + this.type.count * 3, this.angle)
                let r = this.range - 18 - this.type.count * 3
                this.game.spawnProjectile(new FlameProjectile(
                    this.game, firingPos, this.angle, r, this.type.count - 1
                ))
                for (let i = 0; i < 4; ++i) {
                    this.game.spawnParticle(new FlameParticle(
                        firingPos, this.angle + Rand.r(spread) - spread / 2, r
                    ))
                }
                this.sound.resume()
                return
            }
        }
        this.sound.pause()
    }

    render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx)
        let r = 12 + this.type.count * 3
        ctx.translate(this.center.x, this.center.y)
        ctx.rotate(this.angle)
        ctx.drawImage(FlamethrowerTurret.image, -r, -r, r * 2, r * 2)
        ctx.resetTransform()
    }

    static renderPreview(
        ctx: CanvasRenderingContext2D,
        x: number, y: number,
        type: TurretType
    ): void {
        ctx.drawImage(FlamethrowerTurret.image, x + 8, y + 8)
    }

    addType(type: TurretElement): void {
        if (this.type.count >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new PlasmaTurret(this.tile, this.type.with(type))
                break
            case TurretElement.Earth:
                this.tile.turret = new EarthquakeTurret(this.tile, this.type.with(type))
                break
            case TurretElement.Fire:
            case TurretElement.Water:
                this.type.add(type)
                break
        }
    }

    static getInfo(type: TurretType): TurretInfo | undefined {
        return new TurretInfo(
            FlamethrowerTurret.turretName,
            FlamethrowerTurret.turretDescription,
            64 + type.count * 16,
            (5 + 5 * type.count).toString(),
            'burning for 2s'
        )
    }

    getCurrentInfo(): TurretInfo | undefined { return FlamethrowerTurret.getInfo(this.type) }

    getInfoAfterUpgrade(type: TurretElement): TurretInfo | undefined {
        if (this.type.count >= 4) {
            return undefined
        }
        switch (type) {
            case TurretElement.Air:
                return PlasmaTurret.getInfo(this.type.with(type))
            case TurretElement.Earth:
                return EarthquakeTurret.getInfo(this.type.with(type))
            case TurretElement.Fire:
                return FlamethrowerTurret.getInfo(this.type.with(type))
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
                PlasmaTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Earth:
                EarthquakeTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Fire:
                FlamethrowerTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Water:
                FlamethrowerTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache('td_tower_aeFW_flamethrower').then(
            tex => { FlamethrowerTurret.image = tex },
            () => new Promise<void>(resolve => {
                let c = new PreRenderedImage(48, 48)
                let tex = new GlassTextureGenerator(
                    48, 48, '#7A912A', '#ACCC3B', 0.5
                ).generateImage()
                let ctx = c.ctx

                let grad = ctx.createLinearGradient(24, 22, 24, 26)
                grad.addColorStop(0.0, '#A0A0A0')
                grad.addColorStop(0.2, '#B0B0B0')
                grad.addColorStop(0.5, '#C0C0C0')
                grad.addColorStop(0.8, '#B0B0B0')
                grad.addColorStop(1.0, '#A0A0A0')
                ctx.fillStyle = grad
                ctx.fillRect(24, 22, 24, 4)

                grad = ctx.createLinearGradient(24, 21, 24, 27)
                grad.addColorStop(0.0, '#A0A0A0')
                grad.addColorStop(0.2, '#B8B8B8')
                grad.addColorStop(0.5, '#D0D0D0')
                grad.addColorStop(0.8, '#B8B8B8')
                grad.addColorStop(1.0, '#A0A0A0')
                ctx.fillStyle = grad
                ctx.fillRect(44, 21, 4, 6)

                ctx.fillStyle = '#A0A0A0'
                ctx.fillRect(16, 18, 16, 12)

                grad = ctx.createRadialGradient(24, 24, 2, 24, 24, 5)
                grad.addColorStop(0, '#C0C0C0')
                grad.addColorStop(1, '#A0A0A0')
                ctx.fillStyle = grad
                ctx.beginPath()
                ctx.arc(24, 24, 5, 0, Angle.deg360)
                ctx.fill()

                ctx.fillStyle = ctx.createPattern(tex, 'repeat') as CanvasPattern
                ctx.strokeStyle = '#C0C0C0'
                ctx.lineWidth = 2

                ctx.beginPath()
                ctx.moveTo(24, 18)
                ctx.arcTo(12, 18, 12, 13, 4)
                ctx.arcTo(12, 8, 24, 8, 4)
                ctx.arcTo(36, 8, 36, 13, 4)
                ctx.arcTo(36, 18, 24, 18, 4)
                ctx.closePath()
                ctx.fill()
                ctx.stroke()

                ctx.beginPath()
                ctx.moveTo(24, 30)
                ctx.arcTo(12, 30, 12, 35, 4)
                ctx.arcTo(12, 40, 24, 40, 4)
                ctx.arcTo(36, 40, 36, 35, 4)
                ctx.arcTo(36, 30, 24, 30, 4)
                ctx.closePath()
                ctx.fill()
                ctx.stroke()

                c.cacheImage('td_tower_aeFW_flamethrower')
                FlamethrowerTurret.image = c.image
                resolve()
            })
        )
    }
}
