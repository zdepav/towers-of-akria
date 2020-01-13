/// <reference path="PerlinTextureGenerator.ts"/>

class CirclesTextureGenerator extends PerlinTextureGenerator {

    private cx: number
    private cy: number
    private ringCount: number
    private ringCountL: number
    private turbulence: number
    private background: ColorSource
    private scale2: number
    private gradients: PerlinGradient[]

    constructor(
        width: number, height: number,
        color1: ColorSourceSource,
        color2: ColorSourceSource,
        background: ColorSourceSource,
        scale: number = 1,
        ringCount: number = Infinity,
        turbulence: number = 1,
        curve?: (x: number) => number
    ) {
        super(width, height, color1, color2, scale, curve ?? Curve.sin)
        this.ringCount = ringCount
        this.ringCountL = this.ringCount - 0.25
        this.turbulence = turbulence / 2
        this.background = ColorSource.get(background ?? RgbaColor.transparent)
        this.gradients = []
        this.scale2 = this.scale * 2
        for (let i = 0; i < 2; ++i) {
            this.gradients.push(new PerlinGradient(this.width * this.scale2, this.height * this.scale2))
        }
        this.cx = this.width * this.scale / 2
        this.cy = this.height * this.scale / 2
    }

    protected _getColor(x: number, y: number): RgbaColor {
        let _x = x * this.scale + this.perlin(this.gradients[0], x * this.scale2, y * this.scale2) * this.turbulence - this.cx
        let _y = y * this.scale + this.perlin(this.gradients[1], x * this.scale2, y * this.scale2) * this.turbulence - this.cy
        let d = Math.sqrt(_x * _x + _y * _y)
        if (d > this.ringCount) {
            return this.background.getColor(x, y)
        } else {
            let c = this.color.getColor(x, y).lerp(
                this.color2.getColor(x, y),
                this.curve(1 - Math.abs(1 - d % 1 * 2))
            )
            if (d > this.ringCountL) {
                return c.lerp(
                    this.background.getColor(x, y),
                    this.curve((d - this.ringCountL) * 4)
                )
            } else {
                return c
            }
        }
    }
}
