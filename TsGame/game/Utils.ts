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

    static lerp(f1: number, f2: number, ammount: number): number {
        if (ammount <= 0) {
            return f1
        } else if (ammount >= 1) {
            return f2
        } else {
            return f1 + ammount * (f2 - f1)
        }
    }

    static lerpInt(f1: number, f2: number, ammount: number): number {
        if (ammount <= 0) {
            return Math.floor(f1)
        } else if (ammount >= 1) {
            return Math.floor(f2)
        } else {
            return Math.floor((1 - ammount) * Math.floor(f1) + ammount * (Math.floor(f2) + 0.9999))
        }
    }

    static interpolateSmooth(f1: number, f2: number, ammount: number): number {
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

    /**
     * @param steps number of values between 0 and 1
     */
    static granulate(value: number, steps: number): number {
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

    /**
     * @param min min value (inclusive)
     * @param max max value (exclusive)
     */
    static rand(min: number, max: number): number {
        if (max <= min) {
            return min
        }
        return Math.random() * (max - min) + min
    }

    /**
     * @param min min value (inclusive)
     * @param max max value (exclusive)
     */
    static randInt(min: number, max: number): number {
        if (max <= min) {
            return min
        }
        return Math.floor(Math.random() * (max - min) + min)
    }

    static randSign(num: number): number {
        return (Math.floor(Math.random() * 2) * 2 - 1) * num
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

    render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.fill
        ctx.fill(this.path)
    }

}

class RenderablePathSet {

    paths: RenderablePath[]

    constructor(paths?: RenderablePath[]) {
        this.paths = paths === undefined ? [] : paths
    }

    push(path: RenderablePath): void {
        this.paths.push(path)
    }

    pushNew(path: Path2D, fill: string | CanvasPattern | CanvasGradient | null): void {
        if (fill === null) {
            return
        }
        this.paths.push(new RenderablePath(path, fill))
    }

    pushPolygon(points: number[], fill: string | CanvasPattern | CanvasGradient | null, originX: number = 0, originY: number = 0): void {
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

    render(ctx: CanvasRenderingContext2D): void {
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
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D
        this.image = canvas
    }

    saveImage(fileName: string): void {
        let a = document.createElement("a")
        a.setAttribute("download", fileName + ".png")
        a.setAttribute(
            "href",
            (this.image as HTMLCanvasElement)
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream")
        )
        a.setAttribute("target", "_blank")
        a.click()
    }

    cacheImage(id: string): void {
        if (Game.saveImages) {
            let a = document.createElement("a")
            a.setAttribute("download", id + ".png")
            a.setAttribute(
                "href",
                (this.image as HTMLCanvasElement)
                    .toDataURL("image/png")
                    .replace("image/png", "image/octet-stream")
            )
            a.setAttribute("target", "_blank")
            a.click()

            let element = document.createElement('a')
            element.setAttribute('download', id + ".txt")
            element.setAttribute('href', 'data:text/octet-stream;charset=utf-8,' + encodeURIComponent(this.toBase64()))
            element.click()
        }
        //localStorage.setItem(id, this.toBase64())
    }

    toBase64(): string {
        return (this.image as HTMLCanvasElement)
            .toDataURL("image/png")
            .replace(/^data:image\/png;base64,/, "")
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
