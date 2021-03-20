/// <reference path="GradientSource.ts"/>

class RadialGradientSource extends GradientSource {

    private readonly x: number
    private readonly y: number
    private readonly r1: number
    private readonly dr: number

    constructor(width: number, height: number, x: number, y: number, r1: number, r2: number) {
        super(width, height)
        this.x = x
        this.y = y
        this.r1 = r1
        this.dr = r2 - r1
    }

    protected _getColor(x: number, y: number): RgbaColor {
        let dx = x - this.x, dy = y - this.y
        return this.getColorAtPosition(
            x, y, (Math.sqrt(dx * dx + dy * dy) - this.r1) / this.dr
        )
    }
}
