/// <reference path="TransformingSource.ts"/>

class FisheyeSource extends TransformingSource {

    private scale: number
    private radius: number
    private origin: Vec2

    constructor(
        width: number, height: number,
        source: ColorSource,
        scale: number,
        originX: number, originY: number,
        radius: number
    ) {
        super(width, height, source)
        this.scale = Utils.clamp(scale, -1, 1)
        this.radius = radius
        this.origin = new Vec2(originX, originY)
    }

    protected reverseTransform(x: number, y: number): Vec2 {
        let v = new Vec2(x, y), dv = v.sub(this.origin)
        if (dv.isZero()) { return v }
        let d = dv.length / this.radius
        if (d >= 1) { return v }
        if (this.scale < 0) {
            let coef = Utils.lerp(d, Curve.arc(d), -this.scale)
            return this.origin.add(dv.mul(coef / d))
        } else {
            let coef = Utils.lerp(d, Curve.invArc(d), this.scale)
            return this.origin.add(dv.mul(coef / d))
        }
    }
}
