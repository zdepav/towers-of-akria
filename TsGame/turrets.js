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
    }
    step(time) {
        super.step(time);
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender)
            return;
        if (this.upgraded) {
            ctx.drawImage(EarthTurret.image1, this.tile.pos.x, this.tile.pos.y);
        }
        else {
            ctx.drawImage(EarthTurret.image2, this.tile.pos.x, this.tile.pos.y);
        }
    }
    static init() {
        EarthTurret.preRender1();
        EarthTurret.preRender2();
    }
    static preRender1() {
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
    static preRender2() {
        let c = new PreRenderedImage(64, 64);
        let renderable = new RenderablePathSet();
        let path = new Path2D();
        path.arc(32, 32, 12, 0, Angles.deg360);
        let grad = c.ctx.createRadialGradient(32, 32, 0, 32, 32, 12);
        grad.addColorStop(0, "#4ED314");
        grad.addColorStop(1, "#3A593C");
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
            grad.addColorStop(0, "#4ED314");
            grad.addColorStop(1, "#3DA547");
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
        renderable.pushNew(path, "#4ED314");
        renderable.render(c.ctx);
        EarthTurret.image2 = c.image;
    }
}
class AirTurret extends Turret {
    constructor(tile) {
        super(tile);
        this.angle = 0;
    }
    static init() {
        let c = new PreRenderedImage(64, 64);
        let renderable = new RenderablePathSet();
        let path = new Path2D();
        path.ellipse(44, 32, 12, 8, 0, 0, Angles.deg180);
        let grad = c.ctx.createLinearGradient(32, 32, 32, 40);
        renderable.pushNew(path, grad);
        path = new Path2D();
        path.ellipse(20, 32, 12, 8, 0, Angles.deg180, 0);
        grad = c.ctx.createLinearGradient(32, 32, 32, 24);
        renderable.pushNew(path, grad);
        path = new Path2D();
        path.ellipse(32, 44, 8, 12, 0, Angles.deg90, Angles.deg270);
        grad = c.ctx.createLinearGradient(32, 32, 24, 32);
        renderable.pushNew(path, grad);
        path = new Path2D();
        path.ellipse(32, 20, 8, 12, 0, Angles.deg270, Angles.deg90);
        grad = c.ctx.createLinearGradient(32, 32, 40, 32);
        renderable.pushNew(path, grad);
        path = new Path2D();
        path.arc(32, 32, 8, 0, Angles.deg360);
        grad = c.ctx.createRadialGradient(32, 32, 8, 32, 32, 4);
        renderable.pushNew(path, grad);
        for (let rp of renderable.paths) {
            rp.path.closePath();
            let gr = rp.fill;
            gr.addColorStop(0, "#B2A5FF");
            gr.addColorStop(1, "#A0A0A0");
        }
        renderable.render(c.ctx);
        AirTurret.image = c.image;
    }
    step(time) {
        super.step(time);
        this.angle = (this.angle + Angles.deg360 - time * Angles.deg120) % Angles.deg360;
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender)
            return;
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.drawImage(AirTurret.image, -32, -32);
        ctx.resetTransform();
        if (this.upgraded) {
            ctx.translate(this.center.x, this.center.y);
            ctx.rotate(this.angle + Angles.deg45);
            ctx.drawImage(AirTurret.image, -32, -32);
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