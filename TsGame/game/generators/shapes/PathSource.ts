/// <reference path="ShapeSource.ts"/>

class PathSource extends ShapeSource {

    private readonly ctx: CanvasRenderingContext2D
    private readonly path: Path2D
    private readonly fillRule: CanvasFillRule

    constructor(
        width: number, height: number,
        path: Path2D,
        color: ColorSourceSource,
        background: ColorSourceSource,
        fillRule: CanvasFillRule = 'nonzero'
    ) {
        super(width, height, color, background)
        this.path = path
        this.fillRule = fillRule
        this.ctx = new PreRenderedImage(1, 1).ctx
    }

    protected _getColor(x: number, y: number): RgbaColor {
        return this.ctx.isPointInPath(this.path, x, y, this.fillRule)
            ? this.color.getColor(x, y)
            : this.background.getColor(x, y)
    }
}
