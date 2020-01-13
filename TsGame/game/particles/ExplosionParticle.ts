/// <reference path="Particle.ts"/>

class ExplosionParticle extends Particle {

    private x: number
    private y: number
    private life: number
    private rgb: string

    get expired(): boolean { return this.life < 1 }

    constructor(x: number, y: number) {
        super()
        this.x = x
        this.y = y
        this.life = 1
        let green = Utils.randInt(64, 224)
        let g = Utils.byteToHex(green)
        this.rgb = `#ff${g}00`
    }

    step(time: number): void {
        this.life -= time
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.life < 0) {
            return
        }
        let r = (1 - this.life) * 6 + 2
        ctx.fillStyle = this.rgb + Utils.byteToHex(255 * this.life)
        ctx.beginPath()
        ctx.arc(this.x, this.y, r, 0, Angle.deg360)
        ctx.fill()
    }
}
