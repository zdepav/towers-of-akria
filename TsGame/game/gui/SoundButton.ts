/// <reference path="../utils/Rect.ts"/>
/// <reference path="IGuiItem.ts"/>

class SoundButton extends Button implements IGuiItem {

    chosen: boolean

    constructor(game: Game, x: number, y: number, w: number, h: number) {
        super(game, x, y, w, h)
        this.chosen = false
        this.onclick = () => {

        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.visible) {
            return
        }
        /*ctx.fillStyle = this.chosen
            ? (this._pressed ? '#202020' : '#404040')
            : (this._pressed ? '#606060' : '#808080')
        ctx.beginPath()
        let x = this.x, y = this.y, w = this.w, h = this.h
        ctx.closePath()
        ctx.fill()*/
    }
}
