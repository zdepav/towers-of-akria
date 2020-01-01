/// <reference path="utils.ts"/>

abstract class ColorSource {

    protected width: number
    protected height: number

    constructor(width: number, height: number) {
        this.width = Math.max(1, Math.floor(width))
        this.height = Math.max(1, Math.floor(height))
    }

    getColor(x: number, y: number): RgbaColor {
        return this._getColor(
            Utils.wrap(x, 0, this.width),
            Utils.wrap(y, 0, this.height)
        )
    }

    protected abstract _getColor(x: number, y: number): RgbaColor;

    generateImage(): CanvasImageSource {
        let tex = new PreRenderedImage(this.width, this.height)
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                tex.ctx.fillStyle = this._getColor(x, y).toCss()
                tex.ctx.fillRect(x, y, 1, 1);
            }
        }
        return tex.image
    }

    static get(color: ColorSource | RgbaColor | string | null): ColorSource {
        if (color === null) {
            return RgbaColor.transparent.source()
        } else if (color instanceof ColorSource) {
            return color
        } else if (color instanceof RgbaColor) {
            return color.source()
        } else if (Utils.isString(color)) {
            return RgbaColor.fromHex(color as string).source()
        } else {
            return RgbaColor.transparent.source()
        }
    }

}

class CanvasColorSource extends ColorSource {

    private ctx: CanvasRenderingContext2D

    constructor(canvas: HTMLCanvasElement, ctx?: CanvasRenderingContext2D) {
        super(canvas.width, canvas.height)
        this.ctx = ctx === undefined ? canvas.getContext("2d") as CanvasRenderingContext2D : ctx
    }

    protected _getColor(x: number, y: number): RgbaColor {
        var data = this.ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
        return new RgbaColor(data[0], data[1], data[2], data[3]);
    }

    generateImage(): CanvasImageSource {
        let tex = new PreRenderedImage(this.width, this.height)
        tex.ctx.putImageData(this.ctx.getImageData(0, 0, this.width, this.height), 0, 0)
        return tex.image
    }

}

class RgbaColor {

    static transparent: RgbaColor
    static black: RgbaColor
    static red: RgbaColor
    static green: RgbaColor
    static blue: RgbaColor
    static yellow: RgbaColor
    static cyan: RgbaColor
    static magenta: RgbaColor
    static white: RgbaColor

    r: number
    g: number
    b: number
    a: number

    constructor(r: number, g: number, b: number, a: number = 255) {
        this.r = Math.floor(Utils.clamp(r, 0, 255))
        this.g = Math.floor(Utils.clamp(g, 0, 255))
        this.b = Math.floor(Utils.clamp(b, 0, 255))
        this.a = Math.floor(Utils.clamp(a, 0, 255))
    }

