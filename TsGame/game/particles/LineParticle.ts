/// <reference path="Particle.ts"/>

class LineParticle extends Particle {

    private readonly x1: number
    private readonly y1: number
    private readonly x2: number
    private readonly y2: number
    private readonly rgb: string
    private readonly width: number

    private life: number

    get expired(): boolean { return this.life <= 0 }

    constructor(
        x1: number, y1: number,
        x2: number, y2: number,
        life: number,
        color: string,
        width: number = 1
    ) {
        super()
        this.x1 = x1
        this.y1 = y1
        this.x2 = x2
        this.y2 = y2
        this.life = life
        this.rgb = color
        this.width = Utils.clamp(width, 0.1, 100)
    }

    step(time: number): void {
        this.life -= time
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.life <= 0) {
            return
        }
        ctx.strokeStyle = this.rgb + Utils.byteToHex(255 * this.life)
        ctx.lineWidth = this.width
        ctx.beginPath()
        ctx.moveTo(this.x1, this.y1)
        ctx.lineTo(this.x2, this.y2)
        ctx.stroke()
    }
}
