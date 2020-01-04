/// <reference path="../game.d.ts"/>

class LightningTurret extends Turret {

    private static image: CanvasImageSource;

    private animationTimer: number;

    constructor(tile: Tile, type: TurretType) {
        super(tile, type);
        this.animationTimer = Math.random();
    }

    step(time: number): void {
        super.step(time);
        this.animationTimer = (this.animationTimer + time * (this.type.air() + this.type.fire() - 1) * 0.5) % 1;
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean): void {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(-Math.floor(this.animationTimer * 8) * Angle.deg45);
        ctx.drawImage(LightningTurret.image, -24, -24);
        ctx.resetTransform();
    }

    addType(type: TurretElement): void {
        if (this.type.count() >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
            case TurretElement.Fire:
                this.type.add(type);
                break;
            case TurretElement.Earth:
                this.tile.turret = new SunTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Water:
                this.tile.turret = new PlasmaTurret(this.tile, this.type.add(type));
                break;
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache("td_tower_AeFw_lightning").then(tex => { LightningTurret.image = tex; }, () => new Promise<void>(resolve => {
            let c = new PreRenderedImage(48, 48);
            let ctx = c.ctx;
            let grad = ctx.createRadialGradient(24, 24, 0, 24, 24, 18);
            grad.addColorStop(0, "#FFFFFF");
            grad.addColorStop(0.33, "#A97FFF");
            grad.addColorStop(1, "#D6BFFF");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(42, 24);
            for (let i = 1; i < 16; ++i) {
                let r = i % 2 == 0 ? 21 : 7;
                let a = i * Angle.deg45 / 2;
                ctx.lineTo(Utils.ldx(r, a, 24), Utils.ldy(r, a, 24));
            }
            ctx.closePath();
            ctx.fill();
            grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 3);
            grad.addColorStop(0, "#F8F2FF");
            grad.addColorStop(1, "#C199FF");
            ctx.fillStyle = grad;
            let j = true;
            for (let i = 0; i < 8; ++i, j = !j) {
                let a = i * Angle.deg45;
                ctx.translate(Utils.ldx(18, a, 24), Utils.ldy(18, a, 24));
                if (j) {
                    ctx.rotate(Angle.deg45);
                }
                ctx.fillRect(-3, -3, 6, 6);
                ctx.resetTransform();
            }
            grad = ctx.createRadialGradient(42, 24, 0, 42, 24, 8);
            grad.addColorStop(0, "#FFFFFFC0");
            grad.addColorStop(1, "#F8F2FF00");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(42, 24, 8, 0, Angle.deg360);
            ctx.closePath();
            ctx.fill();
            c.cacheImage("td_tower_AeFw_lightning");
            LightningTurret.image = c.image;
            resolve();
        }));
    }

}
