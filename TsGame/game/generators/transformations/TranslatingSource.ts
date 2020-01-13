/// <reference path="TransformingSource.ts"/>

class TranslatingSource extends TransformingSource {

    private xd: number
    private yd: number

    constructor(width: number, height: number, source: ColorSource, xd: number, yd: number) {
        super(width, height, source)
        this.xd = xd
        this.yd = yd
    }

    protected reverseTransform(x: number, y: number): Vec2 {
        return new Vec2(x - this.xd, y - this.yd)
    }
}
