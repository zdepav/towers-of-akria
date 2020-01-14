/// <reference path="Turret.ts"/>

class CannonTurret extends Turret {

    private static image: CanvasImageSource
    private static turretName = "Cannon Tower"
    private static turretDescription = "Fires explosives, possibly hitting multiple enemies at once"

    private angle: number

    get range(): number { return 96 + this.type.count * 16 }

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.angle = Angle.rand()
    }

    private createExplosionAt(pos: Vec2): void {
        let r = 10 + this.type.count * 4
        for (let i = 0, c = 9 + this.type.count; i < c; ++i) {
            let p = Vec2.randUnit3d().mul(r).add(pos)
            this.game.spawnParticle(new ExplosionParticle(p.x, p.y))
        }
        r = 16 + this.type.count * 4
        for (let i = 0, c = 9 + this.type.count * 4; i < c; ++i) {
            let p = Vec2.randUnit3d().mul(r).add(pos)
            this.game.spawnParticle(new SmokeParticle(p.x, p.y, Math.random() * 2))
        }
        r = 24 + this.type.count * 4
        for (const enemy of this.game.findEnemiesInRange(pos, r)) {
            enemy.dealDamage(20 * this.type.earth + 10 * this.type.fire - 10)
            if (Math.random() < (this.type.fire - 1) / 4) {
                enemy.addEffect(new BurningEffect(this.type.fire))
            }
        }
    }

    step(time: number): void {
        super.step(time)
        let enemies = this.game.findEnemiesInRange(this.center, this.range)
        let enemy: Enemy | null = null
        let closestAngle = Infinity
        for (const e of enemies) {
            let a = this.center.angleTo(e.pos)
            let diff = Angle.toDegrees(Angle.absDifference(this.angle, a)) + this.center.distanceTo(e.pos)
            if (diff < closestAngle) {
                enemy = e
                closestAngle = diff
            }
        }
        if (enemy) {
            let a = this.center.angleTo(enemy.pos)
            this.angle = Angle.rotateTo(this.angle, a, Angle.deg120 * time)
            if (this.ready) {
                let d = this.center.distanceTo(enemy.pos)
                let t = Vec2.ld(d, this.angle, this.center.x, this.center.y)
                if (t.distanceTo(enemy.pos) < 16) {
                    let firingPos = this.center.addld(18 + this.type.count * 2, this.angle)
                    let cp = new CannonballProjectile(this.game, firingPos, t)
                    cp.onhit = pos =>this.createExplosionAt(pos)
                    this.game.spawnProjectile(cp)
                    for (let i = 0; i < 8; ++i) {
                        this.game.spawnParticle(new CannonSmokeParticle(firingPos, this.angle))
                    }
                    this.cooldown = 2
                }
            }
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx)
        let r = 12 + this.type.count
        ctx.translate(this.center.x, this.center.y)
        ctx.rotate(this.angle)
        ctx.translate(-3 * this.cooldown, 0)
        ctx.drawImage(CannonTurret.image, -r * 2, -r, r * 4, r * 2)
        ctx.resetTransform()
    }

    static renderPreview(ctx: CanvasRenderingContext2D, x: number, y: number, type: TurretType): void {
        let r = 12 + type.count
        ctx.drawImage(CannonTurret.image, x + 32 - r * 2, y + 32 - r, r * 4, r * 2)
    }

    addType(type: TurretElement): void {
        if (this.type.count >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new SunTurret(this.tile, this.type.with(type))
                break
            case TurretElement.Earth:
            case TurretElement.Fire:
                this.type.add(type)
                break
            case TurretElement.Water:
                this.tile.turret = new EarthquakeTurret(this.tile, this.type.with(type))
                break
        }
    }

    static getInfo(type: TurretType): TurretInfo | undefined {
        return new TurretInfo(
            CannonTurret.turretName,
            CannonTurret.turretDescription,
            96 + type.count * 16,
            `${10 * type.earth + 5 * type.fire - 5}${type.fire > 1 ? " + burning" : ""}`
        )
    }

    getCurrentInfo(): TurretInfo | undefined { return FireTurret.getInfo(this.type) }

    getInfoAfterUpgrade(type: TurretElement): TurretInfo | undefined {
        if (this.type.count >= 4) {
            return undefined
        }
        switch (type) {
            case TurretElement.Air:
                return SunTurret.getInfo(this.type.with(type))
            case TurretElement.Earth:
                return CannonTurret.getInfo(this.type.with(type))
            case TurretElement.Fire:
                return CannonTurret.getInfo(this.type.with(type))
            case TurretElement.Water:
                return EarthquakeTurret.getInfo(this.type.with(type))
        }
    }

    renderPreviewAfterUpgrade(ctx: CanvasRenderingContext2D, x: number, y: number, type: TurretElement): void {
        if (this.type.count >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                SunTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Earth:
                CannonTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Fire:
                CannonTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Water:
                EarthquakeTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache("td_tower_aEFw_cannon")
            .then(tex => { CannonTurret.image = tex; },
                () => new Promise<void>(resolve => {
                    let c = new PreRenderedImage(64, 32)
                    let ctx = c.ctx
                    let grad = ctx.createLinearGradient(20, 16, 40, 16)
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
                    ctx.fillRect(20, 3, 20, 26)
                    ctx.beginPath()
                    ctx.arc(20, 16, 7, Angle.deg90, Angle.deg270)
                    ctx.arcTo(42, 9, 52, 12, 50)
                    ctx.arc(54, 12, 2, Angle.deg180, Angle.deg360)
                    ctx.lineTo(56, 20)
                    ctx.arc(54, 20, 2, 0, Angle.deg180)
                    ctx.arcTo(45, 23, 38, 23, 50)
                    ctx.closePath()
                    ctx.strokeStyle = "#101010"
                    ctx.lineWidth = 2
                    ctx.stroke()
                    ctx.fillStyle = "#303030"
                    ctx.fill()
                    ctx.beginPath()
                    ctx.moveTo(52, 12)
                    ctx.lineTo(52, 20)
                    ctx.lineWidth = 1
                    ctx.stroke()
                    c.cacheImage("td_tower_aEFw_cannon")
                    CannonTurret.image = c.image
                    resolve()
                }))
    }
}
