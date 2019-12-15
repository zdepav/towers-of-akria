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

class GameItem {

    game: Game

    constructor(game: Game) {
        this.game = game
    }

    step(time: number) { }

    render(ctx: CanvasRenderingContext2D, preRender: boolean) { }

}

class RenderablePath {

    path: Path2D
    fill: string | CanvasPattern | CanvasGradient

    constructor(path: Path2D, fill: string | CanvasPattern | CanvasGradient) {
        this.path = path
        this.fill = fill
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.fill;
        ctx.fill(this.path)
    }

}

class RenderablePathSet {

    _paths: RenderablePath[]

    constructor(paths: RenderablePath[] = null) {
        this._paths = paths == null ? [] : paths
    }

    push(path: RenderablePath) {
        this._paths.push(path)
    }

    pushNew(path: Path2D, fill: string | CanvasPattern | CanvasGradient) {
        this._paths.push(new RenderablePath(path, fill))
    }

    render(ctx: CanvasRenderingContext2D) {
        for (let i = 0; i < this._paths.length; ++i) {
            this._paths[i].render(ctx)
        }
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

class PerformanceMeter {

    _queue: number[]
    _sum: number

    constructor() {
        this._queue = []
        this._sum = 0
    }

    add(fps: number) {
        this._queue.push(fps)
        this._sum += fps
        if (this._queue.length > 100) {
            this._sum -= this._queue.shift()
        }
    }

    getFps() {
        return this._queue.length > 0 ? this._sum / this._queue.length : NaN
    }

}

class PreRenderedImage {

    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    img: ImageData

    constructor(width: number, height: number) {
        this.canvas = document.createElement("canvas")
        this.canvas.width = width
        this.canvas.height = height
        this.ctx = this.canvas.getContext("2d")
    }



}

class Angles {

    static deg30: number
    static deg45: number
    static deg60: number
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
        Angles.deg30 = Math.PI / 6
        Angles.deg45 = Math.PI / 4
        Angles.deg60 = Math.PI / 3
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
