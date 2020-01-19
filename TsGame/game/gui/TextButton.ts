/// <reference path="../utils/Rect.ts"/>
/// <reference path="IGuiItem.ts"/>

class TextButton extends Button implements IGuiItem {

    text: string
    font: string
    textColor: string
    disabledTextColor: string

    constructor(game: Game, x: number, y: number, w: number, h: number, text: string) {
        super(game, x, y, w, h)
        this.text = text
        this.font = "12px sans-serif"
        this.textColor = "#000000"
        this.disabledTextColor = "#808080"
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.visible) {
            return
        }
        super.render(ctx)
        ctx.fillStyle = this.enabled ? this.textColor : this.disabledTextColor
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.font = this.font
        ctx.fillText(this.text, this.x + this.w / 2, this.y + this.h / 2)
    }
}
