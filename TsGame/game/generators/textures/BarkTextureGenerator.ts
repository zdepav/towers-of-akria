/// <reference path="PerlinTextureGenerator.ts"/>

class BarkTextureGenerator extends PerlinTextureGenerator {

    private readonly scales: number[]
    private readonly coeficients: number[]
    private readonly gradients: PerlinGradient[]
    private readonly turbulence: number

    constructor(
        width: number, height: number,
        color1: ColorSourceSource,
        color2: ColorSourceSource,
        scale: number = 1,
        turbulence: number = 1,
        curve?: (x: number) => number
    ) {
        super(width, height, color1, color2, scale, curve)
        this.scales = [this.scale, this.scale * 2, this.scale * 4, this.scale * 6]
        this.coeficients = [0.5, 0.25, 0.25]
        this.turbulence = turbulence
        this.gradients = []
        for (let i = 0; i < 4; ++i) {
            this.gradients.push(
                new PerlinGradient(this.width * this.scales[i], this.height * this.scales[i])
            )
        }
    }

    protected _getColor(x: number, y: number): RgbaColor {
        let v = 0
        for (let i = 0; i < 3; ++i) {
            v += this.perlin(
                this.gradients[i], x * this.scales[i], y * this.scales[i]
            ) * this.coeficients[i] * this.turbulence
        }
        v = Utils.granulate(Math.sin(2 * x * this.scale * Math.PI + 8 * v), 2)
        v += Utils.granulate(
            this.perlin(this.gradients[3], x * this.scales[3], y * this.scales[3]),
            5
        )
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), this.curve(v / 4 + 0.5))
    }
}
