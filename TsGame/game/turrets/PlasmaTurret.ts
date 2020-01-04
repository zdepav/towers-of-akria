/// <reference path="../game.d.ts"/>

class PlasmaTurret extends Turret {

    private static images: CanvasImageSource;
    private static frameCount: number;

    private frame: number;

    constructor(tile: Tile, type: TurretType) {
        super(tile, type);
        this.frame = 0;
    }

    step(time: number): void {
        super.step(time);
        this.frame = (this.frame + time * 25) % PlasmaTurret.frameCount;
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean): void {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.drawImage(PlasmaTurret.images, Math.floor(this.frame) * 64, (this.type.count() - 3) * 64, 64, 64, this.tile.pos.x, this.tile.pos.y, 64, 64);
    }

    addType(type: TurretElement): void {
        if (this.type.count() >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
            case TurretElement.Fire:
            case TurretElement.Water:
                this.type.add(type);
                break;
            case TurretElement.Earth:
                this.tile.turret = new ArcaneTurret(this.tile, this.type.add(type));
                break;
        }
    }

    static init(): Promise<void> {
        PlasmaTurret.frameCount = 65;
        return Utils.getImageFromCache("td_tower_AeFW_plasma_strip" + PlasmaTurret.frameCount).then(tex => { PlasmaTurret.images = tex; }, () => new Promise<void>(resolve => {
            let background = "#552BA800";
            let color1 = new PerlinNoiseTextureGenerator(64, 64, "#4B007A00", "#FFFFFF", 0.5);
            let tex1a = new CirclesTextureGenerator(64, 64, "#A389FFC0", color1, background, 0.4, 2, 0.7);
            let tex1b = new CirclesTextureGenerator(64, 64, "#A389FFC0", color1, background, 0.28, 3, 0.7);
            let color2 = new PerlinNoiseTextureGenerator(64, 64, "#552BA840", "#AF84FF", 0.5);
            let back2 = new LerpingSource(64, 64, background, color2, 0.5);
            let tex2a = new CirclesTextureGenerator(64, 64, color2, back2, background, 0.4, 2, 0.1);
            let tex2b = new CirclesTextureGenerator(64, 64, color2, back2, background, 0.28, 3, 0.1);
            let c = new PreRenderedImage(64 * PlasmaTurret.frameCount, 128);
            PlasmaTurret.preRender(c.ctx, tex1a, tex2a, 0);
            PlasmaTurret.preRender(c.ctx, tex1b, tex2b, 64);
            c.cacheImage("td_tower_AeFW_plasma_strip" + PlasmaTurret.frameCount);
            PlasmaTurret.images = c.image;
            resolve();
        }));
    }

    private static preRender(ctx: CanvasRenderingContext2D, tex1: ColorSource, tex2: ColorSource, y: number): void {
        let back = RgbaColor.transparent.source();
        for (let i = 0; i < PlasmaTurret.frameCount; ++i) {
            let a = i * Angle.deg360 / PlasmaTurret.frameCount;
            new CircleSource(64, 64, 32, 32, 32, new AddingSource(64, 64, new RotatingSource(64, 64, tex1, a, 32, 32), new RotatingSource(64, 64, tex2, -a, 32, 32)), back).generateInto(ctx, i * 64, y);
        }
    }

}
