/// <reference path='Coords.ts'/>
class Turret extends GameItem {
    constructor(tile) {
        super(tile.game);
        this.tile = tile;
        this.center = new Coords(tile.pos.x + 32, tile.pos.y + 32);
        this.hp = 100;
    }
    step(time) {
        if (this.cooldown > 0) {
            this.cooldown -= time;
        }
    }
    render(ctx, preRender) { }
}
//# sourceMappingURL=Turret.js.map