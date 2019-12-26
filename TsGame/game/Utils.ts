class Utils {

    static hex = "0123456789abcdef"

    static clamp(value: number, min: number, max: number): number {
        return value > max ? max : value < min ? min : value
    }

    static byteToHex(byte: number): string {
        byte = Utils.clamp(byte, 0, 255)
        return Utils.hex[Math.floor(byte / 16)] + Utils.hex[Math.floor(byte % 16)]
    }

    /**
     * @param min min value (inclusive)
     * @param max max value (exclusive)
     */
    static randInt(min: number, max: number) {
        if (max <= min) {
            return min
        }
        return Math.floor(Math.random() * (max - min) + min)
    }

    /**
     * @param min min value (inclusive)
     * @param max max value (exclusive)
     */
    static rand(min: number, max: number) {
        if (max <= min) {
            return min
        }
        return Math.random() * (max - min) + min
    }

}

class RenderablePath {

    path: Path2D
    fill: string | CanvasPattern | CanvasGradient

    constructor(path: Path2D, fill: string | CanvasPattern | CanvasGradient) {
        this.path = path
        this.fill = fill
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.fill
        ctx.fill(this.path)
    }

}

class RenderablePathSet {

    paths: RenderablePath[]

    constructor(paths: RenderablePath[] = null) {
        this.paths = paths == null ? [] : paths
    }

    push(path: RenderablePath) {
        this.paths.push(path)
    }

    pushNew(path: Path2D, fill: string | CanvasPattern | CanvasGradient) {
        this.paths.push(new RenderablePath(path, fill))
    }

    render(ctx: CanvasRenderingContext2D) {
        for (let i = 0; i < this.paths.length; ++i) {
            this.paths[i].render(ctx)
        }
    }

}

class PreRenderedImage {

    image: CanvasImageSource
    ctx: CanvasRenderingContext2D

    constructor(width: number, height: number) {
        let canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        this.ctx = canvas.getContext("2d")
        this.image = canvas
    }

    saveImage(fileName: string) {
        let a = document.createElement("a")
        a.setAttribute("download", fileName + ".png");
        a.setAttribute(
            "href",
            (this.image as HTMLCanvasElement)
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream")
        );
        a.setAttribute("target", "_blank");
        a.click()
    }

}

class PerformanceMeter {

    private queue: number[]
    private sum: number

    constructor() {
        this.queue = []
        this.sum = 0
    }

    add(fps: number) {
        this.queue.push(fps)
        this.sum += fps
        if (this.queue.length > 100) {
            this.sum -= this.queue.shift()
        }
    }

    getFps() {
        return this.queue.length > 0 ? this.sum / this.queue.length : NaN
    }

}

class Coords {

    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

}

class Rect {

    x: number
    y: number
    w: number
    h: number

    constructor(x: number, y: number, w: number, h: number) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }

}

class DijkstraNode {

    pos: Coords
    previous: DijkstraNode
    distance: number

    constructor(x: number, y: number, previous: DijkstraNode) {
        this.previous = previous
        this.distance = previous == null ? 0 : previous.distance + 1
        this.pos = new Coords(x, y)
    }

}

class Angles {

    static deg10: number
    static deg15: number
    static deg18: number
    static deg20: number
    static deg30: number
    static deg36: number
    static deg45: number
    static deg60: number
    static deg72: number
    static deg90: number
    static deg120: number
    static deg135: number
    static deg150: number
    static deg180: number
    static deg210: number
    static deg225: number
    static deg240: number
    static deg270: number
    static deg300: number
    static deg315: number
    static deg330: number
    static deg360: number

    static init() {
        Angles.deg10 = Math.PI / 18
        Angles.deg15 = Math.PI / 12
        Angles.deg18 = Math.PI / 10
        Angles.deg20 = Math.PI / 9
        Angles.deg30 = Math.PI / 6
        Angles.deg36 = Math.PI / 5
        Angles.deg45 = Math.PI / 4
        Angles.deg60 = Math.PI / 3
        Angles.deg72 = Math.PI / 2.5
        Angles.deg90 = Math.PI / 2
        Angles.deg120 = Math.PI * 2 / 3
        Angles.deg135 = Math.PI * 0.75
        Angles.deg150 = Math.PI * 5 / 6
        Angles.deg180 = Math.PI
        Angles.deg210 = Math.PI * 7 / 6
        Angles.deg225 = Math.PI * 1.25
        Angles.deg240 = Math.PI * 4 / 3
        Angles.deg270 = Math.PI * 1.5
        Angles.deg300 = Math.PI * 5 / 3
        Angles.deg315 = Math.PI * 1.75
        Angles.deg330 = Math.PI * 11 / 6
        Angles.deg360 = Math.PI * 2
    }

}

class ColorRgb {

    r: number
    g: number
    b: number

    constructor(r: number, g: number, b: number) {
        this.r = Utils.clamp(r, 0, 255)
        this.g = Utils.clamp(g, 0, 255)
        this.b = Utils.clamp(b, 0, 255)
    }

    toCss(): string {
        const hex = "0123456789abcdef"
        return "#"
            + Utils.byteToHex(this.r)
            + Utils.byteToHex(this.g)
            + Utils.byteToHex(this.b)
    }

    multiplyFloat(ammount: number): ColorRgb {
        return new ColorRgb(this.r * ammount, this.g * ammount, this.b * ammount)
    }

    multiply(c: ColorRgb): ColorRgb {
        return new ColorRgb(this.r * c.r, this.g * c.g, this.b * c.b)
    }

    add(c: ColorRgb): ColorRgb {
        return new ColorRgb(this.r + c.r, this.g + c.g, this.b + c.b)
    }

    mix(c: ColorRgb, ammount: number): ColorRgb {
        if (ammount >= 1) {
            return c
        } else if (ammount <= 0) {
            return this
        } else {
            let a2 = 1 - ammount
            return new ColorRgb(
                this.r * a2 + c.r * ammount,
                this.g * a2 + c.g * ammount,
                this.b * a2 + c.b * ammount
            )
        }
    }

    addNoise(intensity: number, saturation: number, coverage: number): ColorRgb {
        if (Math.random() < coverage) {
            intensity *= 255
            if (saturation <= 0) {
                let n = Utils.rand(-intensity, intensity)
                return new ColorRgb(this.r + n, this.g + n, this.b + n)
            } else if (saturation >= 1) {
                return new ColorRgb(
                    this.r + Utils.rand(-intensity, intensity),
                    this.g + Utils.rand(-intensity, intensity),
                    this.b + Utils.rand(-intensity, intensity)
                )
            } else {
                let s2 = 1 - saturation
                let rn = Utils.rand(-intensity, intensity)
                let gn = saturation * Utils.rand(-intensity, intensity) + s2 * rn
                let bn = saturation * Utils.rand(-intensity, intensity) + s2 * rn
                return new ColorRgb(this.r + rn, this.g + gn, this.b + bn)
            }
        } else {
            return this
        }
    }

}
