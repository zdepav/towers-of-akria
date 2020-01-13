/// <reference path="Particle.ts"/>

class TileMarkParticle extends Particle {

    private startPosition: Vec2
    private life: number
    private speed: number
    private direction: Vec2

    get expired(): boolean { return this.life >= 1 }

    constructor(x: number, y: number, direction: Vec2) {
        super()
        this.startPosition = new Vec2(x - 2, y - 2)
        this.speed = Utils.rand(1, 4)
        this.life = 0
        this.direction = direction.normalize()
    }

    step(time: number): void {
        this.life += time * this.speed / 2
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.life >= 1) {
            return
        }
        let pos = this.direction.mul(this.life * 28).add(this.startPosition)
        ctx.fillStyle = "#ffffff" + Utils.byteToHex((1 - this.life) * 64)
        ctx.fillRect(pos.x, pos.y, 4, 4)
    }
}
