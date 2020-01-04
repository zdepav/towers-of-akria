/// <reference path="game.d.ts"/>

class Particle {

    step(time: number): void{ }

    render(ctx: CanvasRenderingContext2D): void{ }

    isDead(): boolean { return true }
}

class SmokeParticle extends Particle {

    private x: number
    private y: number
    private life: number
    private rgb: string
    private startSize: number

    constructor(x: number, y: number, startSize: number) {
        super()
        this.x = x
        this.y = y
        this.life = 0
        let lightness = Utils.randInt(112, 176)
        let h = Utils.byteToHex(lightness)
        this.rgb = `#${h}${h}${h}`
        this.startSize = startSize
    }

    step(time: number): void{
        this.life += time
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

    isDead(): boolean {
        return this.life >= 1
    }

}

class ElementSparkParticle extends Particle {

    private x: number
    private y: number
    private vx: number
    private vy: number
    private life: number
    private color: string
    
    constructor(x: number, y: number, type: TurretElement) {
        super()
        this.x = x
        this.y = y
        let v = Vec2.randUnit3d()
        this.vx = v.x
        this.vy = v.y
        this.life = 0
        this.color = TurretType.getColor(type) + "40"
    }

    step(time: number): void {
        this.life += time * 2
        this.x += this.vx
        this.y += this.vy
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.life >= 1) {
            return
        }
        let r = 8 - this.life * 8
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, r, 0, Angle.deg360)
        ctx.fill()
    }

    isDead(): boolean {
        return this.life >= 1
    }

}

class ParticleSystem {

    private parts: Particle[]
    private count: number

    game: Game

    constructor(game: Game) {
        this.game = game
        this.parts = []
        this.count = 0
    }

    add(p: Particle): void {
        this.parts[this.count] = p
        ++this.count
    }

    step(time: number): void {
        if (this.count === 0) {
            return
        }
        let j = this.count
        for (let i = 0; i < j; ++i) {
            let p = this.parts[i]
            p.step(time)
            if (p.isDead()) {
                --j
                if (i < j) {
                    this.parts[i] = this.parts[j]
                }
            }
        }
        this.count = j
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean): void{
        if (preRender) {
            return
        }
        for (const p of this.parts) {
            p.render(ctx)
        }
    }

}