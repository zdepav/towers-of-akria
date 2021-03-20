/// <reference path="CombiningSource.ts"/>

class LerpingSource extends CombiningSource {

    private readonly coeficient: number

    constructor(
        width: number, height: number,
        color1: ColorSourceSource, color2: ColorSourceSource,
        coeficient: number
    ) {
        super(width, height, color1, color2)
        this.coeficient = coeficient
    }

    protected combine(a: RgbaColor, b: RgbaColor): RgbaColor { return a.lerp(b, this.coeficient) }

}
