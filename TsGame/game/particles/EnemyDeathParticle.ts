/// <reference path="Particle.ts"/>

class EnemyDeathParticle extends Particle {

    private readonly vx: number
    private readonly vy: number
    private readonly va: number
    private readonly startLife: number
    private readonly color: string

    private x: number
    private y: number
    private angle: number
    private life: number

    get expired(): boolean { return this.life < 0 }

    constructor(x: number, y: number, color: string) {
        super()
        this.x = x
        this.y = y
        this.angle = Angle.rand()
        let v = Vec2.randUnit3d()
        this.vx = 24 * v.x
        this.vy = 24 * v.y
        this.va = Angle.rand() - Angle.deg180
        this.life = Rand.r(0.4, 1)
        this.startLife = this.life
        this.color = color
    }

    step(time: number): void {
        this.life -= time
        this.x += time * this.vx
        this.y += time * this.vy
        this.angle += time * this.va
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.life < 0) {
            return
        }
        let a = Utils.byteToHex(this.life / this.startLife * 255)
        ctx.fillStyle = this.color + a
        ctx.strokeStyle = "#000000" + a
        ctx.lineWidth = 0.5
        ctx.translate(this.x, this.y)
        ctx.rotate(this.angle)
        ctx.beginPath()
        ctx.moveTo(5, 1)
        ctx.lineTo(-4, 3)
        ctx.lineTo(1, -5)
        ctx.closePath()
        ctx.stroke()
        ctx.fill()
        ctx.resetTransform()
    }
}
