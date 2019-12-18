/// <reference path='Coords.ts'/>

class Turret extends GameItem {

    tile: Tile
    center: Coords
    hp: number
    cooldown: number
    upgraded: boolean

    constructor(tile: Tile) {
        super(tile.game)
        this.tile = tile
        this.center = new Coords(tile.pos.x + 32, tile.pos.y + 32)
        this.hp = 100
    }

    step(time: number) {
        if (this.cooldown > 0) {
            this.cooldown -= time
        }
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean) { }

}
