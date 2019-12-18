/// <reference path='Tile.ts'/>
/// <reference path='PreRenderedImage.ts'/>
class FireTurret extends Turret {
    constructor(tile) {
        super(tile);
    }
    step(time) {
        super.step(time);
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        if (this.upgraded) {
            ctx.drawImage(FireTurret.image, this.tile.pos.x, this.tile.pos.y);
        }
        else {
            ctx.drawImage(FireTurret.image, this.tile.pos.x + 8, this.tile.pos.y + 8, 48, 48);
        }
    }
    static init() {
        let c = new PreRenderedImage(64, 64);
        let renderable = new RenderablePathSet();
        let path = new Path2D();
        path.arc(32, 32, 12, 0, Angles.deg360);
        let grad = c.ctx.createRadialGradient(32, 32, 0, 32, 32, 12);
        grad.addColorStop(0, "#B6FF00");
        grad.addColorStop(1, "#456000");
        renderable.pushNew(path, grad);
        let corners = [
            { x: 22, y: 22 },
            { x: 42, y: 22 },
            { x: 22, y: 42 },
            { x: 42, y: 42 }
        ];
        for (let corner of corners) {
            path = new Path2D();
            path.arc(corner.x, corner.y, 10, 0, Angles.deg360);
            grad = c.ctx.createRadialGradient(corner.x, corner.y, 5, corner.x, corner.y, 10);
            grad.addColorStop(0, "#B6FF00");
            grad.addColorStop(1, "#608700");
            renderable.pushNew(path, grad);
        }
        path = new Path2D();
        path.moveTo(21, 23);
        path.lineTo(23, 21);
        path.lineTo(43, 41);
        path.lineTo(41, 43);
        path.closePath();
        path.moveTo(43, 23);
        path.lineTo(41, 21);
        path.lineTo(21, 41);
        path.lineTo(23, 43);
        path.closePath();
        renderable.pushNew(path, "#B6FF00");
        renderable.render(c.ctx);
        EarthTurret.image1 = c.image;
    }
}
//# sourceMappingURL=FireTurret.js.map