/// <reference path="Enemy.ts"/>

class BasicEnemy extends Enemy {

    get baseSpeed(): number { return 48 }

    constructor(game: Game, wave: number, spawn: Tile, hp: number, armor: number) {
        super(game, wave, spawn, hp, armor)
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.expired) {
            return
        }
        let r: number
        if (this.armor > 0) {
            ctx.fillStyle = this.effects.colorize(this.baseArmorColor).toCss()
            r = 7 + Utils.clamp(this.armor / 35, 0, 5)
            ctx.fillRect(this.x - r, this.y - r, r * 2, r * 2)
        }
        ctx.fillStyle = "#000000"
        ctx.fillRect(this.x - 7, this.y - 7, 14, 14)
        if (this._hp < this.startHp) {
            ctx.fillStyle = this.effects.colorize(this.baseColor).toCss()
            ctx.fillRect(this.x - 6, this.y - 6, 12, 12)
        }
        ctx.fillStyle = this.effects.colorize(this.baseHpColor).toCss()
        r = 6 * this._hp / this.startHp
        ctx.fillRect(this.x - r, this.y - r, r * 2, r * 2)
    }
}
