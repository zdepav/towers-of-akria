class Utils {

    static hex = "0123456789abcdef"

    /**
     * @param min min value (inclusive)
     * @param max max value (inclusive)
     */
    static clamp(value: number, min: number, max: number): number {
        return value > max ? max : value < min ? min : value
    }

    /**
     * @param min min value (inclusive)
     * @param max max value (exclusive)
     */
    static wrap(value: number, min: number, max: number): number {
        value -= min
        let range = max - min
        if (value < 0) {
            value = range - (-value) % range
        }
        return value % range + min
    }

    static lerp(f1: number, f2: number, ammount: number) {
        if (ammount <= 0) {
            return f1
        } else if (ammount >= 1) {
            return f2
        } else {
            return f1 + ammount * (f2 - f1)
        }
    }

    static lerpInt(f1: number, f2: number, ammount: number) {
        if (ammount <= 0) {
            return Math.floor(f1)
        } else if (ammount >= 1) {
            return Math.floor(f2)
        } else {
            return Math.floor((1 - ammount) * Math.floor(f1) + ammount * (Math.floor(f2) + 0.9999))
        }
    }

    static interpolateSmooth(f1: number, f2: number, ammount: number): any {
        if (ammount <= 0) {
            return f1
        } else if (ammount >= 1) {
            return f2
        } else {
            return f1 + (1 - Math.cos(ammount * Math.PI)) * 0.5 * (f2 - f1)
        }
    }

    static flatten(width: number, x: number, y: number): number {
        return width * y + x
    }

    static byteToHex(byte: number): string {
        byte = Utils.clamp(byte, 0, 255)
        return Utils.hex[Math.floor(byte / 16)] + Utils.hex[Math.floor(byte % 16)]
    }

    static ldx(distance: number, direction: number, startX: number = 0): number {
        return startX + distance * Math.cos(direction)
    }

    static ldy(distance: number, direction: number, startY: number = 0): number {
        return startY + distance * Math.sin(direction)
    }

    static ld(distance: number, direction: number, startX: number = 0, startY: number = 0): Coords {
        return new Coords(
            startX + distance * Math.cos(direction),
            startY + distance * Math.sin(direction)
        )
    }

    static getAngle(x1: number, y1: number, x2: number, y2: number): number {
        return Math.atan2(y2 - y1, x2 - x1)
    }

    static angleBetween(angle1: number, angle2: number) {
        angle1 %= Angle.deg360
        angle2 %= Angle.deg360
        let diff = Math.abs(angle2 - angle1)
        if (diff <= Angle.deg180) {
            return (angle1 + angle2) / 2
        } else {
            return ((angle1 + angle2) / 2 + Angle.deg180) % Angle.deg360
        }
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

class Vec2 {

    x: number
    y: number
    private len: number | null

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.len = null
    }

    add(v: Vec2): Vec2 {
        return new Vec2(this.x + v.x, this.y + v.y)
    }

    uadd(x: number, y: number): Vec2 {
        return new Vec2(this.x + x, this.y + y)
    }

    sub(v: Vec2): Vec2 {
        return new Vec2(this.x - v.x, this.y - v.y)
    }

    usub(x: number, y: number): Vec2 {
        return new Vec2(this.x - x, this.y - y)
    }

    dot(v: Vec2): number {
        return this.x * v.x + this.y * v.y
    }

    udot(x: number, y: number): number {
        return this.x * x + this.y * y
    }

    mul(f: number): Vec2 {
        return new Vec2(this.x * f, this.y * f)
    }

    length(): number {
        if (this.len === null) {
            this.len = Math.sqrt(this.x * this.x + this.y * this.y)
        }
        return this.len
    }

    normalize(): Vec2 {
        let l = 1 / this.length()
        return new Vec2(this.x * l, this.y * l)
    }

    static randUnit(): Vec2 {
        let a = Angle.rand()
        return new Vec2(Utils.ldx(1, a), Utils.ldy(1, a))
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

class Angle {

    private static rad2deg: number

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

    static deg(radians: number): number {
        return radians * Angle.rad2deg
    }

    static rand(): number {
        return Math.random() * Angle.deg360
    }

    static init() {
        Angle.rad2deg = 180 / Math.PI
        Angle.deg10 = Math.PI / 18
        Angle.deg15 = Math.PI / 12
        Angle.deg18 = Math.PI / 10
        Angle.deg20 = Math.PI / 9
        Angle.deg30 = Math.PI / 6
        Angle.deg36 = Math.PI / 5
        Angle.deg45 = Math.PI / 4
        Angle.deg60 = Math.PI / 3
        Angle.deg72 = Math.PI / 2.5
        Angle.deg90 = Math.PI / 2
        Angle.deg120 = Math.PI * 2 / 3
        Angle.deg135 = Math.PI * 0.75
        Angle.deg150 = Math.PI * 5 / 6
        Angle.deg180 = Math.PI
        Angle.deg210 = Math.PI * 7 / 6
        Angle.deg225 = Math.PI * 1.25
        Angle.deg240 = Math.PI * 4 / 3
        Angle.deg270 = Math.PI * 1.5
        Angle.deg300 = Math.PI * 5 / 3
        Angle.deg315 = Math.PI * 1.75
        Angle.deg330 = Math.PI * 11 / 6
        Angle.deg360 = Math.PI * 2
    }

}

Angle.init()

abstract class ColorSource {

    protected width: number
    protected height: number

    constructor(width: number, height: number) {
        this.width = width
        this.height = height
    }

    getColor(x: number, y: number): RgbaColorSource {
        return this._getColor(
            Utils.wrap(x, 0, this.width),
            Utils.wrap(y, 0, this.height)
        )
    }

    protected abstract _getColor(x: number, y: number): RgbaColorSource;

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

}

class CanvasColorSource extends ColorSource {

    private ctx: CanvasRenderingContext2D

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D | null) {
        super(canvas.width, canvas.height)
        this.ctx = ctx === null ? canvas.getContext("2d") : ctx
    }

    protected _getColor(x: number, y: number): RgbaColorSource {
        var data = this.ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
        return new RgbaColorSource(data[0], data[1], data[2], data[3]);
    }

    generateImage(): CanvasImageSource {
        let tex = new PreRenderedImage(this.width, this.height)
        tex.ctx.putImageData(this.ctx.getImageData(0, 0, this.width, this.height), 0, 0)
        return tex.image
    }

}

class RgbaColorSource extends ColorSource {

    static transparent: RgbaColorSource
    static black: RgbaColorSource
    static red: RgbaColorSource
    static green: RgbaColorSource
    static blue: RgbaColorSource
    static yellow: RgbaColorSource
    static cyan: RgbaColorSource
    static magenta: RgbaColorSource
    static white: RgbaColorSource

    r: number
    g: number
    b: number
    a: number

    constructor(r: number, g: number, b: number, a: number = 255, width: number = 1, height: number = 1) {
        super(Math.max(1, Math.floor(width)), Math.max(1, Math.floor(height)))
        this.r = Math.floor(Utils.clamp(r, 0, 255))
        this.g = Math.floor(Utils.clamp(g, 0, 255))
        this.b = Math.floor(Utils.clamp(b, 0, 255))
        this.a = Math.floor(Utils.clamp(a, 0, 255))
    }

    static fromHex(color: string): RgbaColorSource {
        if (/^#[0-9a-f]{3}[0-9a-f]?$/i.test(color)) {
            let a = color.length > 4 ? parseInt(color[4], 16) * 17 : 255
            return new RgbaColorSource(
                parseInt(color[1], 16) * 17,
                parseInt(color[2], 16) * 17,
                parseInt(color[3], 16) * 17,
                a
            )
        } else if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(color)) {
            let a = color.length > 7 ? parseInt(color.substr(7, 2), 16) : 255
            return new RgbaColorSource(
                parseInt(color.substr(1, 2), 16),
                parseInt(color.substr(3, 2), 16),
                parseInt(color.substr(5, 2), 16),
                a
            )
        } else return null
    }

    private pr(): number { return this.r * this.a / 255 }

    private pg(): number { return this.g * this.a / 255 }

    private pb(): number { return this.b * this.a / 255 }

    private pa(): number { return this.a * this.a / 255 }

    toCss(): string {
        return "#"
            + Utils.byteToHex(this.r)
            + Utils.byteToHex(this.g)
            + Utils.byteToHex(this.b)
            + Utils.byteToHex(this.a)
    }

    multiplyFloat(ammount: number, multiplyAlpha: boolean = false): RgbaColorSource {
        return new RgbaColorSource(
            this.r * ammount,
            this.g * ammount,
            this.b * ammount,
            multiplyAlpha ? this.a * ammount : this.a
        )
    }

    multiply(c: RgbaColorSource): RgbaColorSource {
        return new RgbaColorSource(this.r * c.r, this.g * c.g, this.b * c.b, this.a * c.a)
    }

    add(c: RgbaColorSource): RgbaColorSource {
        return new RgbaColorSource(this.r + c.pr(), this.g + c.pg(), this.b + c.pb(), this.a + c.pa())
    }

    withRed(r: number): RgbaColorSource {
        return new RgbaColorSource(r, this.g, this.b, this.a)
    }

    withGreen(g: number): RgbaColorSource {
        return new RgbaColorSource(this.r, g, this.b, this.a)
    }

    withBlue(b: number): RgbaColorSource {
        return new RgbaColorSource(this.r, this.g, b, this.a)
    }

    withAlpha(a: number): RgbaColorSource {
        return new RgbaColorSource(this.r, this.g, this.b, a)
    }

    lerp(c: RgbaColorSource, ammount: number): RgbaColorSource {
        if (ammount >= 1) {
            return c
        } else if (ammount <= 0) {
            return this
        } else {
            let a2 = 1 - ammount
            return new RgbaColorSource(
                this.r * a2 + c.r * ammount,
                this.g * a2 + c.g * ammount,
                this.b * a2 + c.b * ammount,
                this.a * a2 + c.a * ammount
            )
        }
    }

    addNoise(intensity: number, saturation: number, coverage: number): RgbaColorSource {
        if (Math.random() < coverage) {
            intensity *= 255
            if (saturation <= 0) {
                let n = Utils.rand(-intensity, intensity)
                return new RgbaColorSource(this.r + n, this.g + n, this.b + n, this.a)
            } else if (saturation >= 1) {
                return new RgbaColorSource(
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
                return new RgbaColorSource(this.r + rn, this.g + gn, this.b + bn, this.a)
            }
        } else {
            return this
        }
    }

    protected _getColor(x: number, y: number): RgbaColorSource { return this }

    generateImage(): CanvasImageSource {
        let tex = new PreRenderedImage(this.width, this.height)
        tex.ctx.fillStyle = this.toCss()
        tex.ctx.fillRect(0, 0, this.width, this.height)
        return tex.image
    }

    static init() {
        RgbaColorSource.transparent = new RgbaColorSource(0, 0, 0, 0)
        RgbaColorSource.black = new RgbaColorSource(0, 0, 0)
        RgbaColorSource.red = new RgbaColorSource(255, 0, 0)
        RgbaColorSource.green = new RgbaColorSource(0, 255, 0)
        RgbaColorSource.blue = new RgbaColorSource(0, 0, 255)
        RgbaColorSource.yellow = new RgbaColorSource(255, 255, 0)
        RgbaColorSource.cyan = new RgbaColorSource(0, 255, 255)
        RgbaColorSource.magenta = new RgbaColorSource(255, 0, 255)
        RgbaColorSource.white = new RgbaColorSource(255, 255, 255)
    }

}

RgbaColorSource.init()
