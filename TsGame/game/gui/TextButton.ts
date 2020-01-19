/// <reference path="../utils/Rect.ts"/>
/// <reference path="IGuiItem.ts"/>

class TextButton extends Button implements IGuiItem {

    private text: string

    constructor(game: Game, x: number, y: number, w: number, h: number, text: string) {
        super(game, x, y, w, h)
        this.text = text
    }

    render(ctx: CanvasRenderingContext2D): void {
        super.render(ctx)
        ctx.fillStyle = this.enabled ? "#000000" : "#808080"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.font = "24px sans-serif"
        ctx.fillText(this.text, this.x + this.w / 2, this.y + this.h / 2)
    }
}
