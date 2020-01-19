/// <reference path="Projectile.ts"/>

class FlameProjectile extends Projectile {

    private start: Vec2
    private target: Vec2
    private range: number
    private pos: number
    private level: number

    get expired(): boolean { return this.pos >= 1 }

    constructor(game: Game, startPos: Vec2, direction: number, range: number, level: number) {
        super(game)
        this.start = startPos
        this.target = Vec2.ld(range, direction).add(startPos)
        this.pos = 0
        this.range = range
        this.level = level
    }

    step(time: number): void {
        if (this.pos < 1) {
            this.pos += time * 2
        }
        let pos = this.target.sub(this.start).mul(this.pos).add(this.start)
        let r = Utils.lerp(0, this.range, this.pos) * (20 + this.level * 5) / 150
        let damage = (this.level - 1) / 2 + 1.5
        for (const e of this.game.findEnemiesInRange(pos, r)) {
            e.addEffect(new BurningEffect(2))
            e.dealDamage(damage * time)
        }
    }

    render(ctx: CanvasRenderingContext2D): void { }
}
