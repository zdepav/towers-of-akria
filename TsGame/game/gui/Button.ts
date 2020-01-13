/// <reference path="../utils/Rect.ts"/>
/// <reference path="IGuiItem.ts"/>

class Button extends Rect implements IGuiItem {

    private _pressed: boolean

    enabled: boolean
    onclick: ((button: Button) => void) | null
    game: Game

    get pressed(): boolean { return this._pressed && this.enabled }
    
    constructor(game: Game, x: number, y: number, w: number, h: number) {
        super(x, y, w, h)
        this.onclick = null
        this.game = game
        this.enabled = true
        this._pressed = false
    }

    protected onClick() {
        if (this.onclick) {
            this.onclick(this)
        }
    }

    step(time: number): void { }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.enabled ? "#606060" : "#808080"
        ctx.fillRect(this.x, this.y, this.w, this.h)
        ctx.fillStyle = this.pressed ? "#A0A0A0" : "#C0C0C0"
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
