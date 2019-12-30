/// <reference path="Utils.ts"/>

abstract class TextureGenerator extends ColorSource {

    protected color: RgbaColorSource

    constructor(width: number, height: number, color: RgbaColorSource) {
        super(width, height)
        this.color = color
    }

}

enum CellularTextureType {
    Lava,
    Net,
    Balls
}

// based on https://blackpawn.com/texts/cellular/default.html
class CellularTextureGenerator extends TextureGenerator {

    private color2: RgbaColorSource
    private type: CellularTextureType
    private density: number
    private distances: number[]
    private min: number
    private range: number

    // density n => 1 point per n pixels
    constructor(width: number, height: number, density: number, color1: RgbaColorSource, color2: RgbaColorSource, type: CellularTextureType) {
        super(width, height, color1)
        this.color2 = color2
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

    protected _getColor(x: number, y: number): RgbaColorSource {
        return this.color.lerp(
            this.color2,
            (this.distances[Utils.flatten(this.width, x, y)] - this.min) / this.range
        )
    }

}

class NoiseTextureGenerator extends TextureGenerator {

    private cache: RgbaColorSource[]
    private intensity: number
    private saturation: number
    private coverage: number

    constructor(width: number, height: number, color: RgbaColorSource, intensity: number, saturation: number, coverage: number) {
        super(width, height, color)
        this.intensity = Utils.clamp(intensity, 0, 1)
        this.saturation = Utils.clamp(saturation, 0, 1)
        this.coverage = Utils.clamp(coverage, 0, 1)
        this.cache = []
    }

    protected _getColor(x: number, y: number): RgbaColorSource {
        let i = Utils.flatten(this.width, Math.floor(x), Math.floor(y))
        if (this.cache[i] === undefined) {
            this.cache[i] = this.color.addNoise(this.intensity, this.saturation, this.coverage)
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

    protected color2: RgbaColorSource
    protected scale: number

    constructor(width: number, height: number, color1: RgbaColorSource, color2: RgbaColorSource, scale: number = 1) {
        super(width, height, color1)
        this.color2 = color2
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

    constructor(width: number, height: number, color1: RgbaColorSource, color2: RgbaColorSource, scale: number = 1) {
        super(width, height, color1, color2, scale)
        this.gradient = new PerlinGradient(this.width * this.scale, this.height * this.scale)
    }

    protected _getColor(x: number, y: number): RgbaColorSource {
        return this.color.lerp(
            this.color2,
            this.perlin(this.gradient, x * this.scale, y * this.scale) / 2 + 0.5
        )
    }

}

class CloudsTextureGenerator extends PerlinTextureGenerator {

    scales: number[]
    coeficients: number[]
    gradients: PerlinGradient[]

    constructor(width: number, height: number, color1: RgbaColorSource, color2: RgbaColorSource, scale: number = 1) {
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

    protected _getColor(x: number, y: number): RgbaColorSource {
        let v = 0
        for (let i = 0; i < 6; ++i) {
            v += this.perlin(this.gradients[i], x * this.scales[i], y * this.scales[i]) * this.coeficients[i]
        }
        return this.color.lerp(this.color2, v / 2 + 0.5)
    }

}

class VelvetTextureGenerator extends PerlinTextureGenerator {

    constructor(width: number, height: number, color1: RgbaColorSource, color2: RgbaColorSource, scale: number = 1) {
        super(width, height, color1, color2, scale)
    }

    generateImage(): CanvasImageSource {
        let tex = new PreRenderedImage(this.width, this.height)
        let w = this.width * this.scale, h = this.height * this.scale
        let grads = [
            new PerlinGradient(w, h),
            new PerlinGradient(w, h),
            new PerlinGradient(w, h)
        ]
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                tex.ctx.fillStyle = this.color.lerp(
                    this.color2,
                    this.perlin(
                        grads[0],
                        x * this.scale + this.perlin(grads[1], x * this.scale, y * this.scale),
                        y * this.scale + this.perlin(grads[2], x * this.scale, y * this.scale)
                    ) / 2 + 0.5
                ).toCss()
                tex.ctx.fillRect(x, y, 1, 1);
            }
        }
        return tex.image
    }

}

class GlassTextureGenerator extends PerlinTextureGenerator {

    private turbulence: number

    constructor(width: number, height: number, color1: RgbaColorSource, color2: RgbaColorSource, scale: number = 1, turbulence: number = 1) {
        super(width, height, color1, color2, scale)
        this.turbulence = 0.125 * turbulence
    }

    generateImage(): CanvasImageSource {
        let tex = new PreRenderedImage(this.width, this.height)
        let w = this.width * this.scale, h = this.height * this.scale
        let grads = [
            new PerlinGradient(w, h),
            new PerlinGradient(w, h),
            new PerlinGradient(w, h)
        ]
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                let _x = Math.cos((this.perlin(grads[1], x * this.scale, y * this.scale) * 128 + 128) * this.turbulence)
                let _y = Math.sin((this.perlin(grads[2], x * this.scale, y * this.scale) * 128 + 128) * this.turbulence)
                tex.ctx.fillStyle = this.color.lerp(
                    this.color2,
                    this.perlin(
                        grads[0],
                        x * this.scale + _x,
                        y * this.scale + _y
                    ) / 2 + 0.5
                ).toCss()
                tex.ctx.fillRect(x, y, 1, 1);
            }
        }
        return tex.image
    }

}

class FrostedGlassTextureGenerator extends PerlinTextureGenerator {

