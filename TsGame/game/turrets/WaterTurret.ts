/// <reference path="../game.d.ts"/>

class WaterTurret extends Turret {

    private static images: CanvasImageSource;

    private angle: number;

    constructor(tile: Tile, type: TurretType) {
        super(tile, type);
        this.angle = Angle.rand();
    }

    step(time: number): void {
        super.step(time);
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean): void {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.drawImage(WaterTurret.images, 0, (this.type.count() - 1) * 48, 48, 48, -24, -24, 48, 48);
        ctx.resetTransform();
    }

    addType(type: TurretElement): void {
        if (this.type.count() >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new IceTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Fire:
                this.tile.turret = new FlamethrowerTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Earth:
                this.tile.turret = new AcidTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Water:
                this.type.add(type);
                break;
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache("td_tower_aefW_water").then(tex => { WaterTurret.images = tex; }, () => new Promise<void>(resolve => {
            let sandTex = new NoiseTextureGenerator(48, 48, "#F2EBC1", 0.08, 0, 1).generateImage();
            let groundTex = new NoiseTextureGenerator(48, 48, "#B9B5A0", 0.05, 0, 1).generateImage();
            let c = new PreRenderedImage(48, 192);
            c.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex), 1, 1, 46, 46);
            c.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex), -2, 46, 52, 52);
            c.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex), -5, 91, 58, 58);
            c.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex), -8, 136);
            c.cacheImage("td_tower_aefW_water");
            WaterTurret.images = c.image;
            resolve();
        }));
    }

    private static preRender(groundTex: CanvasImageSource, sandTex: CanvasImageSource): CanvasImageSource {
        let waterTex = new CellularTextureGenerator(64, 64, Utils.randInt(16, 36), "#3584CE", "#3EB4EF", CellularTextureType.Balls).generateImage();
        let textures = [groundTex, sandTex, waterTex];
        let pts: {
            pt_b: Vec2;
            pt: Vec2;
            pt_a: Vec2;
        }[][] = [[], [], []];
        for (let i = 0; i < 8; ++i) {
            let d2 = Utils.rand(16, 20);
            let d1 = Utils.rand(d2 + 2, 24);
            let d0 = Utils.rand(d1, 24);
            let a = i * Angle.deg45;
            pts[0].push({ pt: Utils.ld(d0, a, 32, 32), pt_b: Vec2.zero, pt_a: Vec2.zero });
            pts[1].push({ pt: Utils.ld(d1, a, 32, 32), pt_b: Vec2.zero, pt_a: Vec2.zero });
            pts[2].push({ pt: Utils.ld(d2, a, 32, 32), pt_b: Vec2.zero, pt_a: Vec2.zero });
        }
        for (let j = 0; j < 3; ++j) {
            let layer = pts[j];
            for (let i = 0; i < 8; ++i) {
                let ob = layer[(i + 7) % 8];
                let o = layer[i];
                let oa = layer[(i + 1) % 8];
                let angle = Angle.between(ob.pt.angleTo(o.pt), o.pt.angleTo(oa.pt));
                o.pt_a = Utils.ld(5, angle, o.pt.x, o.pt.y);
                o.pt_b = Utils.ld(5, angle + Angle.deg180, o.pt.x, o.pt.y);
            }
        }
        let c = new PreRenderedImage(64, 64);
        let ctx = c.ctx;
        for (let j = 0; j < 3; ++j) {
            let layer = pts[j];
            ctx.beginPath();
            ctx.moveTo(layer[0].pt.x, layer[0].pt.y);
            for (let i = 0; i < 8; ++i) {
                let o0 = layer[i];
                let o1 = layer[(i + 1) % 8];
                ctx.bezierCurveTo(o0.pt_a.x, o0.pt_a.y, o1.pt_b.x, o1.pt_b.y, o1.pt.x, o1.pt.y);
            }
            ctx.fillStyle = ctx.createPattern(textures[j], "repeat") as CanvasPattern;
            ctx.fill();
        }
        return c.image;
    }

}
