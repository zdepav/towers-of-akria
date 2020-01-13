/// <reference path="PerlinTextureGenerator.ts"/>

class CamouflageTextureGenerator extends PerlinTextureGenerator {

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
        this.coeficients = [1.5, 0.75, 0.75]
        this.gradients = []
        for (let i = 0; i < 9; ++i) {
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
            this.curve((
                Utils.granulate(this.perlin(this.gradients[6], _x, _y), 4) * 0.7 +
                Utils.granulate(this.perlin(this.gradients[7], _x * 2, _y * 2), 5) * 0.2 +
                Utils.granulate(this.perlin(this.gradients[8], _x * 4, _y * 4), 6) * 0.1
            ) / 2 + 0.5)
        )
    }
}
