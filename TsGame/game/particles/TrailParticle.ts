/// <reference path="Particle.ts"/>

class TrailParticle extends Particle {

    private readonly x: number
    private readonly y: number
    private readonly vx: number
    private readonly vy: number
    private readonly color: string
    private readonly size: number

    private life: number

    get expired(): boolean { return this.life >= 1 }

    constructor(x: number, y: number, color: string, scale: number = 1) {
        super()
        this.x = x
        this.y = y
        let v = Vec2.randUnit3d()
        this.vx = v.x * 4
        this.vy = v.y * 4
        this.life = 0
        this.color = color
        this.size = scale * 3
    }

    step(time: number): void {
        this.life += time * 4
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.life >= 1) {
            return
        }
        ctx.fillStyle = this.color + Utils.byteToHex(255 * (1 - this.life))
        ctx.beginPath()
        ctx.arc(
            this.x + this.life * this.vx,
            this.y + this.life * this.vy,
            (1 - this.life) * this.size,
            0,
            Angle.deg360
        )
        ctx.fill()
    }
}
