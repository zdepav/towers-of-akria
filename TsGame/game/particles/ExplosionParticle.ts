/// <reference path="Particle.ts"/>

class ExplosionParticle extends Particle {

    private x: number
    private y: number
    private life: number
    private rgb: string

    get expired(): boolean { return this.life <= 0 }

    constructor(x: number, y: number) {
        super()
        this.x = x
        this.y = y
        this.life = 1
        this.rgb = `#ff${Utils.byteToHex(Rand.i(64, 224))}00`
    }

    step(time: number): void {
        if (this.life > 0) {
            this.life -= time * 1.5
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.life <= 0) {
            return
        }
        let r = (1 - this.life) * 10 + 4
        ctx.fillStyle = this.rgb + Utils.byteToHex(255 * this.life)
        ctx.beginPath()
        ctx.arc(this.x, this.y, r, 0, Angle.deg360)
        ctx.fill()
    }
}
