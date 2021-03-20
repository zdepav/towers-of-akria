type ColorSourceSource = ColorSource | RgbaColor | string | null

abstract class ColorSource {

    protected readonly width: number
    protected readonly height: number

    protected constructor(width: number, height: number) {
        this.width = Math.max(1, Math.floor(width))
        this.height = Math.max(1, Math.floor(height))
    }

    getColor(x: number, y: number): RgbaColor {
        return this._getColor(
            Utils.wrap(x, 0, this.width),
            Utils.wrap(y, 0, this.height)
        )
    }

    protected abstract _getColor(x: number, y: number): RgbaColor

    generateInto(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        for (let _x = 0; _x < this.width; ++_x) {
            for (let _y = 0; _y < this.height; ++_y) {
                ctx.fillStyle = this._getColor(_x, _y).toCss()
                ctx.fillRect(x + _x, y + _y, 1, 1)
            }
        }
    }

    generatePrImage(): PreRenderedImage {
        let tex = new PreRenderedImage(this.width, this.height)
        this.generateInto(tex.ctx, 0, 0)
        return tex
    }

    generateImage(): CanvasImageSource { return this.generatePrImage().image }

    static get(color: ColorSourceSource): ColorSource {
        if (color === null) {
            return RgbaColor.transparent.source()
        } else if (color instanceof ColorSource) {
            return color
        } else if (color instanceof RgbaColor) {
            return color.source()
        } else if (Utils.isString(color)) {
            return RgbaColor.fromHex(color as string).source()
        } else {
            return RgbaColor.transparent.source()
        }
    }
}