    constructor(width: number, height: number, color1: RgbaColorSource, color2: RgbaColorSource, scale: number = 1) {
        super(width, height, color1, color2, scale)
    }

    generateImage(): CanvasImageSource {
        let tex = new PreRenderedImage(this.width, this.height)
        let scales = [
            this.scale,
            this.scale * 2,
            this.scale * 4
        ]
        let grads = [
            new PerlinGradient(this.width * scales[0], this.height * scales[0]),
            new PerlinGradient(this.width * scales[1], this.height * scales[1]),
            new PerlinGradient(this.width * scales[2], this.height * scales[2]),
            new PerlinGradient(this.width * scales[0], this.height * scales[0]),
            new PerlinGradient(this.width * scales[1], this.height * scales[1]),
            new PerlinGradient(this.width * scales[2], this.height * scales[2]),
            new PerlinGradient(this.width * scales[0], this.height * scales[0])
        ]
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                tex.ctx.fillStyle = this.color.lerp(
                    this.color2,
                    this.perlin(
                        grads[6],
                        x * this.scale
                        + this.perlin(grads[0], x * scales[0], y * scales[0]) * 0.5
                        + this.perlin(grads[1], x * scales[1], y * scales[1]) * 0.25
                        + this.perlin(grads[2], x * scales[2], y * scales[2]) * 0.25,
                        y * this.scale
                        + this.perlin(grads[3], x * scales[0], y * scales[0]) * 0.5
                        + this.perlin(grads[4], x * scales[1], y * scales[1]) * 0.25
                        + this.perlin(grads[5], x * scales[2], y * scales[2]) * 0.25
                    ) / 2 + 0.5
                ).toCss()
                tex.ctx.fillRect(x, y, 1, 1);
            }
        }
        return tex.image
    }

}

class BarkTextureGenerator extends PerlinTextureGenerator {

    constructor(width: number, height: number, color1: RgbaColorSource, color2: RgbaColorSource, scale: number = 1) {
        super(width, height, color1, color2, scale)
    }

    generateImage(): CanvasImageSource {
        let tex = new PreRenderedImage(this.width, this.height)
        let scales = [
            this.scale,
            this.scale * 2,
            this.scale * 4,
            this.scale * 6
        ]
        let grads = [
            new PerlinGradient(this.width * scales[0], this.height * scales[0]),
            new PerlinGradient(this.width * scales[1], this.height * scales[1]),
            new PerlinGradient(this.width * scales[2], this.height * scales[2]),
            new PerlinGradient(this.width * scales[3], this.height * scales[3])
        ]
        function granulate(value: number, steps: number) {
            return Math.floor(value * steps) / steps + 1 / steps / 2
        }
        let f = 4, a = 2, m = this.scale * Math.PI / 2
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                tex.ctx.fillStyle = this.color.lerp(
                    this.color2,
                    (
                        granulate(
                            Math.sin(
                                f * (
                                    x * m +
                                    a * (
                                        this.perlin(grads[0], x * scales[0], y * scales[0]) * 0.5
                                        + this.perlin(grads[1], x * scales[1], y * scales[1]) * 0.25
                                        + this.perlin(grads[2], x * scales[2], y * scales[2]) * 0.25
                                    )
                                )
                            ),
                            2
                        ) +
                        granulate(this.perlin(grads[3], x * scales[3], y * scales[3]), 5)
                    ) / 4 + 0.5
                ).toCss()
                tex.ctx.fillRect(x, y, 1, 1);
            }
        }
        return tex.image
    }

}

