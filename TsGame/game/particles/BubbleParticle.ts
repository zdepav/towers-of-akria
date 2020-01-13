/// <reference path="Particle.ts"/>

class BubbleParticle extends Particle {

    private x: number
    private y: number
    private life: number
    private rgb: string
    private startSize: number

    get expired(): boolean { return this.life >= 1 }

    constructor(x: number, y: number, startSize: number, color: string) {
        super()
        this.x = x
        this.y = y
        this.life = 0
        if (!/#[0-9a-f]{6}/i.test(color)) {
            throw new Error("Color format not supported")
        }
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
        ctx.arc(this.x, this.y, this.startSize + this.life * 7, 0, Angle.deg360)
        ctx.stroke()
    }
}
