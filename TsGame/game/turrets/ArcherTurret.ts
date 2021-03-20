/// <reference path="Turret.ts"/>

class ArcherTurret extends Turret {

    private static images: CanvasImageSource
    private static turretName = 'Archer Tower'
    private static turretDescription = 'Precise tower with long range and decent damage'

    private readonly angle: number

    get range(): number { return 80 + this.type.air * 64 + this.type.earth * 16 }

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.angle = Angle.rand()
    }

    step(time: number): void {
        super.step(time)
        if (this.ready) {
            let enemies = this.game.findEnemiesInRange(this.center, this.range)
            let enemy: Enemy | null = null
            let minHp = Infinity
            for (const e of enemies) {
                if (e.hp < minHp) {
                    enemy = e
                    minHp = e.hp
                }
            }
            if (enemy) {
                this.game.spawnProjectile(new ArrowProjectile(
                    this.game,
                    enemy.pos.sub(this.center).toLength(28).add(this.center),
                    enemy,
                    this.type.air * 4 + this.type.earth * 6
                ))
                this.game.playSound('arrow')
                this.cooldown = 0.5
            }
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx)
        ctx.translate(this.center.x, this.center.y)
        ctx.rotate(this.angle)
        ctx.drawImage(
            ArcherTurret.images,
            0, (this.type.count - 2) * 48, 48, 48,
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
            ArcherTurret.images,
            0, (type.count - 2) * 48, 48, 48,
            x + 8, y + 8, 48, 48
        )
    }

    addType(type: TurretElement): void {
        if (this.type.count >= 4) {
            return
        }
        switch (type) {
            case TurretElement.Air:
            case TurretElement.Earth:
                this.type.add(type)
                break
            case TurretElement.Fire:
                this.tile.turret = new SunTurret(this.tile, this.type.with(type))
                break
            case TurretElement.Water:
                this.tile.turret = new MoonTurret(this.tile, this.type.with(type))
                break
        }
    }

    static getInfo(type: TurretType): TurretInfo | undefined {
        let a = type.air - 1
        let e = type.earth - 1
        return new TurretInfo(
            ArcherTurret.turretName,
            ArcherTurret.turretDescription,
            160 + a * 64 + e * 16,
            (16 + a * 8 + e * 12).toString()
        )
    }

    getCurrentInfo(): TurretInfo | undefined { return ArcherTurret.getInfo(this.type) }

    getInfoAfterUpgrade(type: TurretElement): TurretInfo | undefined {
        if (this.type.count >= 4) {
            return undefined
        }
        switch (type) {
            case TurretElement.Air:
                return ArcherTurret.getInfo(this.type.with(type))
                    ?.withUpgradeNote('significantly improves range')
            case TurretElement.Earth:
                return ArcherTurret.getInfo(this.type.with(type))
                    ?.withUpgradeNote('significantly improves damage')
            case TurretElement.Fire:
                return SunTurret.getInfo(this.type.with(type))
            case TurretElement.Water:
                return MoonTurret.getInfo(this.type.with(type))
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
                ArcherTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Earth:
                ArcherTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Fire:
                SunTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
            case TurretElement.Water:
                MoonTurret.renderPreview(ctx, x, y, this.type.with(type))
                break
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache('td_tower_AEfw_archer').then(
            tex => { ArcherTurret.images = tex },
            () => new Promise<void>(resolve => {
                let c = new PreRenderedImage(48, 144)
                let argSets = [
                    { h: 10, y: 0, s: 0.7 },
                    { h: 11, y: 48, s: 0.85 },
                    { h: 12, y: 96, s: 1 },
                ]
                let noise = new NoiseTextureGenerator(48, 48, '#E0D2B3', 0.125, 0, 1)
                for (const args of argSets) {
                    let src: ColorSource = new RoofTilesSource(
                        48, 48, args.h, 3, noise, '#706859', RgbaColor.transparent
                    )
                    src = new PolarSource(48, 48, src)
                    if (args.s < 1) {
                        src = new ScalingSource(48, 48, src, args.s, 24, 24)
                    }
                    src = new CircleSource(
                        48, 48, 24, 24, 23 * args.s, src, RgbaColor.transparent
                    )
                    src = new FisheyeSource(48, 48, src, 0.5, 24, 24, 24)
                    src = new AntialiasedSource(48, 48, src)
                    src.generateInto(c.ctx, 0, args.y)
                }
                c.cacheImage('td_tower_AEfw_archer')
                ArcherTurret.images = c.image
                resolve()
            })
        )
    }
}
