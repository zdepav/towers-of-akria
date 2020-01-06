/// <reference path="ShapeSource.ts"/>

class EllipseSource extends ShapeSource {

    private x: number
    private y: number
    private r1: number
    private r2: number

    constructor(
        width: number, height: number,
        x: number, y: number,
        r1: number, r2: number,
        color: ColorSourceSource,
        background: ColorSourceSource
    ) {
        super(width, height, color, background)
        this.x = x
        this.y = y
        this.r1 = r1
        this.r2 = r2
    }

    protected _getColor(x: number, y: number): RgbaColor {
        let _x = (x - this.x) / this.r1, _y = (y - this.y) / this.r2
        return _x * _x + _y * _y <= 1 ? this.color.getColor(x, y) : this.background.getColor(x, y)
    }

}
