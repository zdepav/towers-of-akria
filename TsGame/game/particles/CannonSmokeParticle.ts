/// <reference path="Particle.ts"/>

class CannonSmokeParticle extends Particle {

    private x: number
    private y: number
    private vx: number
    private vy: number
    private life: number
    private rgb: string
    private size: number

    get expired(): boolean { return this.life >= 1 }

    constructor(startPosition: Vec2, direction: number) {
        super()
        startPosition = startPosition.addld(Utils.rand(-3, 3), direction + Angle.deg90)
        this.x = startPosition.x
        this.y = startPosition.y
        let v = Vec2.ld(Utils.rand(0, 12), direction)
        this.vx = v.x
        this.vy = v.y
        this.life = 0
        let lightness = Utils.randInt(32, 112)
        let h = Utils.byteToHex(lightness)
        this.rgb = `#${h}${h}${h}`
        this.size = Utils.rand(1, 3)
    }

    step(time: number): void {
        if (this.life < 1) {
            time *= 2
            this.life += time
            this.x += this.vx * time
            this.y += this.vy * time
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.life >= 1) {
            return
        }
        ctx.fillStyle = this.rgb + Utils.byteToHex(255 * (1 - this.life))
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Angle.deg360)
        ctx.fill()
    }
}
