/// <reference path="ColorSource.ts"/>

class RgbaColorSource extends ColorSource {

    color: RgbaColor

    constructor(color: RgbaColor, width: number = 1, height: number = 1) {
        super(width, height)
        this.color = color
    }

    protected _getColor(x: number, y: number): RgbaColor { return this.color }

    generateInto(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.fillStyle = this.color.toCss()
        ctx.fillRect(x, y, this.width, this.height)
    }
}
