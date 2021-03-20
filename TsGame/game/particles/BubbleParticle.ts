/// <reference path="Particle.ts"/>

class BubbleParticle extends Particle {

    private readonly x: number
    private readonly y: number
    private readonly rgb: string
    private readonly startSize: number

    private life: number

    get expired(): boolean { return this.life >= 1 }

    constructor(x: number, y: number, startSize: number, color: string) {
        super()
        this.x = x
        this.y = y
        this.life = 0
        this.rgb = color
        this.startSize = startSize
    }

    step(time: number): void {
        this.life += time
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.life >= 1) {
            return
        }
        ctx.strokeStyle = this.rgb + Utils.byteToHex(255 * (1 - this.life))
        ctx.lineWidth = this.life * 2
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.startSize + this.life * 5, 0, Angle.deg360)
        ctx.stroke()
    }
}
