/// <reference path="Particle.ts"/>

class PlasmaBeamParticle extends Particle {

    private readonly a: Vec2

    private b: Vec2
    private c1: Vec2
    private c2: Vec2
    private n: Vec2
    private life: number

    get expired(): boolean { return this.life <= 0 }

    constructor(x1: number, y1: number, x2: number, y2: number) {
        super()
        this.a = new Vec2(x1, y1)
        this.b = new Vec2(x2, y2)
        let v = this.b.sub(this.a)
        this.c1 = this.a.add(v.mul(1 / 3))
        this.c2 = this.a.add(v.mul(2 / 3))
        this.n = v.normalize().normal().mul(Rand.sign(v.length / 3))
        this.life = 0.75
    }

    step(time: number): void {
        this.life -= time
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.life <= 0) {
            return
        }
        ctx.beginPath()
        ctx.moveTo(this.a.x, this.a.y)
        let n = this.n.mul(1 - this.life), c1 = this.c1.add(n), c2 = this.c2.sub(n)
        ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, this.b.x, this.b.y)
        let rgb = '#' + Utils.byteToHex(255 - 128 * this.life) + '00ff'
        ctx.strokeStyle = rgb + Utils.byteToHex(64 * this.life)
        ctx.lineWidth = 5
        ctx.stroke()
        ctx.strokeStyle = rgb + Utils.byteToHex(128 * this.life)
        ctx.lineWidth = 3
        ctx.stroke()
        ctx.strokeStyle = rgb + Utils.byteToHex(255 * this.life)
        ctx.lineWidth = 1
        ctx.stroke()
    }
}
