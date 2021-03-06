/// <reference path="Particle.ts"/>

class WindParticle extends Particle {

    private readonly x: number
    private readonly y: number

    private life: number

    get expired(): boolean { return this.life >= 1 }

    constructor(x: number, y: number) {
        super()
        this.x = x
        this.y = y
        this.life = 0
    }

    step(time: number): void {
        this.life += time * 2.5
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.life >= 1) {
            return
        }
        let alpha = this.life > 0.5 ? 2 - this.life * 2 : this.life * 2
        ctx.strokeStyle = '#ffffff' + Utils.byteToHex(255 * alpha)
        ctx.beginPath()
        let offset = this.life * 12 - 6
        ctx.moveTo(this.x + offset - 2, this.y)
        ctx.lineTo(this.x + offset + 2, this.y)
        ctx.stroke()
    }
}
