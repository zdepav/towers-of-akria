/// <reference path="PerlinTextureGenerator.ts"/>

class GlassTextureGenerator extends PerlinTextureGenerator {

    private readonly turbulence: number
    private readonly gradients: PerlinGradient[]

    constructor(
        width: number, height: number,
        color1: ColorSourceSource,
        color2: ColorSourceSource,
        scale: number = 1,
        turbulence: number = 1,
        curve?: (x: number) => number
    ) {
        super(width, height, color1, color2, scale, curve)
        this.turbulence = 0.125 * turbulence
        this.gradients = []
        let w = this.width * this.scale, h = this.height * this.scale
        for (let i = 0; i < 3; ++i) {
            this.gradients.push(new PerlinGradient(w, h))
        }
    }

    protected _getColor(x: number, y: number): RgbaColor {
        let _x = Math.cos(
            (this.perlin(
                this.gradients[1], x * this.scale, y * this.scale
            ) * 128 + 128) * this.turbulence
        )
        let _y = Math.sin(
            (this.perlin(
                this.gradients[2], x * this.scale, y * this.scale
            ) * 128 + 128) * this.turbulence
        )
        return this.color.getColor(x, y).lerp(
            this.color2.getColor(x, y),
            this.curve(this.perlin(
                this.gradients[0],
                x * this.scale + _x,
                y * this.scale + _y
            ) / 2 + 0.5)
        )
    }
}
