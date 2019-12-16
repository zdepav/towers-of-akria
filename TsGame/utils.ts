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

    queue: number[]
    sum: number

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

Angles.init()