    static fromHex(color: string): RgbaColor {
        if (/^#[0-9a-f]{3}[0-9a-f]?$/i.test(color)) {
            let a = color.length > 4 ? parseInt(color[4], 16) * 17 : 255
            return new RgbaColor(
                parseInt(color[1], 16) * 17,
                parseInt(color[2], 16) * 17,
                parseInt(color[3], 16) * 17,
                a
            )
        } else if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(color)) {
            let a = color.length > 7 ? parseInt(color.substr(7, 2), 16) : 255
            return new RgbaColor(
                parseInt(color.substr(1, 2), 16),
                parseInt(color.substr(3, 2), 16),
                parseInt(color.substr(5, 2), 16),
                a
            )
        } else throw new Error("Invalid color format")
    }

    private pr(): number { return this.r * this.a / 255 }

    private pg(): number { return this.g * this.a / 255 }

    private pb(): number { return this.b * this.a / 255 }

    private pa(): number { return this.a * this.a / 255 }

    multiplyFloat(ammount: number, multiplyAlpha: boolean = false): RgbaColor {
        return new RgbaColor(
            this.r * ammount,
            this.g * ammount,
            this.b * ammount,
            multiplyAlpha ? this.a * ammount : this.a
        )
    }

    multiply(c: RgbaColor): RgbaColor {
        return new RgbaColor(this.r * c.r, this.g * c.g, this.b * c.b, this.a * c.a)
    }

    add(c: RgbaColor): RgbaColor {
        let a = false
        if (a) {
            console.log(`${this} + ${c} = ${new RgbaColor(this.r + c.pr(), this.g + c.pg(), this.b + c.pb(), this.a + c.pa())}`)
        }
        return new RgbaColor(this.r + c.pr(), this.g + c.pg(), this.b + c.pb(), this.a + c.pa())
    }

    blend(c: RgbaColor): RgbaColor {
        if (this.a === 0) {
            return c.a === 0 ? this : c
        } else if (c.a === 0) {
            return this
        } else {
            return new RgbaColor(
                this.r + c.pr(),
                this.g + c.pg(),
                this.b + c.pb(),
                this.a + c.a * (255 - this.a) / 255
            )
        }
    }

    withRed(r: number): RgbaColor { return new RgbaColor(r, this.g, this.b, this.a) }

    withGreen(g: number): RgbaColor { return new RgbaColor(this.r, g, this.b, this.a) }

    withBlue(b: number): RgbaColor { return new RgbaColor(this.r, this.g, b, this.a) }

    withAlpha(a: number): RgbaColor { return new RgbaColor(this.r, this.g, this.b, a) }

    lerp(c: RgbaColor, ammount: number): RgbaColor {
        if (ammount >= 1) {
            return c
        } else if (ammount <= 0) {
            return this
        } else {
            let a2 = 1 - ammount
            return new RgbaColor(
                this.r * a2 + c.r * ammount,
                this.g * a2 + c.g * ammount,
                this.b * a2 + c.b * ammount,
                this.a * a2 + c.a * ammount
            )
        }
    }

    addNoise(intensity: number, saturation: number, coverage: number): RgbaColor {
        if (Math.random() < coverage) {
            intensity *= 255
            if (saturation <= 0) {
                let n = Utils.rand(-intensity, intensity)
                return new RgbaColor(this.r + n, this.g + n, this.b + n, this.a)
            } else if (saturation >= 1) {
                return new RgbaColor(
                    this.r + Utils.rand(-intensity, intensity),
                    this.g + Utils.rand(-intensity, intensity),
                    this.b + Utils.rand(-intensity, intensity),
                    this.a
                )
            } else {
                let s2 = 1 - saturation
                let rn = Utils.rand(-intensity, intensity)
                let gn = saturation * Utils.rand(-intensity, intensity) + s2 * rn
                let bn = saturation * Utils.rand(-intensity, intensity) + s2 * rn
                return new RgbaColor(this.r + rn, this.g + gn, this.b + bn, this.a)
            }
        } else {
            return this
        }
    }

    source(width: number = 1, height: number = 1): RgbaColorSource {
        return new RgbaColorSource(this, width, height)
    }

    toCss(): string {
        return "#"
            + Utils.byteToHex(this.r)
            + Utils.byteToHex(this.g)
            + Utils.byteToHex(this.b)
            + Utils.byteToHex(this.a)
    }

    toString(): string {
        return `rgba(${this.r},${this.g},${this.b},${this.a / 255})`
    }

    static init() {
        RgbaColor.transparent = new RgbaColor(0, 0, 0, 0)
        RgbaColor.black = new RgbaColor(0, 0, 0)
        RgbaColor.red = new RgbaColor(255, 0, 0)
        RgbaColor.green = new RgbaColor(0, 255, 0)
        RgbaColor.blue = new RgbaColor(0, 0, 255)
        RgbaColor.yellow = new RgbaColor(255, 255, 0)
        RgbaColor.cyan = new RgbaColor(0, 255, 255)
        RgbaColor.magenta = new RgbaColor(255, 0, 255)
        RgbaColor.white = new RgbaColor(255, 255, 255)
    }

}

RgbaColor.init()

class RgbaColorSource extends ColorSource {

    color: RgbaColor

    constructor(color: RgbaColor, width: number = 1, height: number = 1) {
        super(width, height)
        this.color = color
    }

    protected _getColor(x: number, y: number): RgbaColor { return this.color }

    generateImage(): CanvasImageSource {
        let tex = new PreRenderedImage(this.width, this.height)
        tex.ctx.fillStyle = this.color.toCss()
        tex.ctx.fillRect(0, 0, this.width, this.height)
        return tex.image
    }

}

abstract class TextureGenerator extends ColorSource {

    protected color: ColorSource

    constructor(width: number, height: number, color: ColorSource | string | null) {
        super(width, height)
        this.color = ColorSource.get(color ?? RgbaColor.black)
    }

}

enum CellularTextureType {
    Lava,
    Net,
    Balls
}

