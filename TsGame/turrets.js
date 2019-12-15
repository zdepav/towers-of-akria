/// <reference path='utils.ts'/>
class Turret extends GameItem {
    constructor(tile) {
        super(tile.game);
        this.tile = tile;
        this.center = new Coords(tile.pos.x + 32, tile.pos.y + 32);
        this.hp = 100;
    }
    step(time) {
        if (this.cooldown > 0) {
            this.cooldown -= time;
        }
    }
    render(ctx, preRender) { }
}
class EarthTurret extends Turret {
    constructor(tile) {
        super(tile);
        this.generateRenderables();
    }
    generateRenderables() {
        this._renderable1 = new RenderablePathSet();
        this._renderable2 = new RenderablePathSet();
        let path = new Path2D();
        path.arc(this.center.x, this.center.y, 12, 0, Angles.deg360);
        let grad1 = this.game._ctx.createRadialGradient(this.center.x, this.center.y, 0, this.center.x, this.center.y, 12);
        grad1.addColorStop(0, "#B6FF00");
        grad1.addColorStop(1, "#456000");
        this._renderable1.pushNew(path, grad1);
        let grad2 = this.game._ctx.createRadialGradient(this.center.x, this.center.y, 0, this.center.x, this.center.y, 12);
        grad2.addColorStop(0, "#4ED314");
        grad2.addColorStop(1, "#3A593C");
        this._renderable2.pushNew(path, grad2);
        let corners = [
            { x: this.center.x - 10, y: this.center.y - 10 },
            { x: this.center.x + 10, y: this.center.y - 10 },
            { x: this.center.x - 10, y: this.center.y + 10 },
            { x: this.center.x + 10, y: this.center.y + 10 }
        ];
        for (let corner of corners) {
            path = new Path2D();
            path.arc(corner.x, corner.y, 10, 0, Angles.deg360);
            let grad1 = this.game._ctx.createRadialGradient(corner.x, corner.y, 5, corner.x, corner.y, 10);
            grad1.addColorStop(0, "#B6FF00");
            grad1.addColorStop(1, "#608700");
            this._renderable1.pushNew(path, grad1);
            let grad2 = this.game._ctx.createRadialGradient(corner.x, corner.y, 5, corner.x, corner.y, 10);
            grad2.addColorStop(0, "#4ED314");
            grad2.addColorStop(1, "#3DA547");
            this._renderable2.pushNew(path, grad2);
        }
        path = new Path2D();
        path.moveTo(this.center.x - 11, this.center.y - 9);
        path.lineTo(this.center.x - 9, this.center.y - 11);
        path.lineTo(this.center.x + 11, this.center.y + 9);
        path.lineTo(this.center.x + 9, this.center.y + 11);
        path.closePath();
        path.moveTo(this.center.x + 11, this.center.y - 9);
        path.lineTo(this.center.x + 9, this.center.y - 11);
        path.lineTo(this.center.x - 11, this.center.y + 9);
        path.lineTo(this.center.x - 9, this.center.y + 11);
        path.closePath();
        this._renderable1.pushNew(path, "#B6FF00");
        this._renderable2.pushNew(path, "#4ED314");
    }
    step(time) {
        super.step(time);
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender)
            return;
        if (this.upgraded) {
            this._renderable2.render(ctx);
        }
        else {
            this._renderable1.render(ctx);
        }
    }
}
class AirTurret extends Turret {
    constructor(tile) {
        super(tile);
        this.generateRenderable();
        this._angle = 0;
    }
    generateRenderable() {
        this._renderable = new RenderablePathSet();
        let path = new Path2D();
        path.ellipse(12, 0, 12, 8, 0, 0, Angles.deg180);
        let grad = this.game._ctx.createLinearGradient(0, 0, 0, 8);
        this._renderable.pushNew(path, grad);
        path = new Path2D();
        path.ellipse(-12, 0, 12, 8, 0, Angles.deg180, 0);
        grad = this.game._ctx.createLinearGradient(0, 0, 0, -8);
        this._renderable.pushNew(path, grad);
        path = new Path2D();
        path.ellipse(0, 12, 8, 12, 0, Angles.deg90, Angles.deg270);
        grad = this.game._ctx.createLinearGradient(0, 0, -8, 0);
        this._renderable.pushNew(path, grad);
        path = new Path2D();
        path.ellipse(0, -12, 8, 12, 0, Angles.deg270, Angles.deg90);
        grad = this.game._ctx.createLinearGradient(0, 0, 8, 0);
        this._renderable.pushNew(path, grad);
        path = new Path2D();
        path.arc(0, 0, 8, 0, Angles.deg360);
        grad = this.game._ctx.createRadialGradient(0, 0, 8, 0, 0, 4);
        this._renderable.pushNew(path, grad);
        for (let rp of this._renderable._paths) {
            rp.path.closePath();
            let gr = rp.fill;
            gr.addColorStop(0, "#B2A5FF");
            gr.addColorStop(1, "#A0A0A0");
        }
    }
    step(time) {
        super.step(time);
        this._angle = (this._angle + Angles.deg360 - time * Angles.deg60) % Angles.deg360;
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender)
            return;
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this._angle);
        this._renderable.render(ctx);
        ctx.resetTransform();
        if (this.upgraded) {
            ctx.translate(this.center.x, this.center.y);
            ctx.rotate(this._angle + Angles.deg45);
            this._renderable.render(ctx);
            ctx.resetTransform();
        }
    }
}
/*
class AirTurret extends Turret {

    renderable: RenderablePathSet
    angle: number

    constructor(tile: Tile) {
        super(tile)
        this.generateRenderable()
        this.angle = 0
    }

    generateRenderable() {
        this.renderable = new RenderablePathSet()
        let path = new Path2D()
        path.ellipse(12, 0, 12, 8, 0, 0, Angles.deg180)
        let grad = this.game.ctx.createLinearGradient(0, 0, 0, 8)
        this.renderable.pushNew(path, grad)
        path = new Path2D()
        path.ellipse(-12, 0, 12, 8, 0, Angles.deg180, 0)
        grad = this.game.ctx.createLinearGradient(0, 0, 0, -8)
        this.renderable.pushNew(path, grad)
        path = new Path2D()
        path.ellipse(0, 12, 8, 12, 0, Angles.deg90, Angles.deg270)
        grad = this.game.ctx.createLinearGradient(0, 0, -8, 0)
        this.renderable.pushNew(path, grad)
        path = new Path2D()
        path.ellipse(0, -12, 8, 12, 0, Angles.deg270, Angles.deg90)
        grad = this.game.ctx.createLinearGradient(0, 0, 8, 0)
        this.renderable.pushNew(path, grad)
        path = new Path2D()
        path.arc(0, 0, 8, 0, Angles.deg360)
        grad = this.game.ctx.createRadialGradient(0, 0, 8, 0, 0, 4)
        this.renderable.pushNew(path, grad)
        for (let rp of this.renderable.paths) {
            rp.path.closePath()
            let gr = <CanvasGradient>rp.fill
            gr.addColorStop(0, "#B2A5FF")
            gr.addColorStop(1, "#A0A0A0")
        }

    }

    step(time: number) {
        super.step(time)
        this.angle = (this.angle + Angles.deg360 - time * Angles.deg60) % Angles.deg360
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean) {
        super.render(ctx, preRender)
        if (preRender) return;
        ctx.translate(this.center.x, this.center.y)
        ctx.rotate(this.angle)
        this.renderable.render(ctx, preRender)
        ctx.resetTransform()
        if (this.upgraded) {
            ctx.translate(this.center.x, this.center.y)
            ctx.rotate(this.angle + Angles.deg45)
            this.renderable.render(ctx, preRender)
            ctx.resetTransform()
        }
    }

}
*/ 
//# sourceMappingURL=turrets.js.map