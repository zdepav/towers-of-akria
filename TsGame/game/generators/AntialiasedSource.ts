/// <reference path="ColorSource.ts"/>

class AntialiasedSource extends ColorSource {

    private readonly source: ColorSource

    constructor(width: number, height: number, source: ColorSource) {
        super(width, height)
        this.source = source
    }

    protected _getColor(x: number, y: number): RgbaColor {
        return this.source.getColor(x, y).lerp(this.source.getColor(x + 0.5, y), 0.5).lerp(
            this.source.getColor(x, y + 0.5).lerp(this.source.getColor(x + 0.5, y + 0.5), 0.5),
            0.5
        )
    }
}
