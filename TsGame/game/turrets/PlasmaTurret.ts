﻿/// <reference path="Turret.ts"/>

class PlasmaTurret extends Turret {

    private static images: CanvasImageSource
    private static frameCount = 65

    private static turretName = "Plasma Tower"
    private static turretDescription = "Randomly hits enemies in range, occasionally burning or stunning them"

    private frame: number

    get range(): number { return 64 + this.type.air * 64 + this.type.water * 32 + this.type.fire * 32 }

    constructor(tile: Tile, type: TurretType) {
        super(tile, type)
        this.frame = 0
    }

    step(time: number): void {
        super.step(time)
        this.frame = (this.frame + time * 25) % PlasmaTurret.frameCount
        if (this.ready) {
            let enemies = this.game.findEnemiesInRange(this.center, this.range)
            if (enemies.length > 0) {
                let e = enemies[Math.floor(Math.random() * enemies.length)]
                e.dealDamage(this.type.count * 5 - 5 + 10 * Math.random())
                if (Math.random() < 0.05 * this.type.water) {
                    e.addEffect(new StunEffect(0.5))
                }
                if (Math.random() < 0.05 * this.type.fire) {
                    e.addEffect(new BurningEffect(1))
                }
                this.game.spawnParticle(new PlasmaBeamParticle(this.center.x, this.center.y, e.x, e.y))
            }
            this.cooldown = 0.5
        }
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean): void {
        super.render(ctx, preRender)
        if (preRender) {
            return
        }
        ctx.drawImage(PlasmaTurret.images, Math.floor(this.frame) * 64, (this.type.count - 3) * 64, 64, 64, this.tile.pos.x, this.tile.pos.y, 64, 64)
    }

    addType(type: TurretElement): void {
        if (this.type.count >= 4) {
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

    static getInfo(type: TurretType): TurretInfo | undefined {
        return new TurretInfo(
            PlasmaTurret.turretName,
            PlasmaTurret.turretDescription,
            64 + type.air * 64 + type.water * 16 + type.fire * 16,
            `${type.count * 10}`

        )
    }

    getCurrentInfo(): TurretInfo | undefined { return IceTurret.getInfo(this.type) }

    getInfoAfterUpgrade(type: TurretElement): TurretInfo | undefined {
        switch (type) {
            case TurretElement.Air: return PlasmaTurret.getInfo(this.type.add(type))
            case TurretElement.Earth: return ArcaneTurret.getInfo(this.type.add(type))
            case TurretElement.Fire: return PlasmaTurret.getInfo(this.type.add(type))
            case TurretElement.Water: return PlasmaTurret.getInfo(this.type.add(type))
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache("td_tower_AeFW_plasma_strip" + PlasmaTurret.frameCount).then(tex => { PlasmaTurret.images = tex; }, () => new Promise<void>(resolve => {
            let background = "#552BA800"
            let color1 = new PerlinNoiseTextureGenerator(64, 64, "#4B007A00", "#FFFFFF", 0.5)
            let tex1a = new CirclesTextureGenerator(64, 64, "#A389FFC0", color1, background, 0.4, 2, 0.7)
            let tex1b = new CirclesTextureGenerator(64, 64, "#A389FFC0", color1, background, 0.28, 3, 0.7)
            let color2 = new PerlinNoiseTextureGenerator(64, 64, "#552BA840", "#AF84FF", 0.5)
            let back2 = new LerpingSource(64, 64, background, color2, 0.5)
            let tex2a = new CirclesTextureGenerator(64, 64, color2, back2, background, 0.4, 2, 0.1)
            let tex2b = new CirclesTextureGenerator(64, 64, color2, back2, background, 0.28, 3, 0.1)
            let c = new PreRenderedImage(64 * PlasmaTurret.frameCount, 128)
            PlasmaTurret.preRender(c.ctx, tex1a, tex2a, 0)
            PlasmaTurret.preRender(c.ctx, tex1b, tex2b, 64)
            c.cacheImage("td_tower_AeFW_plasma_strip" + PlasmaTurret.frameCount)
            PlasmaTurret.images = c.image
            resolve()
        }))
    }

    private static preRender(ctx: CanvasRenderingContext2D, tex1: ColorSource, tex2: ColorSource, y: number): void {
        let back = RgbaColor.transparent.source()
        for (let i = 0; i < PlasmaTurret.frameCount; ++i) {
            let a = i * Angle.deg360 / PlasmaTurret.frameCount
            new CircleSource(64, 64, 32, 32, 32, new AddingSource(64, 64, new RotatingSource(64, 64, tex1, a, 32, 32), new RotatingSource(64, 64, tex2, -a, 32, 32)), back).generateInto(ctx, i * 64, y)
        }
    }

}
