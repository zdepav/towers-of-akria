/// <reference path="Particle.ts"/>

class SparkParticle extends Particle {

    private x: number
    private y: number
    private vx: number
    private vy: number
    private life: number
    private color: string

    get expired(): boolean { return this.life >= 1 }

    constructor(x: number, y: number, color: string) {
        super()
        this.x = x
        this.y = y
        let v = Vec2.randUnit3d()
        this.vx = v.x
        this.vy = v.y
        this.life = 0
        if (!/#[0-9a-f]{6}/i.test(color)) {
            throw new Error("Color format not supported")
        }
        this.color = color + "40"
    }

    step(time: number): void {
        this.life += time * 2
        this.x += this.vx
        this.y += this.vy
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.life >= 1) {
            return
        }
        let r = 8 - this.life * 8
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, r, 0, Angle.deg360)
        ctx.fill()
    }
}
