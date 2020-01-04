﻿/// <reference path="../game.d.ts"/>

class IceTurret extends Turret {

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
        let r = 24 + 2 * this.type.water() + 2 * this.type.air();
        let i = Utils.sign(this.type.water() - this.type.air()) + 1;
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.drawImage(IceTurret.images, 0, i * 64, 64, 64, -r, -r, r * 2, r * 2);
        ctx.resetTransform();
    }

    addType(type: TurretElement): void {
        if (this.type.count() >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Earth:
                this.tile.turret = new MoonTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Fire:
                this.tile.turret = new PlasmaTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Air:
            case TurretElement.Water:
                this.type.add(type);
                break;
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache("td_tower_AefW_ice").then(tex => { IceTurret.images = tex; }, () => new Promise<void>(resolve => {
            let tex = new CellularTextureGenerator(64, 64, 64, "#D1EFFF", "#70BECC", CellularTextureType.Cells);
            let c = new PreRenderedImage(64, 192);
            let c2 = new PreRenderedImage(64, 64);
            let fill = c2.ctx.createPattern(tex.generateImage(), "repeat") as CanvasPattern;
            IceTurret.preRender(c2.ctx, 0, fill, true);
            c.ctx.drawImage(c2.image, 0, 0);
            c.ctx.drawImage(c2.image, 0, 64);
            c.ctx.drawImage(c2.image, 0, 128);
            IceTurret.preRender(c.ctx, 0, "#FFFFFF80");
            IceTurret.preRender(c.ctx, 128, "#51AFCC60");
            c.cacheImage("td_tower_AefW_ice");
            IceTurret.images = c.image;
            resolve();
        }));
    }

    private static mkBranch(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, size: number): void {
        if (size >= 2.5) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            let x2 = Utils.ldx(8, angle, x);
            let y2 = Utils.ldy(8, angle, y);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = 3;
            ctx.stroke();
            IceTurret.mkBranch(ctx, (x + x2) / 2, (y + y2) / 2, angle - Angle.deg60, 2);
            IceTurret.mkBranch(ctx, (x + x2) / 2, (y + y2) / 2, angle + Angle.deg60, 2);
            IceTurret.mkBranch(ctx, x2, y2, angle, 2);
        }
        else if (size >= 1.5) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            let x2 = Utils.ldx(6, angle, x);
            let y2 = Utils.ldy(6, angle, y);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = 2;
            ctx.stroke();
            IceTurret.mkBranch(ctx, (x + x2) / 2, (y + y2) / 2, angle - Angle.deg45, 1);
            IceTurret.mkBranch(ctx, (x + x2) / 2, (y + y2) / 2, angle + Angle.deg45, 1);
            IceTurret.mkBranch(ctx, x2, y2, angle, 1);
        }
        else if (size >= 0.5) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            let x2 = Utils.ldx(4, angle, x);
            let y2 = Utils.ldy(4, angle, y);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    private static preRender(ctx: CanvasRenderingContext2D, baseY: number, fill: string | CanvasPattern, drawCenter: boolean = false): void {
        ctx.save();
        ctx.lineCap = "round";
        ctx.strokeStyle = fill;
        let centerPath = new Path2D();
        for (let k = 0; k < 6; ++k) {
            let a = k * Angle.deg60;
            if (k === 0) {
                centerPath.moveTo(Utils.ldx(8, a, 32), baseY + Utils.ldy(8, a, 32));
            }
            else {
                centerPath.lineTo(Utils.ldx(8, a, 32), baseY + Utils.ldy(8, a, 32));
            }
            IceTurret.mkBranch(ctx, Utils.ldx(8, a, 32), baseY + Utils.ldy(8, a, 32), a, 3);
        }
        centerPath.closePath();
        ctx.restore();
        ctx.fillStyle = fill;
        ctx.fill(centerPath);
        if (drawCenter) {
            let grad = ctx.createRadialGradient(32, baseY + 32, 0, 32, baseY + 32, 6);
            grad.addColorStop(0, "#FFFFFF");
            grad.addColorStop(1, "#D1EFFF00");
            ctx.fillStyle = grad;
            ctx.fill(centerPath);
        }
    }

}
