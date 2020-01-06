/// <reference path="TextureGenerator.ts"/>

abstract class PerlinTextureGenerator extends TextureGenerator {

    protected color2: ColorSource
    protected scale: number
    protected curve: (x: number) => number

    constructor(
        width: number, height: number,
        color1: ColorSourceSource,
        color2: ColorSourceSource,
        scale: number = 1,
        curve?: (x: number) => number
    ) {
        super(width, height, color1)
        this.color2 = ColorSource.get(color2 ?? RgbaColor.white)
        this.scale = 1 / (scale * 32)
        this.curve = curve ?? Curve.linear
    }

    protected dotGridGradient(gradient: PerlinGradient, ix: number, iy: number, x: number, y: number): number {
        return gradient.get(ix, iy).dotu(x - ix, y - iy)
    }

    protected perlin(gradient: PerlinGradient, x: number, y: number): number {
        let x0 = Math.floor(x)
        let x1 = x0 + 1
        let y0 = Math.floor(y)
        let y1 = y0 + 1
        let sx = x - x0
        let sy = y - y0
        return Utils.interpolateSmooth(
            Utils.interpolateSmooth(
                this.dotGridGradient(gradient, x0, y0, x, y),
                this.dotGridGradient(gradient, x1, y0, x, y),
                sx
            ),
            Utils.interpolateSmooth(
                this.dotGridGradient(gradient, x0, y1, x, y),
                this.dotGridGradient(gradient, x1, y1, x, y),
                sx
            ),
            sy
        ) * 1.428
    }

}
