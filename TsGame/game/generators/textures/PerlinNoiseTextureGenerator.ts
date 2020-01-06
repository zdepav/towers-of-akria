/// <reference path="PerlinTextureGenerator.ts"/>

class PerlinNoiseTextureGenerator extends PerlinTextureGenerator {

    private gradient: PerlinGradient

    constructor(
        width: number, height: number,
        color1: ColorSourceSource,
        color2: ColorSourceSource,
        scale: number = 1,
        curve?: (x: number) => number
    ) {
        super(width, height, color1, color2, scale, curve)
        this.gradient = new PerlinGradient(this.width * this.scale, this.height * this.scale)
    }

    protected _getColor(x: number, y: number): RgbaColor {
        return this.color.getColor(x, y).lerp(
            this.color2.getColor(x, y),
            this.curve(this.perlin(this.gradient, x * this.scale, y * this.scale) / 2 + 0.5)
        )
    }

}