enum CellularTextureDistanceMetric {
    Euclidean,
    Manhattan,
    Chebyshev,
    Minkowski
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
    constructor(
        width: number,
        height: number,
        density: number,
        color1: ColorSource | string | null,
        color2: ColorSource | string | null,
        type: CellularTextureType = CellularTextureType.Lava,
        metric: CellularTextureDistanceMetric = CellularTextureDistanceMetric.Euclidean
    ) {
        super(width, height, color1)
        this.color2 = ColorSource.get(color2 ?? RgbaColor.white)
        this.type = type
        let distance: (dx: number, dy: number) => number
        switch (metric) {
            case CellularTextureDistanceMetric.Euclidean:
                distance = Utils.euclideanDistance
                break
            case CellularTextureDistanceMetric.Manhattan:
                distance = Utils.manhattanDistance
                break
            case CellularTextureDistanceMetric.Chebyshev:
                distance = Utils.chebyshevDistance
                break
            case CellularTextureDistanceMetric.Minkowski:
                distance = Utils.minkowskiDistance
                break
        }
        this.density = Math.max(1, density)
        let points: Vec2[] = []
        let pointCount = this.width * this.height / this.density
        if (pointCount < 2) {
            pointCount = 2
        }
        for (let i = 0; i < pointCount; ++i) {
            points[i] = new Vec2(
                Math.random() * this.width,
                Math.random() * this.height
            )
        }
        this.distances = []
        this.min = Infinity
        let max = 0, i: number, d: number
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                let { min1, min2 } = CellularTextureGenerator.distancesTo2Nearest(x, y, this.width, this.height, points, distance)
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

    private static wrappedDistance(
        x: number, y: number,
        width: number, height: number,
        b: Vec2,
        distance: (dx: number, dy: number) => number
    ): number {
        let dx = Math.abs(x - b.x)
        let dy = Math.abs(y - b.y)
        if (dx > width / 2) {
            dx = width - dx;
        }
        if (dy > height / 2) {
            dy = height - dy;
        }
        return distance(dx, dy)
    }

    private static distancesTo2Nearest(
        x: number, y: number,
        width: number, height: number,
        points: Vec2[],
        distance: (dx: number, dy: number) => number
    ): { min1: number, min2: number } {
        let min1 = Infinity
        let min2 = Infinity
        for (const p of points) {
            let d = CellularTextureGenerator.wrappedDistance(x, y, width, height, p, distance)
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

    constructor(
        width: number, height: number,
        color: ColorSource | string | null,
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

    constructor(
        width: number, height: number,
        color1: ColorSource | string | null,
        color2: ColorSource | string | null,
        scale: number = 1
    ) {
        super(width, height, color1)
        this.color2 = ColorSource.get(color2 ?? RgbaColor.white)
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

    constructor(
        width: number, height: number,
        color1: ColorSource | string | null,
        color2: ColorSource | string | null,
        scale: number = 1
    ) {
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

    constructor(
        width: number, height: number,
        color1: ColorSource | string | null,
        color2: ColorSource | string | null,
        scale: number = 1
    ) {
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

    constructor(
        width: number, height: number,
        color1: ColorSource | string | null,
        color2: ColorSource | string | null,
        scale: number = 1
    ) {
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

    constructor(
        width: number, height: number,
        color1: ColorSource | string | null,
        color2: ColorSource | string | null,
        scale: number = 1,
        turbulence: number = 1
    ) {
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

    constructor(
        width: number, height: number,
        color1: ColorSource | string | null,
        color2: ColorSource | string | null,
        scale: number = 1
    ) {
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

    constructor(
        width: number, height: number,
        color1: ColorSource | string | null,
        color2: ColorSource | string | null,
        scale: number = 1
    ) {
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
    private turbulence: number
    private background: ColorSource
    private scale2: number
    private gradients: PerlinGradient[]

    constructor(
        width: number, height: number,
        color1: ColorSource | string | null,
        color2: ColorSource | string | null,
        background: ColorSource | string | null,
        scale: number = 1,
        ringCount: number = Infinity,
        turbulence: number = 1
    ) {
        super(width, height, color1, color2, scale)
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

    constructor(
        width: number, height: number,
        color1: ColorSource | string | null,
        color2: ColorSource | string | null,
        scale: number = 1
    ) {
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

abstract class GradientSource extends ColorSource {

    private colorStops: { pos: number, color: ColorSource }[]

    constructor(width: number, height: number) {
        super(width, height)
        this.colorStops = []
    }

    addColorStop(pos: number, color: ColorSource | RgbaColor | string) {
        this.colorStops.push({ pos: pos, color: ColorSource.get(color) })
        this.colorStops.sort((a, b) => a.pos - b.pos)
    }

    protected getColorAtPosition(x: number, y: number, position: number): RgbaColor {
        if (this.colorStops.length == 0) {
            return RgbaColor.black
        } else if (this.colorStops.length == 1) {
            return this.colorStops[0].color.getColor(x, y)
        } else if (position <= this.colorStops[0].pos) {
            return this.colorStops[0].color.getColor(x, y)
        } else if (position >= this.colorStops[this.colorStops.length - 1].pos) {
            return this.colorStops[this.colorStops.length - 1].color.getColor(x, y)
        } else {
            let i = 1
            while (position > this.colorStops[i].pos) {
                ++i
            }
            return this.colorStops[i - 1].color.getColor(x, y).lerp(
                this.colorStops[i].color.getColor(x, y),
                (position - this.colorStops[i - 1].pos) / (this.colorStops[i].pos - this.colorStops[i - 1].pos)
            )
        }
    }

}

class LinearGradientSource extends GradientSource {

    private a: number
    private b: number
    private c: number
    private d: number

    constructor(width: number, height: number, x1: number, y1: number, x2: number, y2: number) {
        super(width, height)
        this.a = x2 - x1
        this.b = y2 - y1
        this.c = -this.a * x1 - this.b * y1
        this.d = Math.sqrt(this.a * this.a + this.b * this.b)
        this.d *= this.d
    }

    protected _getColor(x: number, y: number): RgbaColor {
        return this.getColorAtPosition(x, y, (this.a * x + this.b * y + this.c) / this.d)
    }

}

class RadialGradientSource extends GradientSource {

    private x: number
    private y: number
    private r1: number
    private dr: number

    constructor(width: number, height: number, x: number, y: number, r1: number, r2: number) {
        super(width, height)
        this.x = x
        this.y = y
        this.r1 = r1
        this.dr = r2 - r1
    }

    protected _getColor(x: number, y: number): RgbaColor {
        let dx = x - this.x, dy = y - this.y
        return this.getColorAtPosition(x, y, (Math.sqrt(dx * dx + dy * dy) - this.r1) / this.dr)
    }

}

abstract class ShapeSource extends ColorSource {

    protected color: ColorSource
    protected background: ColorSource

    constructor(
        width: number, height: number,
        color: ColorSource | string | null,
        background: ColorSource | string | null
    ) {
        super(width, height)
        this.color = ColorSource.get(color ?? RgbaColor.white)
        this.background = ColorSource.get(background ?? RgbaColor.black)
    }

}

class RectangleSource extends ShapeSource {

    private x: number
    private y: number
    private w: number
    private h: number

    constructor(
        width: number, height: number,
        x: number, y: number,
        w: number, h: number,
        color: ColorSource | string | null,
        background: ColorSource | string | null
    ) {
        super(width, height, color, background)
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }

    protected _getColor(x: number, y: number): RgbaColor {
        let _x = (x - this.x) / this.w, _y = (y - this.y) / this.h
        return (_x >= 0 || _x < 1 || _y >= 0 || _y < 1) ? this.color.getColor(x, y) : this.background.getColor(x, y)
    }

}

class EllipseSource extends ShapeSource {

    private x: number
    private y: number
    private r1: number
    private r2: number

    constructor(
        width: number, height: number,
        x: number, y: number,
        r1: number, r2: number,
        color: ColorSource | string | null,
        background: ColorSource | string | null
    ) {
        super(width, height, color, background)
        this.x = x
        this.y = y
        this.r1 = r1
        this.r2 = r2
    }

    protected _getColor(x: number, y: number): RgbaColor {
        let _x = (x - this.x) / this.r1, _y = (y - this.y) / this.r2
        return Math.sqrt(_x * _x + _y * _y) <= 1 ? this.color.getColor(x, y) : this.background.getColor(x, y)
    }

}

class PathSource extends ShapeSource {

    private path: Path2D
    private fillRule: CanvasFillRule
    private ctx: CanvasRenderingContext2D

    constructor(
        width: number, height: number,
        path: Path2D,
        color: ColorSource | string | null,
        background: ColorSource | string | null,
        fillRule: CanvasFillRule = "nonzero"
    ) {
        super(width, height, color, background)
        this.path = path
        this.fillRule = fillRule
        this.ctx = new PreRenderedImage(1, 1).ctx
    }

    protected _getColor(x: number, y: number): RgbaColor {
        return this.ctx.isPointInPath(this.path, x, y, this.fillRule) ? this.color.getColor(x, y) : this.background.getColor(x, y)
    }

}

abstract class CombiningSource extends ColorSource {

    protected color1: ColorSource
    protected color2: ColorSource

    constructor(
        width: number, height: number,
        color1: ColorSource | string | null,
        color2: ColorSource | string | null
    ) {
        super(width, height)
        this.color1 = ColorSource.get(color1 ?? RgbaColor.black)
        this.color2 = ColorSource.get(color2 ?? RgbaColor.white)
    }

    protected _getColor(x: number, y: number): RgbaColor {
        return this.combine(this.color1.getColor(x, y), this.color2.getColor(x, y))
    }

    protected abstract combine(a: RgbaColor, b: RgbaColor): RgbaColor;

}

class AddingSource extends CombiningSource {

    constructor(
        width: number, height: number,
        color1: ColorSource | string | null,
        color2: ColorSource | string | null
    ) {
        super(width, height, color1, color2)
    }

    protected combine(a: RgbaColor, b: RgbaColor): RgbaColor { return a.add(b) }

}

class MultiplyingSource extends CombiningSource {

    constructor(
        width: number, height: number,
        color1: ColorSource | string | null,
        color2: ColorSource | string | null
    ) {
        super(width, height, color1, color2)
    }

    protected combine(a: RgbaColor, b: RgbaColor): RgbaColor { return a.multiply(b) }

}

class BlendingSource extends CombiningSource {

    constructor(
        width: number, height: number,
        color1: ColorSource | string | null,
        color2: ColorSource | string | null
    ) {
        super(width, height, color1, color2)
    }

    protected combine(a: RgbaColor, b: RgbaColor): RgbaColor { return a.blend(b) }

}

class LerpingSource extends CombiningSource {

    private coeficient: number

    constructor(
        width: number, height: number,
        color1: ColorSource | string | null,
        color2: ColorSource | string | null,
        coeficient: number
    ) {
        super(width, height, color1, color2)
        this.coeficient = coeficient
    }

    protected combine(a: RgbaColor, b: RgbaColor): RgbaColor { return a.lerp(b, this.coeficient) }

}

abstract class TransformingSource extends ColorSource {

    protected source: ColorSource

    constructor(
        width: number, height: number,
        source: ColorSource
    ) {
        super(width, height)
        this.source = source
    }

    protected _getColor(x: number, y: number): RgbaColor {
        let v = this.reverseTransform(x, y)
        return this.source.getColor(v.x, v.y)
    }

    protected abstract reverseTransform(x: number, y: number): Vec2;

}

class TranslatingSource extends TransformingSource {

    private xd: number
    private yd: number

    constructor(
        width: number, height: number,
        source: ColorSource,
        xd: number, yd: number
    ) {
        super(width, height, source)
        this.xd = xd
        this.yd = yd
    }

    protected reverseTransform(x: number, y: number): Vec2 {
        return new Vec2(x - this.xd, y - this.yd)
    }

}

class RotatingSource extends TransformingSource {

    private angle: number
    private originX: number
    private originY: number

    constructor(
        width: number, height: number,
        source: ColorSource,
        angle: number,
        originX: number, originY: number
    ) {
        super(width, height, source)
        this.angle = angle
        this.originX = originX
        this.originY = originY
    }

    protected reverseTransform(x: number, y: number): Vec2 {
        return Utils.rotatePoint(x, y, this.originX, this.originY, -this.angle)
    }

}

class ScalingSource extends TransformingSource {

    private scale: number
    private origin: Vec2

    constructor(
        width: number, height: number,
        source: ColorSource,
        scale: number,
        originX: number, originY: number
    ) {
        super(width, height, source)
        this.scale = scale
        this.origin = new Vec2(originX, originY)
    }

    protected reverseTransform(x: number, y: number): Vec2 {
        let v = new Vec2(x, y), dv = v.sub(this.origin)
        if (dv.isZero()) { return v }
        return v.add(dv.mul(1 / this.scale))
    }

}
