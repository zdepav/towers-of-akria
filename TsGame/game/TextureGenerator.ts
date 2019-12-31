/// <reference path="Utils.ts"/>

abstract class TextureGenerator extends ColorSource {

    protected color: ColorSource

    constructor(width: number, height: number, color: ColorSource | null) {
        super(width, height)
        this.color = color === null ? RgbaColor.black.source() : color
    }

}

enum CellularTextureType {
    Lava,
    Net,
    Balls
}

// based on https://blackpawn.com/texts/cellular/default.html
class CellularTextureGenerator extends TextureGenerator {

    private color2: ColorSource
    private type: CellularTextureType
    private density: number
    private distances: number[]
    private min: number
    private range: number

    // density n => 1 point per n pixels
    constructor(width: number, height: number, density: number, color1: ColorSource | null, color2: ColorSource | null, type: CellularTextureType) {
        super(width, height, color1)
        this.color2 = color2 === null ? RgbaColor.white.source() : color2
        this.type = type
        this.density = Math.max(1, density)
        let points: Coords[] = []
        let pointCount = this.width * this.height / this.density
        if (pointCount < 2) {
            pointCount = 2
        }
        for (let i = 0; i < pointCount; ++i) {
            points[i] = new Coords(
                Math.random() * this.width,
                Math.random() * this.height
            )
        }
        this.distances = []
        this.min = Infinity
        let max = 0, i: number, d: number
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                let { min1, min2 } = CellularTextureGenerator.distancesTo2Nearest(this, x, y, points)
                switch (this.type) {
                    case CellularTextureType.Net:
                        d = min2 - min1
                        break
                    case CellularTextureType.Balls:
                        d = min2 * min1
                        break
                    default: // Lava
                        d = min1 * min1
                        break
                }
                this.min = Math.min(this.min, d)
                max = Math.max(max, d)
                this.distances[Utils.flatten(this.width, x, y)] = d
            }
        }
        this.range = max - this.min
    }

    private static wrappedDistance(g: CellularTextureGenerator, x: number, y: number, b: Coords): number {
        let dx = Math.abs(x - b.x)
        let dy = Math.abs(y - b.y)
        if (dx > g.width / 2) {
            dx = g.width - dx;
        }
        if (dy > g.height / 2) {
            dy = g.height - dy;
        }
        return Math.sqrt(dx * dx + dy * dy)
    }

    private static distancesTo2Nearest(g: CellularTextureGenerator, x: number, y: number, points: Coords[]): { min1: number, min2: number } {
        let min1 = Infinity
        let min2 = Infinity
        for (const p of points) {
            let d = CellularTextureGenerator.wrappedDistance(g, x, y, p)
            if (d < min1) {
                min2 = min1
                min1 = d
            } else if (d < min2) {
                min2 = d
            }
        }
        return { min1, min2 }
    }

    protected _getColor(x: number, y: number): RgbaColor {
        return this.color.getColor(x, y).lerp(
            this.color2.getColor(x, y),
            (this.distances[Utils.flatten(this.width, x, y)] - this.min) / this.range
        )
    }

}

class NoiseTextureGenerator extends TextureGenerator {

    private cache: RgbaColor[]
    private intensity: number
    private saturation: number
    private coverage: number

    constructor(width: number, height: number, color: ColorSource | null, intensity: number, saturation: number, coverage: number) {
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

class PerlinGradient {

    private width: number
    private height: number
    private data: Vec2[]

    constructor(width: number, height: number) {
        this.width = Math.ceil(width)
        this.height = Math.ceil(height)
        this.data = []
        let c = this.width * this.height
        for (let i = 0; i < c; ++i) {
            this.data.push(Vec2.randUnit())
        }
    }

    get(x: number, y: number): Vec2 {
        return this.data[
            Utils.wrap(x, 0, this.width) +
            Utils.wrap(y, 0, this.height) * this.width
        ]
    }

}

abstract class PerlinTextureGenerator extends TextureGenerator {

    protected color2: ColorSource
    protected scale: number

    constructor(width: number, height: number, color1: ColorSource | null, color2: ColorSource | null, scale: number = 1) {
        super(width, height, color1)
        this.color2 = color2 === null ? RgbaColor.white.source() : color2
        this.scale = 1 / (scale * 32)
    }

    protected dotGridGradient(gradient: PerlinGradient, ix: number, iy: number, x: number, y: number): number {
        return gradient.get(ix, iy).udot(x - ix, y - iy);
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
        )
    }

}

class PerlinNoiseTextureGenerator extends PerlinTextureGenerator {

