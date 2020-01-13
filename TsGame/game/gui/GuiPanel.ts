/// <reference path="../utils/Rect.ts"/>
/// <reference path="IGuiItem.ts"/>

class GuiPanel extends Rect implements IGuiItem {
    
    items: IGuiItem[]
    game: Game

    constructor(game: Game, x: number, y: number, w: number, h: number) {
        super(x, y, w, h)
        this.items = []
        this.game = game
    }

    addItem(item: IGuiItem): void {
        this.items.push(item)
    }
    
    onMouseDown(button: MouseButton): void {
        for (const item of this.items) {
            item.onMouseDown(button)
        }
    }

    onMouseMove(): void {
        for (const item of this.items) {
            item.onMouseMove()
        }
    }

    onMouseUp(button: MouseButton): void {
        for (const item of this.items) {
            item.onMouseUp(button)
        }
    }

    step(time: number): void {
        for (const item of this.items) {
            item.step(time)
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        for (const item of this.items) {
            item.render(ctx)
        }
    }
}
