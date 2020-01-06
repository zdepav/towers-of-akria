/// <reference path="ColorSource.ts"/>

class BufferedColorSource extends ColorSource {

    private data: RgbaColor[]

    constructor(width: number, height: number, source: ColorSource, scale: number = 1) {
        super(width, height)
        this.data = []
        let inverseScale = 1 / scale
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                this.data.push(source.getColor(x * inverseScale, y * inverseScale))
            }
        }
    }

    protected _getColor(x: number, y: number): RgbaColor {
        x = Math.floor(x)
        y = Math.floor(y)
        return this.data[Utils.flatten(this.width, x, y)]
    }

    generateInto(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        for (let _y = 0; _y < this.height; ++_y) {
            for (let _x = 0; _x < this.width; ++_x) {
                ctx.fillStyle = this.data[Utils.flatten(this.width, _x, _y)].toCss()
                ctx.fillRect(x + _x, y + _y, 1, 1)
            }
        }
    }

}
