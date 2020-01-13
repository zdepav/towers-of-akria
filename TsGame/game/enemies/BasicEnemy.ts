/// <reference path="Enemy.ts"/>

class BasicEnemy extends Enemy {

    private baseColor: RgbaColor
    private baseHpColor: RgbaColor
    private baseArmorColor: RgbaColor

    get baseSpeed(): number { return 32 }

    constructor(game: Game, spawn: Tile, hp: number, armor: number) {
        super(game, spawn, hp, armor)
        this.baseColor = RgbaColor.fromHex("#303030")
        this.baseHpColor = RgbaColor.fromHex("#C08080")
        this.baseArmorColor = RgbaColor.fromHex("#8080C0")
    }

    step(time: number): void {
        super.step(time)
    }

    render(ctx: CanvasRenderingContext2D): void {
        let r: number
        if (this.armor > 0) {
            ctx.fillStyle = this.effects.colorize(this.baseArmorColor).toCss()
            r = 5 + Utils.clamp(this.armor / 100, 0, 4)
            ctx.fillRect(this.x - r, this.y - r, r * 2, r * 2)
        }
        ctx.fillStyle = "#000000"
        ctx.fillRect(this.x - 5, this.y - 5, 10, 10)
        if (this.hp < this.startHp) {
            ctx.fillStyle = this.effects.colorize(this.baseColor).toCss()
            ctx.fillRect(this.x - 4, this.y - 4, 8, 8)
        }
        ctx.fillStyle = this.effects.colorize(this.baseHpColor).toCss()
        r = 4 * this.hp / this.startHp
        ctx.fillRect(this.x - r, this.y - r, r * 2, r * 2)
    }

}
