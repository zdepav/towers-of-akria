/// <reference path="../game.d.ts"/>

class AirTurret extends Turret {

    static image: CanvasImageSource;

    angle: number;

    constructor(tile: Tile, type: TurretType) {
        super(tile, type);
        this.angle = 0;
    }

    step(time: number): void {
        super.step(time);
        this.angle = (this.angle + Angle.deg360 - time * Angle.deg120) % Angle.deg360;
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean): void {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.drawImage(AirTurret.image, -24, -8);
        switch (this.type.air()) {
            case 1:
                ctx.rotate(Angle.deg90);
                ctx.drawImage(AirTurret.image, -24, -8);
                break;
            case 2:
                for (let i = 0; i < 2; ++i) {
                    ctx.rotate(Angle.deg60);
                    ctx.drawImage(AirTurret.image, -24, -8);
                }
                break;
            case 3:
                for (let i = 0; i < 3; ++i) {
                    ctx.rotate(Angle.deg45);
                    ctx.drawImage(AirTurret.image, -24, -8);
                }
                break;
            case 4:
                for (let i = 0; i < 4; ++i) {
                    ctx.rotate(Angle.deg36);
                    ctx.drawImage(AirTurret.image, -24, -8);
                }
                break;
        }
        ctx.resetTransform();
    }

    addType(type: TurretElement): void {
        if (this.type.count() >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                this.type.add(type);
                break;
            case TurretElement.Earth:
                this.tile.turret = new ArcherTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Fire:
                this.tile.turret = new LightningTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Water:
                this.tile.turret = new IceTurret(this.tile, this.type.add(type));
                break;
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache("td_tower_Aefw_air").then(tex => { AirTurret.image = tex; }, () => new Promise<void>(resolve => {
            let c = new PreRenderedImage(48, 16);
            let renderable = new RenderablePathSet();
            let path = new Path2D();
            path.ellipse(36, 8, 12, 8, 0, 0, Angle.deg180);
            let grad = c.ctx.createLinearGradient(24, 8, 24, 16);
            renderable.pushNew(path, grad);
            path = new Path2D();
            path.ellipse(12, 8, 12, 8, 0, Angle.deg180, 0);
            grad = c.ctx.createLinearGradient(24, 8, 24, 0);
            renderable.pushNew(path, grad);
            path = new Path2D();
            path.arc(24, 8, 8, 0, Angle.deg360);
            grad = c.ctx.createRadialGradient(24, 8, 8, 24, 8, 4);
            renderable.pushNew(path, grad);
            for (const rp of renderable.paths) {
                rp.path.closePath();
                const gr = rp.fill as CanvasGradient;
                gr.addColorStop(0, "#B2A5FF");
                gr.addColorStop(1, "#A0A0A0");
            }
            renderable.render(c.ctx);
            c.cacheImage("td_tower_Aefw_air");
            AirTurret.image = c.image;
            resolve();
        }));
    }

}