    private gradient: PerlinGradient

    constructor(width: number, height: number, color1: ColorSource | null, color2: ColorSource | null, scale: number = 1) {
        super(width, height, color1, color2, scale)
        this.gradient = new PerlinGradient(this.width * this.scale, this.height * this.scale)
    }

    protected _getColor(x: number, y: number): RgbaColor {
        return this.color.getColor(x, y).lerp(
            this.color2.getColor(x, y),
            this.perlin(this.gradient, x * this.scale, y * this.scale) / 2 + 0.5
        )
    }

}

class CloudsTextureGenerator extends PerlinTextureGenerator {

    private scales: number[]
    private coeficients: number[]
    private gradients: PerlinGradient[]

    constructor(width: number, height: number, color1: ColorSource | null, color2: ColorSource | null, scale: number = 1) {
        super(width, height, color1, color2, scale)
        this.scales = [
            this.scale / 4,
            this.scale / 2,
            this.scale,
            this.scale * 2,
            this.scale * 4,
            this.scale * 8
        ]
        this.coeficients = [0.5, 0.25, 0.125, 0.0625, 0.03125, 0.03125]
        this.gradients = []
        for (let i = 0; i < 6; ++i) {
            this.gradients.push(new PerlinGradient(this.width * this.scales[i], this.height * this.scales[i]))
        }
    }

    protected _getColor(x: number, y: number): RgbaColor {
        let v = 0
        for (let i = 0; i < 6; ++i) {
            v += this.perlin(this.gradients[i], x * this.scales[i], y * this.scales[i]) * this.coeficients[i]
        }
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), v / 2 + 0.5)
    }

}

class VelvetTextureGenerator extends PerlinTextureGenerator {

    private gradients: PerlinGradient[]

    constructor(width: number, height: number, color1: ColorSource | null, color2: ColorSource | null, scale: number = 1) {
        super(width, height, color1, color2, scale)
        this.gradients = []
        let w = this.width * this.scale, h = this.height * this.scale
        for (let i = 0; i < 3; ++i) {
            this.gradients.push(new PerlinGradient(w, h))
        }
    }

    protected _getColor(x: number, y: number): RgbaColor {
        return this.color.getColor(x, y).lerp(
            this.color2.getColor(x, y),
            this.perlin(
                this.gradients[0],
                x * this.scale + this.perlin(this.gradients[1], x * this.scale, y * this.scale),
                y * this.scale + this.perlin(this.gradients[2], x * this.scale, y * this.scale)
            ) / 2 + 0.5
        )
    }

}

class GlassTextureGenerator extends PerlinTextureGenerator {

    private turbulence: number
    private gradients: PerlinGradient[]

    constructor(width: number, height: number, color1: ColorSource | null, color2: ColorSource | null, scale: number = 1, turbulence: number = 1) {
        super(width, height, color1, color2, scale)
        this.turbulence = 0.125 * turbulence
        this.gradients = []
        let w = this.width * this.scale, h = this.height * this.scale
        for (let i = 0; i < 3; ++i) {
            this.gradients.push(new PerlinGradient(w, h))
        }
    }

    protected _getColor(x: number, y: number): RgbaColor {
        let _x = Math.cos((this.perlin(this.gradients[1], x * this.scale, y * this.scale) * 128 + 128) * this.turbulence)
        let _y = Math.sin((this.perlin(this.gradients[2], x * this.scale, y * this.scale) * 128 + 128) * this.turbulence)
        return this.color.getColor(x, y).lerp(
            this.color2.getColor(x, y),
            this.perlin(
                this.gradients[0],
                x * this.scale + _x,
                y * this.scale + _y
            ) / 2 + 0.5
        )
    }

}

