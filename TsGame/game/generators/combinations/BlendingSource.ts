/// <reference path="CombiningSource.ts"/>

class BlendingSource extends CombiningSource {

    constructor(
        width: number, height: number,
        color1: ColorSourceSource, color2: ColorSourceSource
    ) {
        super(width, height, color1, color2)
    }

    protected combine(a: RgbaColor, b: RgbaColor): RgbaColor { return a.blend(b) }

}
