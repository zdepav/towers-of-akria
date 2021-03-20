﻿/// <reference path="Particle.ts"/>

class CannonSmokeParticle extends Particle {

    private readonly vx: number
    private readonly vy: number
    private readonly rgb: string
    private readonly size: number

    private x: number
    private y: number
    private life: number

    get expired(): boolean { return this.life >= 1 }

    constructor(startPosition: Vec2, direction: number) {
        super()
        startPosition = startPosition.addld(Rand.r(-3, 3), direction + Angle.deg90)
        this.x = startPosition.x
        this.y = startPosition.y
        let v = Vec2.ld(Rand.r(0, 12), direction)
        this.vx = v.x
        this.vy = v.y
        this.life = 0
        let lightness = Rand.i(32, 112)
        let h = Utils.byteToHex(lightness)
        this.rgb = '#' + h + h + h
        this.size = Rand.r(1, 3)
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
