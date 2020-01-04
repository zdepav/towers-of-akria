class Utils {

    static hex = "0123456789abcdef"

    static sign(value: number): number {
        return value < 0 ? -1 : value > 0 ? 1 : 0
    }

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

    // steps ~ number of values between 0 and 1
    static granulate(value: number, steps: number) {
        return Math.floor(value * steps) / steps + 1 / steps / 2
    }

    static euclideanDistance(dx: number, dy: number): number {
        return Math.sqrt(dx * dx + dy * dy)
    }

    static manhattanDistance(dx: number, dy: number): number {
        return Math.abs(dx) + Math.abs(dy)
    }

    static chebyshevDistance(dx: number, dy: number): number {
        return Math.max(Math.abs(dx), Math.abs(dy))
    }

    static minkowskiDistance(dx: number, dy: number): number {
        let d = Math.sqrt(Math.abs(dx)) + Math.sqrt(Math.abs(dy))
        return d * d
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

    static ld(distance: number, direction: number, startX: number = 0, startY: number = 0): Vec2 {
        return new Vec2(
            startX + distance * Math.cos(direction),
            startY + distance * Math.sin(direction)
        )
    }

    static rotatePoint(x: number, y: number, originX: number, originY: number, angle: number): Vec2 {
        x -= originX
        y -= originY
        let c = Math.cos(angle), s = Math.sin(angle)
        return new Vec2(x * c - y * s + originX, x * s + y * c + originY)
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

    static isString(obj: any): boolean {
        return typeof obj === 'string' || obj instanceof String
    }

    static getImageFromCache(id: string): Promise<CanvasImageSource> {
        return new Promise<CanvasImageSource>((resolve, reject) => {
            let data = localStorage.getItem(id)
            if (data) {
                let img = new Image()
                img.onload = () => {
                    console.log(`Restored ${id} from cache`)
                    resolve(img)
                }
                img.src = "data:image/png;base64," + data
            } else reject()
        })
    }

}

enum MouseButton {
    Left,
    Middle,
    Right,
    Back,
    Forward
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

    constructor(paths?: RenderablePath[]) {
        this.paths = paths === undefined ? [] : paths
    }

    push(path: RenderablePath) {
        this.paths.push(path)
    }

    pushNew(path: Path2D, fill: string | CanvasPattern | CanvasGradient | null) {
        if (fill === null) {
            return
        }
        this.paths.push(new RenderablePath(path, fill))
    }

    render(ctx: CanvasRenderingContext2D) {
        for (let i = 0; i < this.paths.length; ++i) {
            this.paths[i].render(ctx)
        }
    }

    pushPolygon(points: number[], fill: string | CanvasPattern | CanvasGradient | null, originX: number = 0, originY: number = 0) {
        if (fill === null || points.length % 2 !== 0 || points.length < 6) {
            return
        }
        let path = new Path2D()
        path.moveTo(originX + points[0], originY + points[1])
        for (let i = 2; i < points.length; i += 2) {
            path.lineTo(originX + points[i], originY + points[i + 1])
        }
        path.closePath()
        this.paths.push(new RenderablePath(path, fill))
    }

}

class PreRenderedImage {

    image: CanvasImageSource
    ctx: CanvasRenderingContext2D

    constructor(width: number, height: number) {
        let canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D
        this.image = canvas
    }

    saveImage(fileName: string) {
        let a = document.createElement("a")
        a.setAttribute("download", fileName + ".png")
        a.setAttribute(
            "href",
            (this.image as HTMLCanvasElement)
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream")
        );
        a.setAttribute("target", "_blank")
        a.click()
    }

    cacheImage(id: string) {
        if (Game.saveImages) {
            let a = document.createElement("a")
            a.setAttribute("download", id + ".png")
            a.setAttribute(
                "href",
                (this.image as HTMLCanvasElement)
                    .toDataURL("image/png")
                    .replace("image/png", "image/octet-stream")
            );
            a.setAttribute("target", "_blank")
            a.click()

            let element = document.createElement('a')
            element.setAttribute('download', id + ".txt")
            element.setAttribute('href', 'data:text/octet-stream;charset=utf-8,' + encodeURIComponent(this.toBase64()))
            element.click()
        }
        //localStorage.setItem(id, this.toBase64())
    }

    toBase64() {
        return (this.image as HTMLCanvasElement)
            .toDataURL("image/png")
            .replace(/^data:image\/png;base64,/, "")
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
            this.sum -= this.queue.shift() as number
        }
    }

    getFps() {
        return this.queue.length > 0 ? this.sum / this.queue.length : NaN
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

    static zero: Vec2

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

    addu(x: number, y: number): Vec2 {
        return new Vec2(this.x + x, this.y + y)
    }

    sub(v: Vec2): Vec2 {
        return new Vec2(this.x - v.x, this.y - v.y)
    }

    subu(x: number, y: number): Vec2 {
        return new Vec2(this.x - x, this.y - y)
    }

    dot(v: Vec2): number {
        return this.x * v.x + this.y * v.y
    }

    dotu(x: number, y: number): number {
        return this.x * x + this.y * y
    }

    mul(f: number): Vec2 {
        return new Vec2(this.x * f, this.y * f)
    }

    angleTo(v: Vec2) {
        return Utils.getAngle(this.x, this.y, v.x, v.y)
    }

    length(): number {
        if (this.len === null) {
            this.len = Math.sqrt(this.x * this.x + this.y * this.y)
        }
        return this.len
    }

    normalize(): Vec2 {
        let m = 1 / this.length()
        return new Vec2(this.x * m, this.y * m)
    }

    isZero(): boolean {
        return this.x === 0 && this.y === 0
    }

    equals(v: Vec2): boolean {
        return this.x === v.x && this.y === v.y
    }

    toString(): string {
        return `${this.x};${this.y}`
    }

    static randUnit(): Vec2 {
        let a = Angle.rand()
        return new Vec2(Utils.ldx(1, a), Utils.ldy(1, a))
    }

    static randUnit3d(): Vec2 {
        let a = Angle.rand(), a2 = Angle.rand()
        let len = Utils.ldx(1, a2)
        return new Vec2(Utils.ldx(len, a), Utils.ldy(len, a))
    }

    static init() {
        Vec2.zero = new Vec2(0, 0)
    }

}

Vec2.init()

class DijkstraNode {

    pos: Vec2
    previous: DijkstraNode | null
    distance: number

    constructor(x: number, y: number, previous?: DijkstraNode) {
        if (previous === undefined) {
            this.previous = null
            this.distance = 0
        } else {
            this.previous = previous
            this.distance = previous.distance + 1
        }
        this.pos = new Vec2(x, y)
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

class Curve {

    static linear(x: number) { return x }

    static arc(x: number) { return Math.sqrt(x * (2 - x)) }

    static invArc(x: number) { return 1 - Math.sqrt(1 - x * x) }

    static sqr(x: number) { return x * x }

    static sqrt(x: number) { return Math.sqrt(x) }

    static sin(x: number) { return (1 - Math.cos(x * Math.PI)) * 0.5 }

}
