/// <reference path="GradientSource.ts"/>

class LinearGradientSource extends GradientSource {

    private readonly a: number
    private readonly b: number
    private readonly c: number
    private readonly d: number

    constructor(width: number, height: number, x1: number, y1: number, x2: number, y2: number) {
        super(width, height)
        this.a = x2 - x1
        this.b = y2 - y1
        this.c = -this.a * x1 - this.b * y1
        this.d = Math.sqrt(this.a * this.a + this.b * this.b)
        this.d *= this.d
    }

    protected _getColor(x: number, y: number): RgbaColor {
        return this.getColorAtPosition(x, y, (this.a * x + this.b * y + this.c) / this.d)
    }
}
