/// <reference path="Enemy.ts"/>

class BasicEnemy extends Enemy {

    get baseSpeed(): number { return 32 }

    constructor(game: Game, spawn: Tile, hp: number, armor: number) {
        super(game, spawn, hp, armor)
    }

    step(time: number): void {
        super.step(time)
    }

    render(ctx: CanvasRenderingContext2D): void {
        let r: number
        if (this.armor > 0) {
            ctx.fillStyle = "#0000FF"
            r = 4 + Utils.clamp(this.armor / 10, 0, 4)
            ctx.fillRect(this.x - r, this.y - r, r * 2, r * 2)
        }
        if (this.hp < this.startHp) {
            ctx.fillStyle = "#000000"
            ctx.fillRect(this.x - 4, this.y - 4, 8, 8)
        }
        ctx.fillStyle = "#FF0000"
        r = 4 * this.hp / this.startHp
        ctx.fillRect(this.x - r, this.y - r, r * 2, r * 2)
    }

}