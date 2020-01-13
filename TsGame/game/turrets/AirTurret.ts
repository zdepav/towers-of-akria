/// <reference path="Turret.ts"/>

class AirTurret extends Turret {

    private static image: CanvasImageSource
    private static turretName = "Air Tower"
    private static turretDescription = "Constantly deals damage to all enemies in range"

    private angle: number

    get range(): number { return 96 + this.type.air * 32 }

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.angle = 0
    }

    step(time: number): void {
        super.step(time)
        this.angle = (this.angle + Angle.deg360 - time * Angle.deg120) % Angle.deg360
        for (const enemy of this.game.findEnemiesInRange(this.center, this.range)) {
            enemy.dealDamage((6 + this.type.air * 4) * time)
            if (Math.random() < 0.01 * this.type.air) {
                this.game.spawnParticle(new WindParticle(enemy.x + Utils.randInt(-6, 7), enemy.y + Utils.randInt(-6, 7)))
            }
        }
    }

    static _render(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, type: TurretType, angle: number = 0): void {
        ctx.translate(centerX, centerY)
        ctx.rotate(angle)
        ctx.drawImage(AirTurret.image, -24, -8)
        switch (type.air) {
            case 1:
                ctx.rotate(Angle.deg90)
                ctx.drawImage(AirTurret.image, -24, -8)
                break
            case 2:
                for (let i = 0; i < 2; ++i) {
                    ctx.rotate(Angle.deg60)
                    ctx.drawImage(AirTurret.image, -24, -8)
                }
                break
            case 3:
                for (let i = 0; i < 3; ++i) {
                    ctx.rotate(Angle.deg45)
                    ctx.drawImage(AirTurret.image, -24, -8)
                }
                break
            case 4:
                for (let i = 0; i < 4; ++i) {
                    ctx.rotate(Angle.deg36)
                    ctx.drawImage(AirTurret.image, -24, -8)
                }
                break
        }
        ctx.resetTransform()
    }

    render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx)
        AirTurret._render(ctx, this.center.x, this.center.y, this.type, this.angle)
    }

    static renderPreview(ctx: CanvasRenderingContext2D, x: number, y: number, type: TurretType): void {
        AirTurret._render(ctx, x + 32, y + 32, type)
    }

    addType(type: TurretElement): void {
        if (this.type.count >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                this.type.add(type)
                break
            case TurretElement.Earth:
                this.tile.turret = new ArcherTurret(this.tile, this.type.with(type))
                break
            case TurretElement.Fire:
                this.tile.turret = new LightningTurret(this.tile, this.type.with(type))
                break
            case TurretElement.Water:
                this.tile.turret = new IceTurret(this.tile, this.type.with(type))
                break
        }
    }

    static getInfo(type: TurretType): TurretInfo | undefined {
        return new TurretInfo(
            AirTurret.turretName,
            AirTurret.turretDescription,
            96 + type.air * 32,
            `${6 + type.air * 4}`
            
        )
    }

    getCurrentInfo(): TurretInfo | undefined { return AirTurret.getInfo(this.type) }

    getInfoAfterUpgrade(type: TurretElement): TurretInfo | undefined {
        if (this.type.count >= 4) {
            return undefined
        }
        switch (type) {
            case TurretElement.Air: return AirTurret.getInfo(this.type.with(type))
            case TurretElement.Earth: return ArcherTurret.getInfo(this.type.with(type))
            case TurretElement.Fire: return LightningTurret.getInfo(this.type.with(type))
            case TurretElement.Water: return IceTurret.getInfo(this.type.with(type))
        }
    }

    renderPreviewAfterUpgrade(ctx: CanvasRenderingContext2D, x: number, y: number, type: TurretElement): void {
        if (this.type.count >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
                AirTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Earth:
                ArcherTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Fire:
                LightningTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Water:
                IceTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache("td_tower_Aefw_air").then(tex => { AirTurret.image = tex; }, () => new Promise<void>(resolve => {
            let c = new PreRenderedImage(48, 16)
            let renderable = new RenderablePathSet()
            let path = new Path2D()
            path.ellipse(36, 8, 12, 8, 0, 0, Angle.deg180)
            let grad = c.ctx.createLinearGradient(24, 8, 24, 16)
            renderable.pushNew(path, grad)
            path = new Path2D()
            path.ellipse(12, 8, 12, 8, 0, Angle.deg180, 0)
            grad = c.ctx.createLinearGradient(24, 8, 24, 0)
            renderable.pushNew(path, grad)
            path = new Path2D()
            path.arc(24, 8, 8, 0, Angle.deg360)
            grad = c.ctx.createRadialGradient(24, 8, 8, 24, 8, 4)
            renderable.pushNew(path, grad)
            for (const rp of renderable.paths) {
                rp.path.closePath()
                const gr = rp.fill as CanvasGradient
                gr.addColorStop(0, "#B2A5FF")
                gr.addColorStop(1, "#A0A0A0")
            }
            renderable.render(c.ctx)
            c.cacheImage("td_tower_Aefw_air")
            AirTurret.image = c.image
            resolve()
        }))
    }
}
