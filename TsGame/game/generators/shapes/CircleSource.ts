/// <reference path="ShapeSource.ts"/>

class CircleSource extends ShapeSource {

    private x: number
    private y: number
    private r1: number
    private r2: number

    constructor(
        width: number, height: number,
        x: number, y: number, r: number,
        color: ColorSourceSource,
        background: ColorSourceSource
    ) {
        super(width, height, color, background)
        this.x = x
        this.y = y
        this.r1 = r
        this.r2 = r + 1
    }

    protected _getColor(x: number, y: number): RgbaColor {
        let _x = x - this.x, _y = y - this.y, d = Math.sqrt(_x * _x + _y * _y)
        if (d <= this.r1) {
            return this.color.getColor(x, y)
        } else if (d >= this.r2) {
            return this.background.getColor(x, y)
        } else {
            return this.color.getColor(x, y).lerp(this.background.getColor(x, y), d - this.r1)
        }
    }

}