class FrostedGlassTextureGenerator extends PerlinTextureGenerator {

    private scales: number[]
    private coeficients: number[]
    private gradients: PerlinGradient[]

    constructor(width: number, height: number, color1: ColorSource | null, color2: ColorSource | null, scale: number = 1) {
        super(width, height, color1, color2, scale)
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
            this.perlin(this.gradients[6], _x, _y) / 2 + 0.5
        )
    }

}

class BarkTextureGenerator extends PerlinTextureGenerator {

    private scales: number[]
    private coeficients: number[]
    private gradients: PerlinGradient[]

    constructor(width: number, height: number, color1: ColorSource | null, color2: ColorSource | null, scale: number = 1) {
        super(width, height, color1, color2, scale)
        this.scales = [this.scale, this.scale * 2, this.scale * 4, this.scale * 6]
        this.coeficients = [0.5, 0.25, 0.25]
        this.gradients = []
        for (let i = 0; i < 4; ++i) {
            this.gradients.push(new PerlinGradient(this.width * this.scales[i], this.height * this.scales[i]))
        }
    }

    protected _getColor(x: number, y: number): RgbaColor {
        let v = 0
        for (let i = 0; i < 3; ++i) {
            v += this.perlin(this.gradients[i], x * this.scales[i], y * this.scales[i]) * this.coeficients[i]
        }
        v = Utils.granulate(Math.sin(2 * x * this.scale * Math.PI + 8 * v), 2)
        v += Utils.granulate(this.perlin(this.gradients[3], x * this.scales[3], y * this.scales[3]), 5)
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), v / 4 + 0.5)
    }

}

class CirclesTextureGenerator extends PerlinTextureGenerator {

    private cx: number
    private cy: number
    private ringCount: number
    private ringCountL: number
    private background: ColorSource
    private scale2: number
    private gradients: PerlinGradient[]

    constructor(width: number, height: number, color1: ColorSource | null, color2: ColorSource | null, background: ColorSource | null, scale: number = 1, ringCount: number = Infinity) {
        super(width, height, color1, color2, scale)
        this.ringCount = ringCount
        this.ringCountL = this.ringCount - 0.25
        this.background = background !== null ? background : RgbaColor.transparent.source()
        this.gradients = []
        this.scale2 = this.scale * 2
        for (let i = 0; i < 2; ++i) {
            this.gradients.push(new PerlinGradient(this.width * this.scale2, this.height * this.scale2))
        }
        this.cx = this.width * this.scale / 2
        this.cy = this.height * this.scale / 2
    }

    protected _getColor(x: number, y: number): RgbaColor {
        let _x = x * this.scale + this.perlin(this.gradients[0], x * this.scale2, y * this.scale2) * 0.5 - this.cx
        let _y = y * this.scale + this.perlin(this.gradients[1], x * this.scale2, y * this.scale2) * 0.5 - this.cy
        let d = Math.sqrt(_x * _x + _y * _y)
        if (d > this.ringCount) {
            return this.background.getColor(x, y)
        } else {
            let c = this.color.getColor(x, y).lerp(
                this.color2.getColor(x, y),
                Utils.interpolateSmooth(0, 1, 1 - Math.abs(1 - d % 1 * 2))
            )
            if (d > this.ringCountL) {
                return c.lerp(
                    this.background.getColor(x, y),
                    Utils.interpolateSmooth(0, 1, (d - this.ringCountL) * 4)
                )
            } else {
                return c
            }
        }
    }

}

class CamouflageTextureGenerator extends PerlinTextureGenerator {

    private scales: number[]
    private coeficients: number[]
    private gradients: PerlinGradient[]

    constructor(width: number, height: number, color1: ColorSource | null, color2: ColorSource | null, scale: number = 1) {
        super(width, height, color1, color2, scale)
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
            (
                Utils.granulate(this.perlin(this.gradients[6], _x, _y), 4) * 0.7 +
                Utils.granulate(this.perlin(this.gradients[7], _x * 2, _y * 2), 5) * 0.2 +
                Utils.granulate(this.perlin(this.gradients[8], _x * 4, _y * 4), 6) * 0.1
            ) / 2 + 0.5
        )
    }

}
