/// <reference path="../utils/Rect.ts"/>
/// <reference path="IGuiItem.ts"/>

class GameSpeedButton extends Button implements IGuiItem {

    speed: number
    chosen: boolean

    constructor(game: Game, speed: number, x: number, y: number, w: number, h: number) {
        super(game, x, y, w, h)
        this.speed = speed
        this.chosen = false
        this.onclick = () => game.setSpeed(this.speed)
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.visible) {
            return
        }
        ctx.fillStyle = this.chosen
            ? (this._pressed ? '#202020' : '#404040')
            : (this._pressed ? '#606060' : '#808080')
        ctx.beginPath()
        let x = this.x, y = this.y, w = this.w, h = this.h
        switch (this.speed) {
            case 0:
                x += this.w / 10
                y += this.h / 10
                w *= 0.8
                h *= 0.8
                ctx.moveTo(x, y)
                ctx.lineTo(x + w * 0.4, y)
                ctx.lineTo(x + w * 0.4, y + h)
                ctx.lineTo(x, y + h)
                ctx.moveTo(x + w * 0.6, y)
                ctx.lineTo(x + w, y)
                ctx.lineTo(x + w, y + h)
                ctx.lineTo(x + w * 0.6, y + h)
                break
            case 1:
                ctx.moveTo(x + this.w * 0.25, y)
                ctx.lineTo(x + this.w * 0.75, y + this.h * 0.5)
                ctx.lineTo(x + this.w * 0.25, y + this.h)
                break
            case 2:
                w /= 32
                h /= 32
                ctx.moveTo(x + 2 * w, y)
                ctx.lineTo(x + 14 * w, y + 12 * h)
                ctx.lineTo(x + 14 * w, y)
                ctx.lineTo(x + 30 * w, y + 16 * h)
                ctx.lineTo(x + 14 * w, y + 32 * h)
                ctx.lineTo(x + 14 * w, y + 20 * h)
                ctx.lineTo(x + 2 * w, y + 32 * h)
                break
            case 3:
                w /= 32
                h /= 32
                ctx.moveTo(x + w, y)
                ctx.lineTo(x + 10 * w, y + 12 * h)
                ctx.lineTo(x + 10 * w, y)
                ctx.lineTo(x + 19 * w, y + 12 * h)
                ctx.lineTo(x + 19 * w, y)
                ctx.lineTo(x + 31 * w, y + 16 * h)
                ctx.lineTo(x + 19 * w, y + 32 * h)
                ctx.lineTo(x + 19 * w, y + 20 * h)
                ctx.lineTo(x + 10 * w, y + 32 * h)
                ctx.lineTo(x + 10 * w, y + 20 * h)
                ctx.lineTo(x + w, y + 32 * h)
                break
        }
        ctx.closePath()
        ctx.fill()
    }
}
