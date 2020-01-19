/// <reference path="Particle.ts"/>

class FlameParticle extends Particle {

    private start: Vec2
    private target: Vec2
    private life: number
    private speed: number
    private rgb: string

    get expired(): boolean { return this.life >= 1 }

    constructor(startPos: Vec2, direction: number, range: number) {
        super()
        this.start = startPos
        this.target = Vec2.ld(range, direction).add(startPos)
        this.life = 0
        this.speed = Rand.r(1.6, 2.4)
        this.rgb = `#ff${Utils.byteToHex(Rand.i(64, 224))}00`
    }

    step(time: number): void {
        if (this.life < 1) {
            this.life += this.speed * time
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.life >= 1) {
            return
        }
        let r = Utils.lerp(1, 4, this.life)
        ctx.fillStyle = this.rgb + Utils.byteToHex(255 * (1 - this.life))
        ctx.beginPath()
        ctx.arc(
            Utils.lerp(this.start.x, this.target.x, this.life),
            Utils.lerp(this.start.y, this.target.y, this.life),
            r, 0, Angle.deg360
        )
        ctx.fill()
    }
}
