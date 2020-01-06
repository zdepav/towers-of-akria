/// <reference path="PerlinTextureGenerator.ts"/>

class FrostedGlassTextureGenerator extends PerlinTextureGenerator {

    private scales: number[]
    private coeficients: number[]
    private gradients: PerlinGradient[]

    constructor(
        width: number, height: number,
        color1: ColorSourceSource,
        color2: ColorSourceSource,
        scale: number = 1,
        curve?: (x: number) => number
    ) {
        super(width, height, color1, color2, scale, curve)
        this.scales = [this.scale, this.scale * 2, this.scale * 4]
        this.coeficients = [0.5, 0.25, 0.25]
        this.gradients = []
        for (let i = 0; i < 7; ++i) {
            this.gradients.push(new PerlinGradient(this.width * this.scales[i % 3], this.height * this.scales[i % 3]))
        }
    }

    protected _getColor(x: number, y: number): RgbaColor {
        let _x = x * this.scale, _y = y * this.scale
        for (let i = 0; i < 3; ++i) {
            _x += this.perlin(this.gradients[i], x * this.scales[i], y * this.scales[i]) * this.coeficients[i]
            _y += this.perlin(this.gradients[i + 3], x * this.scales[i], y * this.scales[i]) * this.coeficients[i]
        }
        return this.color.getColor(x, y).lerp(
            this.color2.getColor(x, y),
            this.curve(this.perlin(this.gradients[6], _x, _y) / 2 + 0.5)
        )
    }

}
