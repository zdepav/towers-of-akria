/// <reference path="../ColorSource.ts"/>

abstract class CombiningSource extends ColorSource {

    protected color1: ColorSource
    protected color2: ColorSource

    protected constructor(
        width: number, height: number,
        color1: ColorSourceSource,
        color2: ColorSourceSource
    ) {
        super(width, height)
        this.color1 = ColorSource.get(color1 ?? RgbaColor.black)
        this.color2 = ColorSource.get(color2 ?? RgbaColor.white)
    }

    protected _getColor(x: number, y: number): RgbaColor {
        return this.combine(this.color1.getColor(x, y), this.color2.getColor(x, y))
    }

    protected abstract combine(a: RgbaColor, b: RgbaColor): RgbaColor

}
