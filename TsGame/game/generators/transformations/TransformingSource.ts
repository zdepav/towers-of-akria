/// <reference path="../ColorSource.ts"/>

abstract class TransformingSource extends ColorSource {

    protected readonly source: ColorSource

    protected constructor(width: number, height: number, source: ColorSource) {
        super(width, height)
        this.source = source
    }

    protected _getColor(x: number, y: number): RgbaColor {
        let v = this.reverseTransform(x, y)
        return this.source.getColor(v.x, v.y)
    }

    protected abstract reverseTransform(x: number, y: number): Vec2

}
