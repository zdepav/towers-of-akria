/// <reference path="TransformingSource.ts"/>

class RotatingSource extends TransformingSource {

    private angle: number
    private origin: Vec2

    constructor(width: number, height: number, source: ColorSource, angle: number, originX: number, originY: number) {
        super(width, height, source)
        this.angle = angle
        this.origin = new Vec2(originX, originY)
    }

    protected reverseTransform(x: number, y: number): Vec2 {
        return new Vec2(x, y).rotateAround(this.origin, -this.angle)
    }

}
