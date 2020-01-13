/// <reference path="PerlinTextureGenerator.ts"/>

class VelvetTextureGenerator extends PerlinTextureGenerator {

    private gradients: PerlinGradient[]

    constructor(
        width: number, height: number,
        color1: ColorSourceSource,
        color2: ColorSourceSource,
        scale: number = 1,
        curve?: (x: number) => number
    ) {
        super(width, height, color1, color2, scale, curve)
        this.gradients = []
        let w = this.width * this.scale, h = this.height * this.scale
        for (let i = 0; i < 3; ++i) {
            this.gradients.push(new PerlinGradient(w, h))
        }
    }

    protected _getColor(x: number, y: number): RgbaColor {
        return this.color.getColor(x, y).lerp(
            this.color2.getColor(x, y),
            this.curve(this.perlin(
                this.gradients[0],
                x * this.scale + this.perlin(this.gradients[1], x * this.scale, y * this.scale),
                y * this.scale + this.perlin(this.gradients[2], x * this.scale, y * this.scale)
            ) / 2 + 0.5)
        )
    }
}
