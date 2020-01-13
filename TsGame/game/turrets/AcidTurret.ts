/// <reference path="Turret.ts"/>

class AcidTurret extends Turret {

    private static images: CanvasImageSource
    private static frameCount = 50
    private static turretName = "Acid Tower"
    private static turretDescription = "Covers enemies in armor dissolving acid"

    private frame: number

    get range(): number { return 80 + this.type.count * 16 }

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.frame = 0
    }

    step(time: number): void {
        super.step(time)
        this.frame = (this.frame + time * 25) % AcidTurret.frameCount
        if (this.ready) {
            let enemies = this.game.findEnemiesInRange(this.center, this.range)
            let enemy: Enemy | null = null
            let bestDistance: number = Infinity
            let bestStrength: number = Infinity
            let bestDuration: number = Infinity
            for (const e of enemies) {
                let effect = e.getEffect(eff => eff instanceof AcidEffect)
                let distance = this.center.distanceTo(e.pos)
                let strength = effect ? (effect as AcidEffect).strength : 0
                let duration = effect ? (effect as AcidEffect).duration : 0
                if (strength < bestStrength) {
                    enemy = e
                    bestDistance = distance
                    bestStrength = strength
                    bestDuration = duration
                } else if (strength == bestStrength) {
                    if (duration < bestDuration) {
                        enemy = e
                        bestDistance = distance
                        bestStrength = strength
                        bestDuration = duration
                    } else if (duration == bestDuration && distance < bestDistance) {
                        enemy = e
                        bestDistance = distance
                        bestStrength = strength
                        bestDuration = duration
                    }
                }
            }
            if (enemy) {
                this.game.spawnProjectile(new AcidProjectile(this.game, this.center, enemy, this.type.count))
                this.cooldown = 1 / this.type.count
            }
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx)
        ctx.drawImage(AcidTurret.images, Math.floor(this.frame) * 48, (this.type.water + this.type.earth - 2) * 48, 48, 48, this.tile.pos.x + 8, this.tile.pos.y + 8, 48, 48)
    }

    static renderPreview(ctx: CanvasRenderingContext2D, x: number, y: number, type: TurretType): void {
        ctx.drawImage(AcidTurret.images, 0, (type.water + type.earth - 2) * 48, 48, 48, x + 8, y + 8, 48, 48)
    }

    addType(type: TurretElement): void {
        if (this.type.count >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new MoonTurret(this.tile, this.type.with(type))
                break
            case TurretElement.Fire:
                this.tile.turret = new EarthquakeTurret(this.tile, this.type.with(type))
                break
            case TurretElement.Earth:
            case TurretElement.Water:
                this.type.add(type)
                break
        }
    }

    static getInfo(type: TurretType): TurretInfo | undefined {
        return new TurretInfo(
            AcidTurret.turretName,
            AcidTurret.turretDescription,
            80 + type.count * 16,
            `${type.count * 4} + acid`
        )
    }

    getCurrentInfo(): TurretInfo | undefined { return AcidTurret.getInfo(this.type) }

    getInfoAfterUpgrade(type: TurretElement): TurretInfo | undefined {
        if (this.type.count >= 4) {
            return undefined
        }
        switch (type) {
            case TurretElement.Air: return MoonTurret.getInfo(this.type.with(type))
            case TurretElement.Earth: return AcidTurret.getInfo(this.type.with(type))
            case TurretElement.Fire: return EarthquakeTurret.getInfo(this.type.with(type))
            case TurretElement.Water: return AcidTurret.getInfo(this.type.with(type))
        }
    }

    renderPreviewAfterUpgrade(ctx: CanvasRenderingContext2D, x: number, y: number, type: TurretElement): void {
        if (this.type.count >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                MoonTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Earth:
                AcidTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Fire:
                EarthquakeTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Water:
                AcidTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache("td_tower_aEfW_acid_strip" + AcidTurret.frameCount).then(tex => { AcidTurret.images = tex; }, () => new Promise<void>(resolve => {
            let acidTex = new CellularTextureGenerator(32, 32, 9, "#E0FF00", "#5B7F00", CellularTextureType.Balls).generateImage()
            let c = new PreRenderedImage(48 * AcidTurret.frameCount, 144)
            for (let i = 0; i < AcidTurret.frameCount; ++i) {
                AcidTurret.preRenderFrame(acidTex, c.ctx, i)
            }
            c.cacheImage("td_tower_aEfW_acid_strip" + AcidTurret.frameCount)
            AcidTurret.images = c.image
            resolve()
        }))
    }

    private static preRenderFrame(texture: CanvasImageSource, targetCtx: CanvasRenderingContext2D, frame: number): void {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg") as SVGSVGElement
        let offset = frame / AcidTurret.frameCount * 32
        let c0 = new PreRenderedImage(48, 48)
        let c1 = new PreRenderedImage(48, 48)
        let c2 = new PreRenderedImage(48, 48)
        let c = [c0, c1, c2]
        let ctx = c0.ctx
        ctx.beginPath()
        ctx.moveTo(18, 12)
        ctx.arcTo(36, 12, 36, 18, 6)
        ctx.arcTo(36, 36, 30, 36, 6)
        ctx.arcTo(12, 36, 12, 30, 6)
        ctx.arcTo(12, 12, 18, 12, 6)
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
            ctx.translate(24, 24)
            ctx.drawImage(ca.image, 12, -4 - i)
            ctx.rotate(Angle.deg90)
            ctx.drawImage(ca.image, 12, -4 - i)
            ctx.rotate(Angle.deg90)
            ctx.drawImage(ca.image, 12, -4 - i)
            ctx.rotate(Angle.deg90)
            ctx.drawImage(ca.image, 12, -4 - i)
            ctx.resetTransform()
            ctx.fillStyle = ctx.createPattern(texture, "repeat") as CanvasPattern
            ctx.beginPath()
            ctx.arc(24, 24, 6 + i, 0, Angle.deg360)
            ctx.closePath()
            ctx.fill()
            ctx.fillStyle = "#60606080"
            ctx.fill()
            let grad = ctx.createLinearGradient(17 - i / 2, 17 - i / 2, 30 + i / 2, 30 + i / 2)
            grad.addColorStop(0, "#808080")
            grad.addColorStop(1, "#404040")
            ctx.strokeStyle = grad
            ctx.lineWidth = 2 + i
            ctx.stroke()
        }
        targetCtx.drawImage(c0.image, frame * 48, 0)
        targetCtx.drawImage(c1.image, frame * 48, 48)
        targetCtx.drawImage(c2.image, frame * 48, 96)
    }
}