class CirclesTextureGenerator extends PerlinTextureGenerator {

    private ringCount: number
    private background: RgbaColorSource

    constructor(width: number, height: number, color1: RgbaColorSource, color2: RgbaColorSource, background: RgbaColorSource|null, scale: number = 1, ringCount: number = Infinity) {
        super(width, height, color1, color2, scale)
        this.ringCount = ringCount
        this.background = background !== null ? background : RgbaColorSource.transparent
    }

    generateImage(): CanvasImageSource {
        let tex = new PreRenderedImage(this.width, this.height)
        let scale = this.scale * 2
        let grads = [
            new PerlinGradient(this.width * scale, this.height * scale),
            new PerlinGradient(this.width * scale, this.height * scale)
        ]
        let cx = this.width * this.scale / 2, cy = this.height * this.scale / 2
        let ringCountL = this.ringCount - 0.25, background = this.background.toCss()
        let _x: number, _y: number, d: number, c: RgbaColorSource
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                _x = x * this.scale + this.perlin(grads[0], x * scale, y * scale) * 0.5 - cx
                _y = y * this.scale + this.perlin(grads[1], x * scale, y * scale) * 0.5 - cy
                d = Math.sqrt(_x * _x + _y * _y)
                if (d > this.ringCount) {
                    tex.ctx.fillStyle = background
                } else {
                    c = this.color.lerp(
                        this.color2,
                        Utils.interpolateSmooth(0, 1, 1 - Math.abs(1 - d % 1 * 2))
                    )
                    if (d > ringCountL) {
                        tex.ctx.fillStyle = c.lerp(
                            this.background,
                            Utils.interpolateSmooth(0, 1, (d - ringCountL) * 4)
                        ).toCss()
                    } else {
                        tex.ctx.fillStyle = c.toCss()
                    }
                }
                tex.ctx.fillRect(x, y, 1, 1);
            }
        }
        return tex.image
    }

}

class CamouflageTextureGenerator extends PerlinTextureGenerator {

    constructor(width: number, height: number, color1: RgbaColorSource, color2: RgbaColorSource, scale: number = 1) {
        super(width, height, color1, color2, scale)
    }

    generateImage(): CanvasImageSource {
        let tex = new PreRenderedImage(this.width, this.height)
        let scales = [
            this.scale,
            this.scale * 2,
            this.scale * 4
        ]
        let grads = [
            new PerlinGradient(this.width * scales[0], this.height * scales[0]),
            new PerlinGradient(this.width * scales[1], this.height * scales[1]),
            new PerlinGradient(this.width * scales[2], this.height * scales[2]),
            new PerlinGradient(this.width * scales[0], this.height * scales[0]),
            new PerlinGradient(this.width * scales[1], this.height * scales[1]),
            new PerlinGradient(this.width * scales[2], this.height * scales[2]),
            new PerlinGradient(this.width * scales[0], this.height * scales[0]),
            new PerlinGradient(this.width * scales[1], this.height * scales[1]),
            new PerlinGradient(this.width * scales[2], this.height * scales[2])
        ]
        function granulate(value: number, steps: number) {
            return Math.floor(value * steps) / steps + 1 / steps / 2
        }
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                let _x = x * this.scale
                    + this.perlin(grads[0], x * scales[0], y * scales[0]) * 1.5
                    + this.perlin(grads[1], x * scales[1], y * scales[1]) * 0.75
                    + this.perlin(grads[2], x * scales[2], y * scales[2]) * 0.75
                let _y = y * this.scale
                    + this.perlin(grads[3], x * scales[0], y * scales[0]) * 1.5
                    + this.perlin(grads[4], x * scales[1], y * scales[1]) * 0.75
                    + this.perlin(grads[5], x * scales[2], y * scales[2]) * 0.75
                tex.ctx.fillStyle = this.color.lerp(
                    this.color2,
                    (
                        granulate(this.perlin(grads[6], _x, _y), 4) * 0.7 +
                        granulate(this.perlin(grads[7], _x * 2, _y * 2), 5) * 0.2 +
                        granulate(this.perlin(grads[8], _x * 4, _y * 4), 6) * 0.1
                    ) / 2 + 0.5
                ).toCss()
                tex.ctx.fillRect(x, y, 1, 1);
            }
        }
        return tex.image
    }

}
