/// <reference path="TextureGenerator.ts"/>

class NoiseTextureGenerator extends TextureGenerator {

    private cache: RgbaColor[]
    private intensity: number
    private saturation: number
    private coverage: number

    constructor(
        width: number, height: number,
        color: ColorSourceSource,
        intensity: number,
        saturation: number,
        coverage: number
    ) {
        super(width, height, color)
        this.intensity = Utils.clamp(intensity, 0, 1)
        this.saturation = Utils.clamp(saturation, 0, 1)
        this.coverage = Utils.clamp(coverage, 0, 1)
        this.cache = []
    }

    protected _getColor(x: number, y: number): RgbaColor {
        let i = Utils.flatten(this.width, Math.floor(x), Math.floor(y))
        if (this.cache[i] === undefined) {
            this.cache[i] = this.color.getColor(x, y).addNoise(this.intensity, this.saturation, this.coverage)
        }
        return this.cache[i]
    }

}
