/// <reference path="../utils/Rect.ts"/>
/// <reference path="IGuiItem.ts"/>

class PauseButton extends Button implements IGuiItem {

    constructor(game: Game, x: number, y: number, w: number, h: number) {
        super(game, x, y, w, h)
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this._pressed ? "#606060" : "#808080"
        ctx.fillRect(this.x, this.y, this.w * 0.4, this.h)
        ctx.fillRect(this.x + this.w * 0.6, this.y, this.w * 0.4, this.h)
    }
}
