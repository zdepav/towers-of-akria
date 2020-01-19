/// <reference path="Turret.ts"/>

class LightningTurret extends Turret {

    private static image: CanvasImageSource
    private static turretName = "Lightning Tower"
    private static turretDescription = "Creates electric arcs that can jump between multiple enemies"
    
    private angle: number
    private animationTimer: number
    
    get ready(): boolean { return this.animationTimer < 0.3 && this.cooldown <= 0 }

    get range(): number { return 96 + this.type.air * 24 + this.type.fire * 8 }

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.angle = Angle.rand()
        this.animationTimer = 0
    }

    castLightning(a: Vec2, b: Vec2, baseLife: number): number {
        let v = b.sub(a)
        let vlength = v.length
        v = v.normalize()
        let stepCount = Math.ceil(vlength / 8)
        let step = vlength / stepCount
        let n = v.normal()
        let d = v.mul(step).add(n.mul(Rand.r(-6, 6))).add(a)
        this.game.spawnParticle(new LineParticle(a.x, a.y, d.x, d.y, baseLife, "#AFE8FF", 2))
        baseLife += 0.02
        for (var i = 2; i < stepCount; ++i) {
            let nd = v.mul(step * i).add(n.mul(Rand.r(-6, 6))).add(a)
            this.game.spawnParticle(new LineParticle(d.x, d.y, nd.x, nd.y, baseLife, "#AFE8FF", 2))
            baseLife += 0.02
            d = nd
        }
        this.game.spawnParticle(new LineParticle(d.x, d.y, b.x, b.y, baseLife, "#AFE8FF", 2))
        return baseLife + 0.02
    }

    step(time: number): void {
        time *= (this.type.count - 1) * 0.5
        if (this.cooldown > 0) {
            this.cooldown = Math.max(0, this.cooldown - time)
        }
        this.animationTimer = (this.animationTimer + time) % 1
        if (this.ready) {
            let enemies = this.game.findEnemiesInRange(this.center, this.range)
            if (enemies.length == 0) {
                return
            }
            let basePartLife = 0.5
            let hitEnemies: Enemy[] = []
            let prev = this.center
            let maxDist = this.range
            let damage = (this.type.air * 6 + this.type.fire * 10) / ((this.type.count - 1) * 0.5)
            for (let i = 0;; ++i) {
                let e = Rand.item(enemies) as Enemy
                if (hitEnemies.indexOf(e) >= 0 || e.pos.distanceTo(prev) > maxDist) {
                    break
                }
                e.dealDamage(damage)
                basePartLife = this.castLightning(prev, e.pos, basePartLife)
                hitEnemies.push(e)
                prev = e.pos
                maxDist *= 0.9
                damage *= 0.9
            }
            this.cooldown = 0.6
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx)
        ctx.translate(this.center.x, this.center.y)
        ctx.rotate(this.angle - Math.floor(this.animationTimer * 8) * Angle.deg45)
        ctx.drawImage(LightningTurret.image, -24, -24)
        ctx.resetTransform()
    }

    static renderPreview(ctx: CanvasRenderingContext2D, x: number, y: number, type: TurretType): void {
        ctx.drawImage(LightningTurret.image, x + 8, y + 8)
    }

    addType(type: TurretElement): void {
        if (this.type.count >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
            case TurretElement.Fire:
                this.type.add(type)
                break
            case TurretElement.Earth:
                this.tile.turret = new SunTurret(this.tile, this.type.with(type))
                break
            case TurretElement.Water:
                this.tile.turret = new PlasmaTurret(this.tile, this.type.with(type))
                break
        }
    }

    static getInfo(type: TurretType): TurretInfo | undefined {
        return new TurretInfo(
            LightningTurret.turretName,
            LightningTurret.turretDescription,
            96 + type.air * 24 + type.fire * 8,
            `${type.air * 6 + type.fire * 10}`
        )
    }

    getCurrentInfo(): TurretInfo | undefined { return LightningTurret.getInfo(this.type) }

    getInfoAfterUpgrade(type: TurretElement): TurretInfo | undefined {
        if (this.type.count >= 4) {
            return undefined
        }
        switch (type) {
            case TurretElement.Air: return LightningTurret.getInfo(this.type.with(type))
            case TurretElement.Earth: return SunTurret.getInfo(this.type.with(type))
            case TurretElement.Fire: return LightningTurret.getInfo(this.type.with(type))
            case TurretElement.Water: return PlasmaTurret.getInfo(this.type.with(type))
        }
    }

    renderPreviewAfterUpgrade(ctx: CanvasRenderingContext2D, x: number, y: number, type: TurretElement): void {
        if (this.type.count >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                LightningTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Earth:
                SunTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Fire:
                LightningTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Water:
                PlasmaTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache("td_tower_AeFw_lightning")
            .then(tex => { LightningTurret.image = tex },
                () => new Promise<void>(resolve => {
                    let c = new PreRenderedImage(48, 48)
                    let ctx = c.ctx
                    let grad = ctx.createRadialGradient(24, 24, 0, 24, 24, 18)
                    grad.addColorStop(0, "#FFFFFF")
                    grad.addColorStop(0.33, "#A97FFF")
                    grad.addColorStop(1, "#D6BFFF")
                    ctx.fillStyle = grad
                    ctx.beginPath()
                    ctx.moveTo(42, 24)
                    for (let i = 1; i < 16; ++i) {
                        let r = i % 2 == 0 ? 21 : 7
                        let a = i * Angle.deg45 / 2
                        ctx.lineTo(Vec2.ldx(r, a, 24), Vec2.ldy(r, a, 24))
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
                        ctx.translate(Vec2.ldx(18, a, 24), Vec2.ldy(18, a, 24))
                        if (j) {
                            ctx.rotate(Angle.deg45)
                        }
                        ctx.fillRect(-3, -3, 6, 6)
                        ctx.resetTransform()
                    }
                    grad = ctx.createRadialGradient(42, 24, 0, 42, 24, 8)
                    grad.addColorStop(0, "#FFFFFFC0")
                    grad.addColorStop(1, "#F8F2FF00")
                    ctx.fillStyle = grad
                    ctx.beginPath()
                    ctx.arc(42, 24, 8, 0, Angle.deg360)
                    ctx.closePath()
                    ctx.fill()
                    c.cacheImage("td_tower_AeFw_lightning")
                    LightningTurret.image = c.image
                    resolve()
                }))
    }
}
