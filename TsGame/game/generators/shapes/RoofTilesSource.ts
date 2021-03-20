/// <reference path="ShapeSource.ts"/>

class RoofTilesSource extends ShapeSource {

    private readonly empty: ColorSource | null
    private readonly horizontalCount: number
    private readonly verticalCount: number

    constructor(
        width: number, height: number,
        horizontalCount: number,
        verticalCount: number,
        color: ColorSourceSource,
        background: ColorSourceSource,
        empty?: ColorSourceSource
    ) {
        super(width, height, color, background)
        this.empty = empty ? ColorSource.get(empty) : null
        this.horizontalCount = horizontalCount
        this.verticalCount = verticalCount
    }

    protected _getColor(x: number, y: number): RgbaColor {
        let _x = x / this.width
        let _y = y / this.height
        let a = _x * this.horizontalCount * 2 % 2 - 1
        _y += (1 - Math.sqrt(1 - a * a)) / (this.verticalCount * 2)
        if (_x * this.horizontalCount % 2 > 1) {
            _y += 0.5 / this.verticalCount
        }
        if (this.empty && _y >= 1) {
            return this.empty.getColor(x, y)
        } else {
            return this.background.getColor(x, y).lerp(
                this.color.getColor(x, y),
                _y * this.verticalCount % 1
            )
        }
    }
}
