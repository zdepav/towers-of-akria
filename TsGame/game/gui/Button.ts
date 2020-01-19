/// <reference path="../utils/Rect.ts"/>
/// <reference path="IGuiItem.ts"/>

class Button extends Rect implements IGuiItem {

protected  _pressed: boolean

    enabled: boolean
    visible: boolean
    onclick: ((button: Button) => void) | null
    game: Game

    borderColor: string
    disabledBorderColor: string
    fillColor: string
    pressedFillColor: string
    disabledFillColor: string

    get pressed(): boolean { return this._pressed && this.enabled }
    
    constructor(game: Game, x: number, y: number, w: number, h: number) {
        super(x, y, w, h)
        this.onclick = null
        this.game = game
        this.enabled = true
        this.visible = true
        this._pressed = false
        this.borderColor = "#606060"
        this.disabledBorderColor = "#808080"
        this.fillColor = "#C0C0C0"
        this.pressedFillColor = "#A0A0A0"
        this.disabledFillColor = this.fillColor
    }

    protected onClick() {
        if (this.onclick) {
            this.onclick(this)
        }
    }

    step(time: number): void { }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.visible) {
            return
        }
        ctx.fillStyle = this.enabled ? this.borderColor : this.disabledBorderColor
        ctx.fillRect(this.x, this.y, this.w, this.h)
        ctx.fillStyle = this.enabled
            ? (this.pressed ? this.pressedFillColor : this.fillColor)
            : this.disabledFillColor
        ctx.fillRect(this.x + 2, this.y + 2, this.w - 4, this.h - 4)
    }

    onMouseDown(button: MouseButton): void {
        if (button == MouseButton.Left) {
            this._pressed = this.pointIsInside(this.game.getMousePosition())
        }
    }

    onMouseMove(): void {
        if (this._pressed && !this.pointIsInside(this.game.getMousePosition())) {
            this._pressed = false
        }
    }

    onMouseUp(button: MouseButton): void {
        if (button == MouseButton.Left) {
            if (this.pressed && this.pointIsInside(this.game.getMousePosition())) {
                this.onClick()
            }
            this._pressed = false
        }
    }
}
