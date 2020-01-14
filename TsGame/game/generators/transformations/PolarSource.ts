/// <reference path="TransformingSource.ts"/>

class PolarSource extends TransformingSource {

    private origin: Vec2
    private coef: Vec2

    constructor(width: number, height: number, source: ColorSource, sourceWidth?: number, sourceHeight?: number) {
        super(width, height, source)
        this.source = source
        this.origin = new Vec2(this.width / 2, this.height / 2)
        this.coef = new Vec2(
            (sourceWidth ?? this.width) / Angle.deg360,
            (sourceHeight ?? this.height) * 2 / Math.min(this.width, this.height)
        )
    }

    protected reverseTransform(x: number, y: number): Vec2 {
        let v = new Vec2(x, y)
        return new Vec2(
            this.origin.angleTo(v) * this.coef.x,
            v.sub(this.origin).length * this.coef.y
        )
    }
}
