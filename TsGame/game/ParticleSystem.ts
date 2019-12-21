/// <reference path='Angles.ts'/>

class Particle {

    step(time: number) { }

    render(ctx: CanvasRenderingContext2D) { }

    isDead(): boolean {
        return true
    }
}

class SmokeParticle extends Particle {

    x: number
    y: number
    life: number
    rgb: string
    startSize: number

    constructor(x: number, y: number, startSize: number) {
        super()
        this.x = x
        this.y = y
        this.life = 0
        let lightness = Math.floor(Math.random() * 64 + 112)
        this.rgb = lightness + ',' + lightness + ',' + lightness
        this.startSize = startSize
    }

    step(time: number) {
        this.life += time
    }

    render(ctx: CanvasRenderingContext2D) {
        if (this.life >= 1) {
            return
        }
        let r = this.life * 8 + this.startSize
        ctx.fillStyle = `rgba(${this.rgb},${1 - this.life})`
        ctx.beginPath()
        ctx.ellipse(this.x, this.y, r, r, 0, 0, Angles.deg360)
        ctx.fill()
    }

    isDead(): boolean {
        return this.life >= 1
    }

}

class ParticleSystem extends GameItem {

    parts: Particle[]
    count: number

    constructor(game: Game) {
        super(game)
        this.parts = []
        this.count = 0
    }

    add(p: Particle) {
        this.parts[this.count] = p
        ++this.count
    }

    step(time: number) {
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

    render(ctx: CanvasRenderingContext2D, preRender: boolean) {
        if (preRender) {
            return
        }
        for (const p of this.parts) {
            p.render(ctx)
        }
    }

}