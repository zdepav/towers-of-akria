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
//# sourceMappingURL=Turret.js.map