class Coords {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Rect {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}
class GameItem {
    constructor(game) {
        this.game = game;
    }
    step(time) { }
    render(ctx, preRender) { }
}
class RenderablePath {
    constructor(path, fill) {
        this.path = path;
        this.fill = fill;
    }
    render(ctx) {
        ctx.fillStyle = this.fill;
        ctx.fill(this.path);
    }
}
class RenderablePathSet {
    constructor(paths = null) {
        this.paths = paths == null ? [] : paths;
    }
    push(path) {
        this.paths.push(path);
    }
    pushNew(path, fill) {
        this.paths.push(new RenderablePath(path, fill));
    }
    render(ctx) {
        for (let i = 0; i < this.paths.length; ++i) {
            this.paths[i].render(ctx);
        }
    }
}
class DijkstraNode {
    constructor(x, y, previous) {
        this.previous = previous;
        this.distance = previous == null ? 0 : previous.distance + 1;
        this.pos = new Coords(x, y);
    }
}
class PerformanceMeter {
    constructor() {
        this.queue = [];
        this.sum = 0;
    }
    add(fps) {
        this.queue.push(fps);
        this.sum += fps;
        if (this.queue.length > 100) {
            this.sum -= this.queue.shift();
        }
    }
    getFps() {
        return this.queue.length > 0 ? this.sum / this.queue.length : NaN;
    }
}
class PreRenderedImage {
    constructor(width, height) {
        let canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        this.ctx = canvas.getContext("2d");
        this.image = canvas;
    }
}
class Angles {
    static init() {
        Angles.deg30 = Math.PI / 6;
        Angles.deg45 = Math.PI / 4;
        Angles.deg60 = Math.PI / 3;
        Angles.deg90 = Math.PI / 2;
        Angles.deg120 = Math.PI * 2 / 3;
        Angles.deg135 = Math.PI * 0.75;
        Angles.deg150 = Math.PI * 5 / 6;
        Angles.deg180 = Math.PI;
        Angles.deg210 = Math.PI * 7 / 6;
        Angles.deg225 = Math.PI * 1.25;
        Angles.deg240 = Math.PI * 4 / 3;
        Angles.deg270 = Math.PI * 1.5;
        Angles.deg300 = Math.PI * 5 / 3;
        Angles.deg315 = Math.PI * 1.75;
        Angles.deg330 = Math.PI * 11 / 6;
        Angles.deg360 = Math.PI * 2;
    }
}
Angles.init();
//# sourceMappingURL=utils.js.map