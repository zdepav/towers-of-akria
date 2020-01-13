/// <reference path="TransformingSource.ts"/>

class ScalingSource extends TransformingSource {

    private inverseScale: Vec2
    private origin: Vec2

    constructor(width: number, height: number, source: ColorSource, scale: number | Vec2, originX: number, originY: number) {
        super(width, height, source)
        if (scale instanceof Vec2) {
            this.inverseScale = new Vec2(1 / scale.x, 1 / scale.y)
        } else {
            this.inverseScale = new Vec2(1 / scale, 1 / scale)
        }
        this.origin = new Vec2(originX, originY)
    }

    protected reverseTransform(x: number, y: number): Vec2 {
        let v = new Vec2(x, y), dv = v.sub(this.origin)
        if (dv.isZero()) { return v }
        return this.origin.addu(dv.x * this.inverseScale.x, dv.y * this.inverseScale.y)
    }
}
