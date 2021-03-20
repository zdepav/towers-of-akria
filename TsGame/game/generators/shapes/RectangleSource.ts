/// <reference path="ShapeSource.ts"/>

class RectangleSource extends ShapeSource {

    private readonly x: number
    private readonly y: number
    private readonly w: number
    private readonly h: number

    constructor(
        width: number, height: number,
        x: number, y: number,
        w: number, h: number,
        color: ColorSourceSource,
        background: ColorSourceSource
    ) {
        super(width, height, color, background)
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }

    protected _getColor(x: number, y: number): RgbaColor {
        let _x = x - this.x, _y = y - this.y
        return (_x >= 0 && _x < this.w && _y >= 0 && _y < this.h)
            ? this.color.getColor(x, y)
            : this.background.getColor(x, y)
    }
}
