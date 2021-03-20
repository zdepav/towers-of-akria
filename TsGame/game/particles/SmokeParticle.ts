/// <reference path="Particle.ts"/>

class SmokeParticle extends Particle {

    private readonly x: number
    private readonly y: number
    private readonly rgb: string
    private readonly startSize: number

    private life: number

    get expired(): boolean { return this.life >= 1 }

    constructor(x: number, y: number, startSize: number) {
        super()
        this.x = x
        this.y = y
        this.life = 0
        let lightness = Rand.i(112, 176)
        let h = Utils.byteToHex(lightness)
        this.rgb = '#' + h + h + h
        this.startSize = startSize
    }

    step(time: number): void {
        if (this.life < 1) {
            this.life += time
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.life >= 1) {
            return
        }
        let r = this.life * 8 + this.startSize
        ctx.fillStyle = this.rgb + Utils.byteToHex(255 * (1 - this.life))
        ctx.beginPath()
        ctx.arc(this.x, this.y, r, 0, Angle.deg360)
        ctx.fill()
    }
}
