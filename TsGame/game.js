class Utils {
    /**
     * @param min min value (inclusive)
     * @param max max value (inclusive)
     */
    static clamp(value, min, max) {
        return value > max ? max : value < min ? min : value;
    }
    /**
     * @param min min value (inclusive)
     * @param max max value (exclusive)
     */
    static wrap(value, min, max) {
        value -= min;
        let range = max - min;
        if (value < 0) {
            value = range - (-value) % range;
        }
        return value % range + min;
    }
    static lerp(f1, f2, ammount) {
        if (ammount <= 0) {
            return f1;
        }
        else if (ammount >= 1) {
            return f2;
        }
        else {
            return f1 + ammount * (f2 - f1);
        }
    }
    static lerpInt(f1, f2, ammount) {
        if (ammount <= 0) {
            return Math.floor(f1);
        }
        else if (ammount >= 1) {
            return Math.floor(f2);
        }
        else {
            return Math.floor((1 - ammount) * Math.floor(f1) + ammount * (Math.floor(f2) + 0.9999));
        }
    }
    static interpolateSmooth(f1, f2, ammount) {
        if (ammount <= 0) {
            return f1;
        }
        else if (ammount >= 1) {
            return f2;
        }
        else {
            return f1 + (1 - Math.cos(ammount * Math.PI)) * 0.5 * (f2 - f1);
        }
    }
    static flatten(width, x, y) {
        return width * y + x;
    }
    static byteToHex(byte) {
        byte = Utils.clamp(byte, 0, 255);
        return Utils.hex[Math.floor(byte / 16)] + Utils.hex[Math.floor(byte % 16)];
    }
    static ldx(distance, direction, startX = 0) {
        return startX + distance * Math.cos(direction);
    }
    static ldy(distance, direction, startY = 0) {
        return startY + distance * Math.sin(direction);
    }
    static ld(distance, direction, startX = 0, startY = 0) {
        return new Coords(startX + distance * Math.cos(direction), startY + distance * Math.sin(direction));
    }
    static getAngle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }
    static angleBetween(angle1, angle2) {
        angle1 %= Angle.deg360;
        angle2 %= Angle.deg360;
        let diff = Math.abs(angle2 - angle1);
        if (diff <= Angle.deg180) {
            return (angle1 + angle2) / 2;
        }
        else {
            return ((angle1 + angle2) / 2 + Angle.deg180) % Angle.deg360;
        }
    }
    /**
     * @param min min value (inclusive)
     * @param max max value (exclusive)
     */
    static rand(min, max) {
        if (max <= min) {
            return min;
        }
        return Math.random() * (max - min) + min;
    }
    /**
     * @param min min value (inclusive)
     * @param max max value (exclusive)
     */
    static randInt(min, max) {
        if (max <= min) {
            return min;
        }
        return Math.floor(Math.random() * (max - min) + min);
    }
}
Utils.hex = "0123456789abcdef";
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
class PreRenderedImage {
    constructor(width, height) {
        let canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        this.ctx = canvas.getContext("2d");
        this.image = canvas;
    }
    saveImage(fileName) {
        let a = document.createElement("a");
        a.setAttribute("download", fileName + ".png");
        a.setAttribute("href", this.image
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream"));
        a.setAttribute("target", "_blank");
        a.click();
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
class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.len = null;
    }
    add(v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }
    uadd(x, y) {
        return new Vec2(this.x + x, this.y + y);
    }
    sub(v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    }
    usub(x, y) {
        return new Vec2(this.x - x, this.y - y);
    }
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    udot(x, y) {
        return this.x * x + this.y * y;
    }
    mul(f) {
        return new Vec2(this.x * f, this.y * f);
    }
    length() {
        if (this.len === null) {
            this.len = Math.sqrt(this.x * this.x + this.y * this.y);
        }
        return this.len;
    }
    normalize() {
        let l = 1 / this.length();
        return new Vec2(this.x * l, this.y * l);
    }
    static randUnit() {
        let a = Angle.rand();
        return new Vec2(Utils.ldx(1, a), Utils.ldy(1, a));
    }
}
class DijkstraNode {
    constructor(x, y, previous) {
        this.previous = previous;
        this.distance = previous == null ? 0 : previous.distance + 1;
        this.pos = new Coords(x, y);
    }
}
class Angle {
    static deg(radians) {
        return radians * Angle.rad2deg;
    }
    static rand() {
        return Math.random() * Angle.deg360;
    }
    static init() {
        Angle.rad2deg = 180 / Math.PI;
        Angle.deg10 = Math.PI / 18;
        Angle.deg15 = Math.PI / 12;
        Angle.deg18 = Math.PI / 10;
        Angle.deg20 = Math.PI / 9;
        Angle.deg30 = Math.PI / 6;
        Angle.deg36 = Math.PI / 5;
        Angle.deg45 = Math.PI / 4;
        Angle.deg60 = Math.PI / 3;
        Angle.deg72 = Math.PI / 2.5;
        Angle.deg90 = Math.PI / 2;
        Angle.deg120 = Math.PI * 2 / 3;
        Angle.deg135 = Math.PI * 0.75;
        Angle.deg150 = Math.PI * 5 / 6;
        Angle.deg180 = Math.PI;
        Angle.deg210 = Math.PI * 7 / 6;
        Angle.deg225 = Math.PI * 1.25;
        Angle.deg240 = Math.PI * 4 / 3;
        Angle.deg270 = Math.PI * 1.5;
        Angle.deg300 = Math.PI * 5 / 3;
        Angle.deg315 = Math.PI * 1.75;
        Angle.deg330 = Math.PI * 11 / 6;
        Angle.deg360 = Math.PI * 2;
    }
}
Angle.init();
class ColorSource {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    getColor(x, y) {
        return this._getColor(Utils.wrap(x, 0, this.width), Utils.wrap(y, 0, this.height));
    }
    generateImage() {
        let tex = new PreRenderedImage(this.width, this.height);
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                tex.ctx.fillStyle = this._getColor(x, y).toCss();
                tex.ctx.fillRect(x, y, 1, 1);
            }
        }
        return tex.image;
    }
}
class CanvasColorSource extends ColorSource {
    constructor(canvas, ctx) {
        super(canvas.width, canvas.height);
        this.ctx = ctx === null ? canvas.getContext("2d") : ctx;
    }
    _getColor(x, y) {
        var data = this.ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
        return new RgbaColorSource(data[0], data[1], data[2], data[3]);
    }
    generateImage() {
        let tex = new PreRenderedImage(this.width, this.height);
        tex.ctx.putImageData(this.ctx.getImageData(0, 0, this.width, this.height), 0, 0);
        return tex.image;
    }
}
class RgbaColorSource extends ColorSource {
    constructor(r, g, b, a = 255, width = 1, height = 1) {
        super(Math.max(1, Math.floor(width)), Math.max(1, Math.floor(height)));
        this.r = Math.floor(Utils.clamp(r, 0, 255));
        this.g = Math.floor(Utils.clamp(g, 0, 255));
        this.b = Math.floor(Utils.clamp(b, 0, 255));
        this.a = Math.floor(Utils.clamp(a, 0, 255));
    }
    static fromHex(color) {
        if (/^#[0-9a-f]{3}[0-9a-f]?$/i.test(color)) {
            let a = color.length > 4 ? parseInt(color[4], 16) * 17 : 255;
            return new RgbaColorSource(parseInt(color[1], 16) * 17, parseInt(color[2], 16) * 17, parseInt(color[3], 16) * 17, a);
        }
        else if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(color)) {
            let a = color.length > 7 ? parseInt(color.substr(7, 2), 16) : 255;
            return new RgbaColorSource(parseInt(color.substr(1, 2), 16), parseInt(color.substr(3, 2), 16), parseInt(color.substr(5, 2), 16), a);
        }
        else
            return null;
    }
    pr() { return this.r * this.a / 255; }
    pg() { return this.g * this.a / 255; }
    pb() { return this.b * this.a / 255; }
    pa() { return this.a * this.a / 255; }
    toCss() {
        return "#"
            + Utils.byteToHex(this.r)
            + Utils.byteToHex(this.g)
            + Utils.byteToHex(this.b)
            + Utils.byteToHex(this.a);
    }
    multiplyFloat(ammount, multiplyAlpha = false) {
        return new RgbaColorSource(this.r * ammount, this.g * ammount, this.b * ammount, multiplyAlpha ? this.a * ammount : this.a);
    }
    multiply(c) {
        return new RgbaColorSource(this.r * c.r, this.g * c.g, this.b * c.b, this.a * c.a);
    }
    add(c) {
        return new RgbaColorSource(this.r + c.pr(), this.g + c.pg(), this.b + c.pb(), this.a + c.pa());
    }
    withRed(r) {
        return new RgbaColorSource(r, this.g, this.b, this.a);
    }
    withGreen(g) {
        return new RgbaColorSource(this.r, g, this.b, this.a);
    }
    withBlue(b) {
        return new RgbaColorSource(this.r, this.g, b, this.a);
    }
    withAlpha(a) {
        return new RgbaColorSource(this.r, this.g, this.b, a);
    }
    lerp(c, ammount) {
        if (ammount >= 1) {
            return c;
        }
        else if (ammount <= 0) {
            return this;
        }
        else {
            let a2 = 1 - ammount;
            return new RgbaColorSource(this.r * a2 + c.r * ammount, this.g * a2 + c.g * ammount, this.b * a2 + c.b * ammount, this.a * a2 + c.a * ammount);
        }
    }
    addNoise(intensity, saturation, coverage) {
        if (Math.random() < coverage) {
            intensity *= 255;
            if (saturation <= 0) {
                let n = Utils.rand(-intensity, intensity);
                return new RgbaColorSource(this.r + n, this.g + n, this.b + n, this.a);
            }
            else if (saturation >= 1) {
                return new RgbaColorSource(this.r + Utils.rand(-intensity, intensity), this.g + Utils.rand(-intensity, intensity), this.b + Utils.rand(-intensity, intensity), this.a);
            }
            else {
                let s2 = 1 - saturation;
                let rn = Utils.rand(-intensity, intensity);
                let gn = saturation * Utils.rand(-intensity, intensity) + s2 * rn;
                let bn = saturation * Utils.rand(-intensity, intensity) + s2 * rn;
                return new RgbaColorSource(this.r + rn, this.g + gn, this.b + bn, this.a);
            }
        }
        else {
            return this;
        }
    }
    _getColor(x, y) { return this; }
    generateImage() {
        let tex = new PreRenderedImage(this.width, this.height);
        tex.ctx.fillStyle = this.toCss();
        tex.ctx.fillRect(0, 0, this.width, this.height);
        return tex.image;
    }
    static init() {
        RgbaColorSource.transparent = new RgbaColorSource(0, 0, 0, 0);
        RgbaColorSource.black = new RgbaColorSource(0, 0, 0);
        RgbaColorSource.red = new RgbaColorSource(255, 0, 0);
        RgbaColorSource.green = new RgbaColorSource(0, 255, 0);
        RgbaColorSource.blue = new RgbaColorSource(0, 0, 255);
        RgbaColorSource.yellow = new RgbaColorSource(255, 255, 0);
        RgbaColorSource.cyan = new RgbaColorSource(0, 255, 255);
        RgbaColorSource.magenta = new RgbaColorSource(255, 0, 255);
        RgbaColorSource.white = new RgbaColorSource(255, 255, 255);
    }
}
RgbaColorSource.init();
/// <reference path='Game.ts'/>
class GameItem {
    constructor(game) {
        this.game = game;
    }
    step(time) { }
    render(ctx, preRender) { }
}
/// <reference path="Utils.ts"/>
class TextureGenerator extends ColorSource {
    constructor(width, height, color) {
        super(width, height);
        this.color = color;
    }
}
var CellularTextureType;
(function (CellularTextureType) {
    CellularTextureType[CellularTextureType["Lava"] = 0] = "Lava";
    CellularTextureType[CellularTextureType["Net"] = 1] = "Net";
    CellularTextureType[CellularTextureType["Balls"] = 2] = "Balls";
})(CellularTextureType || (CellularTextureType = {}));
// based on https://blackpawn.com/texts/cellular/default.html
class CellularTextureGenerator extends TextureGenerator {
    // density n => 1 point per n pixels
    constructor(width, height, density, color1, color2, type) {
        super(width, height, color1);
        this.color2 = color2;
        this.type = type;
        this.density = Math.max(1, density);
        let points = [];
        let pointCount = this.width * this.height / this.density;
        if (pointCount < 2) {
            pointCount = 2;
        }
        for (let i = 0; i < pointCount; ++i) {
            points[i] = new Coords(Math.random() * this.width, Math.random() * this.height);
        }
        this.distances = [];
        this.min = Infinity;
        let max = 0, i, d;
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                let { min1, min2 } = CellularTextureGenerator.distancesTo2Nearest(this, x, y, points);
                switch (this.type) {
                    case CellularTextureType.Net:
                        d = min2 - min1;
                        break;
                    case CellularTextureType.Balls:
                        d = min2 * min1;
                        break;
                    default: // Lava
                        d = min1 * min1;
                        break;
                }
                this.min = Math.min(this.min, d);
                max = Math.max(max, d);
                this.distances[Utils.flatten(this.width, x, y)] = d;
            }
        }
        this.range = max - this.min;
    }
    static wrappedDistance(g, x, y, b) {
        let dx = Math.abs(x - b.x);
        let dy = Math.abs(y - b.y);
        if (dx > g.width / 2) {
            dx = g.width - dx;
        }
        if (dy > g.height / 2) {
            dy = g.height - dy;
        }
        return Math.sqrt(dx * dx + dy * dy);
    }
    static distancesTo2Nearest(g, x, y, points) {
        let min1 = Infinity;
        let min2 = Infinity;
        for (const p of points) {
            let d = CellularTextureGenerator.wrappedDistance(g, x, y, p);
            if (d < min1) {
                min2 = min1;
                min1 = d;
            }
            else if (d < min2) {
                min2 = d;
            }
        }
        return { min1, min2 };
    }
    _getColor(x, y) {
        return this.color.lerp(this.color2, (this.distances[Utils.flatten(this.width, x, y)] - this.min) / this.range);
    }
}
class NoiseTextureGenerator extends TextureGenerator {
    constructor(width, height, color, intensity, saturation, coverage) {
        super(width, height, color);
        this.intensity = Utils.clamp(intensity, 0, 1);
        this.saturation = Utils.clamp(saturation, 0, 1);
        this.coverage = Utils.clamp(coverage, 0, 1);
        this.cache = [];
    }
    _getColor(x, y) {
        let i = Utils.flatten(this.width, Math.floor(x), Math.floor(y));
        if (this.cache[i] === undefined) {
            this.cache[i] = this.color.addNoise(this.intensity, this.saturation, this.coverage);
        }
        return this.cache[i];
    }
}
class PerlinGradient {
    constructor(width, height) {
        this.width = Math.ceil(width);
        this.height = Math.ceil(height);
        this.data = [];
        let c = this.width * this.height;
        for (let i = 0; i < c; ++i) {
            this.data.push(Vec2.randUnit());
        }
    }
    get(x, y) {
        return this.data[Utils.wrap(x, 0, this.width) +
            Utils.wrap(y, 0, this.height) * this.width];
    }
}
class PerlinTextureGenerator extends TextureGenerator {
    constructor(width, height, color1, color2, scale = 1) {
        super(width, height, color1);
        this.color2 = color2;
        this.scale = 1 / (scale * 32);
    }
    dotGridGradient(gradient, ix, iy, x, y) {
        return gradient.get(ix, iy).udot(x - ix, y - iy);
    }
    perlin(gradient, x, y) {
        let x0 = Math.floor(x);
        let x1 = x0 + 1;
        let y0 = Math.floor(y);
        let y1 = y0 + 1;
        let sx = x - x0;
        let sy = y - y0;
        return Utils.interpolateSmooth(Utils.interpolateSmooth(this.dotGridGradient(gradient, x0, y0, x, y), this.dotGridGradient(gradient, x1, y0, x, y), sx), Utils.interpolateSmooth(this.dotGridGradient(gradient, x0, y1, x, y), this.dotGridGradient(gradient, x1, y1, x, y), sx), sy);
    }
}
class PerlinNoiseTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, scale = 1) {
        super(width, height, color1, color2, scale);
        this.gradient = new PerlinGradient(this.width * this.scale, this.height * this.scale);
    }
    _getColor(x, y) {
        return this.color.lerp(this.color2, this.perlin(this.gradient, x * this.scale, y * this.scale) / 2 + 0.5);
    }
}
class CloudsTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, scale = 1) {
        super(width, height, color1, color2, scale);
        this.scales = [
            this.scale / 4,
            this.scale / 2,
            this.scale,
            this.scale * 2,
            this.scale * 4,
            this.scale * 8
        ];
        this.coeficients = [0.5, 0.25, 0.125, 0.0625, 0.03125, 0.03125];
        this.gradients = [];
        for (let i = 0; i < 6; ++i) {
            this.gradients.push(new PerlinGradient(this.width * this.scales[i], this.height * this.scales[i]));
        }
    }
    _getColor(x, y) {
        let v = 0;
        for (let i = 0; i < 6; ++i) {
            v += this.perlin(this.gradients[i], x * this.scales[i], y * this.scales[i]) * this.coeficients[i];
        }
        return this.color.lerp(this.color2, v / 2 + 0.5);
    }
}
class VelvetTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, scale = 1) {
        super(width, height, color1, color2, scale);
    }
    generateImage() {
        let tex = new PreRenderedImage(this.width, this.height);
        let w = this.width * this.scale, h = this.height * this.scale;
        let grads = [
            new PerlinGradient(w, h),
            new PerlinGradient(w, h),
            new PerlinGradient(w, h)
        ];
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                tex.ctx.fillStyle = this.color.lerp(this.color2, this.perlin(grads[0], x * this.scale + this.perlin(grads[1], x * this.scale, y * this.scale), y * this.scale + this.perlin(grads[2], x * this.scale, y * this.scale)) / 2 + 0.5).toCss();
                tex.ctx.fillRect(x, y, 1, 1);
            }
        }
        return tex.image;
    }
}
class GlassTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, scale = 1, turbulence = 1) {
        super(width, height, color1, color2, scale);
        this.turbulence = 0.125 * turbulence;
    }
    generateImage() {
        let tex = new PreRenderedImage(this.width, this.height);
        let w = this.width * this.scale, h = this.height * this.scale;
        let grads = [
            new PerlinGradient(w, h),
            new PerlinGradient(w, h),
            new PerlinGradient(w, h)
        ];
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                let _x = Math.cos((this.perlin(grads[1], x * this.scale, y * this.scale) * 128 + 128) * this.turbulence);
                let _y = Math.sin((this.perlin(grads[2], x * this.scale, y * this.scale) * 128 + 128) * this.turbulence);
                tex.ctx.fillStyle = this.color.lerp(this.color2, this.perlin(grads[0], x * this.scale + _x, y * this.scale + _y) / 2 + 0.5).toCss();
                tex.ctx.fillRect(x, y, 1, 1);
            }
        }
        return tex.image;
    }
}
class FrostedGlassTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, scale = 1) {
        super(width, height, color1, color2, scale);
    }
    generateImage() {
        let tex = new PreRenderedImage(this.width, this.height);
        let scales = [
            this.scale,
            this.scale * 2,
            this.scale * 4
        ];
        let grads = [
            new PerlinGradient(this.width * scales[0], this.height * scales[0]),
            new PerlinGradient(this.width * scales[1], this.height * scales[1]),
            new PerlinGradient(this.width * scales[2], this.height * scales[2]),
            new PerlinGradient(this.width * scales[0], this.height * scales[0]),
            new PerlinGradient(this.width * scales[1], this.height * scales[1]),
            new PerlinGradient(this.width * scales[2], this.height * scales[2]),
            new PerlinGradient(this.width * scales[0], this.height * scales[0])
        ];
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                tex.ctx.fillStyle = this.color.lerp(this.color2, this.perlin(grads[6], x * this.scale
                    + this.perlin(grads[0], x * scales[0], y * scales[0]) * 0.5
                    + this.perlin(grads[1], x * scales[1], y * scales[1]) * 0.25
                    + this.perlin(grads[2], x * scales[2], y * scales[2]) * 0.25, y * this.scale
                    + this.perlin(grads[3], x * scales[0], y * scales[0]) * 0.5
                    + this.perlin(grads[4], x * scales[1], y * scales[1]) * 0.25
                    + this.perlin(grads[5], x * scales[2], y * scales[2]) * 0.25) / 2 + 0.5).toCss();
                tex.ctx.fillRect(x, y, 1, 1);
            }
        }
        return tex.image;
    }
}
class BarkTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, scale = 1) {
        super(width, height, color1, color2, scale);
    }
    generateImage() {
        let tex = new PreRenderedImage(this.width, this.height);
        let scales = [
            this.scale,
            this.scale * 2,
            this.scale * 4,
            this.scale * 6
        ];
        let grads = [
            new PerlinGradient(this.width * scales[0], this.height * scales[0]),
            new PerlinGradient(this.width * scales[1], this.height * scales[1]),
            new PerlinGradient(this.width * scales[2], this.height * scales[2]),
            new PerlinGradient(this.width * scales[3], this.height * scales[3])
        ];
        function granulate(value, steps) {
            return Math.floor(value * steps) / steps + 1 / steps / 2;
        }
        let f = 4, a = 2, m = this.scale * Math.PI / 2;
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                tex.ctx.fillStyle = this.color.lerp(this.color2, (granulate(Math.sin(f * (x * m +
                    a * (this.perlin(grads[0], x * scales[0], y * scales[0]) * 0.5
                        + this.perlin(grads[1], x * scales[1], y * scales[1]) * 0.25
                        + this.perlin(grads[2], x * scales[2], y * scales[2]) * 0.25))), 2) +
                    granulate(this.perlin(grads[3], x * scales[3], y * scales[3]), 5)) / 4 + 0.5).toCss();
                tex.ctx.fillRect(x, y, 1, 1);
            }
        }
        return tex.image;
    }
}
class CirclesTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, background, scale = 1, ringCount = Infinity) {
        super(width, height, color1, color2, scale);
        this.ringCount = ringCount;
        this.background = background !== null ? background : RgbaColorSource.transparent;
    }
    generateImage() {
        let tex = new PreRenderedImage(this.width, this.height);
        let scale = this.scale * 2;
        let grads = [
            new PerlinGradient(this.width * scale, this.height * scale),
            new PerlinGradient(this.width * scale, this.height * scale)
        ];
        let cx = this.width * this.scale / 2, cy = this.height * this.scale / 2;
        let ringCountL = this.ringCount - 0.25, background = this.background.toCss();
        let _x, _y, d, c;
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                _x = x * this.scale + this.perlin(grads[0], x * scale, y * scale) * 0.5 - cx;
                _y = y * this.scale + this.perlin(grads[1], x * scale, y * scale) * 0.5 - cy;
                d = Math.sqrt(_x * _x + _y * _y);
                if (d > this.ringCount) {
                    tex.ctx.fillStyle = background;
                }
                else {
                    c = this.color.lerp(this.color2, Utils.interpolateSmooth(0, 1, 1 - Math.abs(1 - d % 1 * 2)));
                    if (d > ringCountL) {
                        tex.ctx.fillStyle = c.lerp(this.background, Utils.interpolateSmooth(0, 1, (d - ringCountL) * 4)).toCss();
                    }
                    else {
                        tex.ctx.fillStyle = c.toCss();
                    }
                }
                tex.ctx.fillRect(x, y, 1, 1);
            }
        }
        return tex.image;
    }
}
class CamouflageTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, scale = 1) {
        super(width, height, color1, color2, scale);
    }
    generateImage() {
        let tex = new PreRenderedImage(this.width, this.height);
        let scales = [
            this.scale,
            this.scale * 2,
            this.scale * 4
        ];
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
        ];
        function granulate(value, steps) {
            return Math.floor(value * steps) / steps + 1 / steps / 2;
        }
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                let _x = x * this.scale
                    + this.perlin(grads[0], x * scales[0], y * scales[0]) * 1.5
                    + this.perlin(grads[1], x * scales[1], y * scales[1]) * 0.75
                    + this.perlin(grads[2], x * scales[2], y * scales[2]) * 0.75;
                let _y = y * this.scale
                    + this.perlin(grads[3], x * scales[0], y * scales[0]) * 1.5
                    + this.perlin(grads[4], x * scales[1], y * scales[1]) * 0.75
                    + this.perlin(grads[5], x * scales[2], y * scales[2]) * 0.75;
                tex.ctx.fillStyle = this.color.lerp(this.color2, (granulate(this.perlin(grads[6], _x, _y), 4) * 0.7 +
                    granulate(this.perlin(grads[7], _x * 2, _y * 2), 5) * 0.2 +
                    granulate(this.perlin(grads[8], _x * 4, _y * 4), 6) * 0.1) / 2 + 0.5).toCss();
                tex.ctx.fillRect(x, y, 1, 1);
            }
        }
        return tex.image;
    }
}
/// <reference path='Utils.ts'/>
class Particle {
    step(time) { }
    render(ctx) { }
    isDead() { return true; }
}
class SmokeParticle extends Particle {
    constructor(x, y, startSize) {
        super();
        this.x = x;
        this.y = y;
        this.life = 0;
        let lightness = Utils.randInt(112, 176);
        let h = Utils.byteToHex(lightness);
        this.rgb = `#${h}${h}${h}`;
        this.startSize = startSize;
    }
    step(time) {
        this.life += time;
    }
    render(ctx) {
        if (this.life >= 1) {
            return;
        }
        let r = this.life * 8 + this.startSize;
        ctx.fillStyle = this.rgb + Utils.byteToHex(255 * (1 - this.life));
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Angle.deg360);
        ctx.fill();
    }
    isDead() {
        return this.life >= 1;
    }
}
class ParticleSystem extends GameItem {
    constructor(game) {
        super(game);
        this.parts = [];
        this.count = 0;
    }
    add(p) {
        this.parts[this.count] = p;
        ++this.count;
    }
    step(time) {
        if (this.count === 0) {
            return;
        }
        let j = this.count;
        for (let i = 0; i < j; ++i) {
            let p = this.parts[i];
            p.step(time);
            if (p.isDead()) {
                --j;
                if (i < j) {
                    this.parts[i] = this.parts[j];
                }
            }
        }
        this.count = j;
    }
    render(ctx, preRender) {
        if (preRender) {
            return;
        }
        for (const p of this.parts) {
            p.render(ctx);
        }
    }
}
var TurretElement;
(function (TurretElement) {
    TurretElement[TurretElement["Air"] = 0] = "Air";
    TurretElement[TurretElement["Earth"] = 1] = "Earth";
    TurretElement[TurretElement["Fire"] = 2] = "Fire";
    TurretElement[TurretElement["Water"] = 3] = "Water";
})(TurretElement || (TurretElement = {}));
class TurretType {
    constructor(type = null) {
        this.type = type === null ? [0, 0, 0, 0] : type;
    }
    copy() {
        return new TurretType(this.type.slice());
    }
    add(elem) {
        ++this.type[elem];
        return this;
    }
    air() { return this.type[TurretElement.Air]; }
    earth() { return this.type[TurretElement.Earth]; }
    fire() { return this.type[TurretElement.Fire]; }
    water() { return this.type[TurretElement.Water]; }
    count() {
        let c = 0;
        for (let i = 0; i < 4; ++i) {
            c += this.type[i];
        }
        return c;
    }
    toArray() {
        let arr = [];
        for (let i = 0; i < this.type[TurretElement.Air]; ++i) {
            arr.push(TurretElement.Air);
        }
        for (let i = 0; i < this.type[TurretElement.Earth]; ++i) {
            arr.push(TurretElement.Earth);
        }
        for (let i = 0; i < this.type[TurretElement.Fire]; ++i) {
            arr.push(TurretElement.Fire);
        }
        for (let i = 0; i < this.type[TurretElement.Water]; ++i) {
            arr.push(TurretElement.Water);
        }
        return arr;
    }
    toColorArray() {
        let arr = [];
        for (let i = 0; i < this.type[TurretElement.Air]; ++i) {
            arr.push("#d8d1ff");
        }
        for (let i = 0; i < this.type[TurretElement.Earth]; ++i) {
            arr.push("#6dd13e");
        }
        for (let i = 0; i < this.type[TurretElement.Fire]; ++i) {
            arr.push("#f7854c");
        }
        for (let i = 0; i < this.type[TurretElement.Water]; ++i) {
            arr.push("#79b4f2");
        }
        return arr;
    }
}
/// <reference path='Utils.ts'/>
/// <reference path='GameItem.ts'/>
/// <reference path="TextureGenerator.ts"/>
/// <reference path="ParticleSystem.ts"/>
/// <reference path="TurretType.ts"/>
class Turret extends GameItem {
    constructor(tile, type = null) {
        super(tile.game);
        this.tile = tile;
        this.center = new Coords(tile.pos.x + 32, tile.pos.y + 32);
        this.hp = 100;
        this.type = type === null ? new TurretType() : type;
        this.cooldown = 0;
    }
    step(time) {
        if (this.cooldown > 0) {
            this.cooldown -= time;
        }
    }
    render(ctx, preRender) { }
    getType() { return this.type.copy(); }
    addType(type) {
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new AirTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Earth:
                this.tile.turret = new EarthTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Fire:
                this.tile.turret = new FireTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Water:
                this.tile.turret = new WaterTurret(this.tile, this.type.add(type));
                break;
        }
    }
    static init() {
        AirTurret.init();
        FireTurret.init();
        EarthTurret.init();
        WaterTurret.init();
        IceTurret.init();
        AcidTurret.init();
        CannonTurret.init();
        ArcherTurret.init();
        LightningTurret.init();
        FlamethrowerTurret.init();
        SunTurret.init();
        MoonTurret.init();
        PlasmaTurret.init();
        EarthquakeTurret.init();
        ArcaneTurret.init();
    }
}
class AirTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.angle = 0;
    }
    step(time) {
        super.step(time);
        this.angle = (this.angle + Angle.deg360 - time * Angle.deg120) % Angle.deg360;
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.drawImage(AirTurret.image, -32, -32);
        switch (this.type.air()) {
            case 1:
                ctx.rotate(Angle.deg90);
                ctx.drawImage(AirTurret.image, -32, -32);
                break;
            case 2:
                ctx.rotate(Angle.deg60);
                ctx.drawImage(AirTurret.image, -32, -32);
                ctx.rotate(Angle.deg60);
                ctx.drawImage(AirTurret.image, -32, -32);
                break;
            case 3:
                ctx.rotate(Angle.deg45);
                ctx.drawImage(AirTurret.image, -32, -32);
                ctx.rotate(Angle.deg45);
                ctx.drawImage(AirTurret.image, -32, -32);
                ctx.rotate(Angle.deg45);
                ctx.drawImage(AirTurret.image, -32, -32);
                break;
            case 4:
                ctx.rotate(Angle.deg36);
                ctx.drawImage(AirTurret.image, -32, -32);
                ctx.rotate(Angle.deg36);
                ctx.drawImage(AirTurret.image, -32, -32);
                ctx.rotate(Angle.deg36);
                ctx.drawImage(AirTurret.image, -32, -32);
                ctx.rotate(Angle.deg36);
                ctx.drawImage(AirTurret.image, -32, -32);
                break;
        }
        ctx.resetTransform();
    }
    addType(type) {
        if (this.type.count() >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                this.type.add(type);
                break;
            case TurretElement.Earth:
                this.tile.turret = new ArcherTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Fire:
                this.tile.turret = new LightningTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Water:
                this.tile.turret = new IceTurret(this.tile, this.type.add(type));
                break;
        }
    }
    static init() {
        let c = new PreRenderedImage(64, 64);
        let renderable = new RenderablePathSet();
        let path = new Path2D();
        path.ellipse(44, 32, 12, 8, 0, 0, Angle.deg180);
        let grad = c.ctx.createLinearGradient(32, 32, 32, 40);
        renderable.pushNew(path, grad);
        path = new Path2D();
        path.ellipse(20, 32, 12, 8, 0, Angle.deg180, 0);
        grad = c.ctx.createLinearGradient(32, 32, 32, 24);
        renderable.pushNew(path, grad);
        path = new Path2D();
        path.arc(32, 32, 8, 0, Angle.deg360);
        grad = c.ctx.createRadialGradient(32, 32, 8, 32, 32, 4);
        renderable.pushNew(path, grad);
        for (const rp of renderable.paths) {
            rp.path.closePath();
            const gr = rp.fill;
            gr.addColorStop(0, "#B2A5FF");
            gr.addColorStop(1, "#A0A0A0");
        }
        renderable.render(c.ctx);
        AirTurret.image = c.image;
    }
}
class EarthTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
    }
    step(time) {
        super.step(time);
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.drawImage(EarthTurret.images[this.type.earth()], this.tile.pos.x, this.tile.pos.y);
    }
    addType(type) {
        if (this.type.count() >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new ArcherTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Earth:
                this.type.add(type);
                break;
            case TurretElement.Fire:
                this.tile.turret = new CannonTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Water:
                this.tile.turret = new AcidTurret(this.tile, this.type.add(type));
                break;
        }
    }
    static init() {
        EarthTurret.images = [];
        EarthTurret.preRender1();
        EarthTurret.preRender2();
        EarthTurret.preRender3();
        EarthTurret.preRender4();
    }
    static preRender1() {
        let c = new PreRenderedImage(64, 64);
        let renderable = new RenderablePathSet();
        let path;
        let grad;
        let corners = [
            { x: 22, y: 22 },
            { x: 42, y: 22 },
            { x: 22, y: 42 },
            { x: 42, y: 42 }
        ];
        for (const corner of corners) {
            path = new Path2D();
            path.arc(corner.x, corner.y, 10, 0, Angle.deg360);
            grad = c.ctx.createRadialGradient(corner.x, corner.y, 5, corner.x, corner.y, 10);
            grad.addColorStop(0, "#90d173");
            grad.addColorStop(1, "#6ba370");
            renderable.pushNew(path, grad);
        }
        path = new Path2D();
        path.moveTo(20, 24);
        path.lineTo(24, 20);
        path.lineTo(44, 40);
        path.lineTo(40, 44);
        path.closePath();
        path.moveTo(44, 24);
        path.lineTo(40, 20);
        path.lineTo(20, 40);
        path.lineTo(24, 44);
        path.closePath();
        renderable.pushNew(path, "#90d173");
        path = new Path2D();
        path.arc(32, 32, 6, 0, Angle.deg360);
        grad = c.ctx.createRadialGradient(32, 32, 2, 32, 32, 6);
        grad.addColorStop(0, "#beefa7");
        grad.addColorStop(1, "#90d173");
        renderable.pushNew(path, grad);
        renderable.render(c.ctx);
        EarthTurret.images[1] = c.image;
    }
    static preRender2() {
        let c = new PreRenderedImage(64, 64);
        let renderable = new RenderablePathSet();
        let path;
        let grad;
        let corners = [
            { x: 21, y: 21 },
            { x: 43, y: 21 },
            { x: 21, y: 43 },
            { x: 43, y: 43 }
        ];
        for (const corner of corners) {
            path = new Path2D();
            path.arc(corner.x, corner.y, 10, 0, Angle.deg360);
            grad = c.ctx.createRadialGradient(corner.x, corner.y, 5, corner.x, corner.y, 10);
            grad.addColorStop(0, "#6fd243");
            grad.addColorStop(1, "#54a45b");
            renderable.pushNew(path, grad);
        }
        path = new Path2D();
        path.moveTo(20, 24);
        path.lineTo(24, 20);
        path.lineTo(44, 40);
        path.lineTo(40, 44);
        path.closePath();
        path.moveTo(44, 24);
        path.lineTo(40, 20);
        path.lineTo(20, 40);
        path.lineTo(24, 44);
        path.closePath();
        renderable.pushNew(path, "#6fd243");
        path = new Path2D();
        path.arc(32, 32, 6, 0, Angle.deg360);
        grad = c.ctx.createRadialGradient(32, 32, 2, 32, 32, 6);
        grad.addColorStop(0, "#a6f083");
        grad.addColorStop(1, "#6fd243");
        renderable.pushNew(path, grad);
        renderable.render(c.ctx);
        EarthTurret.images[2] = c.image;
    }
    static preRender3() {
        let c = new PreRenderedImage(64, 64);
        let renderable = new RenderablePathSet();
        let path;
        let grad;
        let corners = [
            { x: 20, y: 20 },
            { x: 44, y: 20 },
            { x: 20, y: 44 },
            { x: 44, y: 44 }
        ];
        for (const corner of corners) {
            path = new Path2D();
            path.arc(corner.x, corner.y, 11, 0, Angle.deg360);
            grad = c.ctx.createRadialGradient(corner.x, corner.y, 5, corner.x, corner.y, 10);
            grad.addColorStop(0, "#4ed314");
            grad.addColorStop(1, "#3da547");
            renderable.pushNew(path, grad);
        }
        path = new Path2D();
        path.moveTo(19, 25);
        path.lineTo(25, 19);
        path.lineTo(45, 39);
        path.lineTo(39, 45);
        path.closePath();
        path.moveTo(45, 25);
        path.lineTo(39, 19);
        path.lineTo(19, 39);
        path.lineTo(25, 45);
        path.closePath();
        renderable.pushNew(path, "#4ed314");
        path = new Path2D();
        path.arc(32, 32, 8, 0, Angle.deg360);
        grad = c.ctx.createRadialGradient(32, 32, 3, 32, 32, 8);
        grad.addColorStop(0, "#8ef260");
        grad.addColorStop(1, "#4ed314");
        renderable.pushNew(path, grad);
        renderable.render(c.ctx);
        EarthTurret.images[3] = c.image;
    }
    static preRender4() {
        let c = new PreRenderedImage(64, 64);
        let renderable = new RenderablePathSet();
        let path;
        let grad;
        let corners = [
            { x: 20, y: 20 },
            { x: 44, y: 20 },
            { x: 20, y: 44 },
            { x: 44, y: 44 }
        ];
        for (const corner of corners) {
            path = new Path2D();
            path.arc(corner.x, corner.y, 11, 0, Angle.deg360);
            grad = c.ctx.createRadialGradient(corner.x, corner.y, 6, corner.x, corner.y, 10);
            grad.addColorStop(0, "#4ed314");
            grad.addColorStop(1, "#3da547");
            renderable.pushNew(path, grad);
        }
        path = new Path2D();
        path.moveTo(18, 26);
        path.lineTo(26, 18);
        path.lineTo(46, 38);
        path.lineTo(38, 46);
        path.closePath();
        path.moveTo(46, 26);
        path.lineTo(38, 18);
        path.lineTo(18, 38);
        path.lineTo(26, 46);
        path.closePath();
        renderable.pushNew(path, "#4ed314");
        path = new Path2D();
        path.arc(32, 32, 10, 0, Angle.deg360);
        grad = c.ctx.createRadialGradient(32, 32, 4, 32, 32, 10);
        grad.addColorStop(0, "#b6ff00");
        grad.addColorStop(1, "#4ed314");
        renderable.pushNew(path, grad);
        renderable.render(c.ctx);
        EarthTurret.images[4] = c.image;
    }
}
class FireTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.angle = Angle.rand();
        this.smokeTimer = Utils.randInt(0.5, 4);
    }
    spawnSmoke() {
        let x;
        let y;
        let r = 5 + this.type.fire();
        do {
            x = Math.random() * r * 2 - r;
            y = Math.random() * r * 2 - r;
        } while (x * x + y * y > 100);
        this.smokeTimer = Utils.randInt(0.5, 6 - this.type.fire());
        this.game.particles.add(new SmokeParticle(this.center.x + x, this.center.y + y, 0));
    }
    step(time) {
        super.step(time);
        this.smokeTimer -= time;
        if (this.smokeTimer <= 0) {
            this.spawnSmoke();
        }
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        let r = 20 + 3 * this.type.fire();
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.drawImage(FireTurret.image, -r, -r, r * 2, r * 2);
        ctx.resetTransform();
    }
    addType(type) {
        if (this.type.count() >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new LightningTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Earth:
                this.tile.turret = new CannonTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Fire:
                this.type.add(type);
                break;
            case TurretElement.Water:
                this.tile.turret = new FlamethrowerTurret(this.tile, this.type.add(type));
                break;
        }
    }
    static init() {
        let c = new PreRenderedImage(64, 64);
        let texLava = new CellularTextureGenerator(64, 64, 36, RgbaColorSource.fromHex("#FF5020"), RgbaColorSource.fromHex("#C00000"), CellularTextureType.Balls);
        let texRock = new CellularTextureGenerator(64, 64, 144, RgbaColorSource.fromHex("#662D22"), RgbaColorSource.fromHex("#44150D"), CellularTextureType.Balls);
        let renderable = new RenderablePathSet();
        let path = new Path2D();
        for (let k = 0; k < 36; ++k) {
            let radius = 20 + 4 * Math.random();
            let a = k * Angle.deg10;
            if (k === 0) {
                path.moveTo(Utils.ldx(radius, a, 32), Utils.ldy(radius, a, 32));
            }
            else {
                path.lineTo(Utils.ldx(radius, a, 32), Utils.ldy(radius, a, 32));
            }
        }
        path.closePath();
        renderable.pushNew(path, c.ctx.createPattern(texRock.generateImage(), "no-repeat"));
        let grad = c.ctx.createRadialGradient(32, 32, 24, 32, 32, 10);
        grad.addColorStop(0, "#300000");
        grad.addColorStop(1, "#30000000");
        renderable.pushNew(path, grad);
        path = new Path2D();
        for (let k = 0; k < 18; ++k) {
            let radius = 9 + 2 * Math.random();
            let a = k * Angle.deg20;
            if (k === 0) {
                path.moveTo(Utils.ldx(radius, a, 32), Utils.ldy(radius, a, 32));
            }
            else {
                path.lineTo(Utils.ldx(radius, a, 32), Utils.ldy(radius, a, 32));
            }
        }
        path.closePath();
        renderable.pushNew(path, c.ctx.createPattern(texLava.generateImage(), "no-repeat"));
        renderable.render(c.ctx);
        FireTurret.image = c.image;
    }
}
class WaterTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.angle = Angle.rand();
    }
    step(time) {
        super.step(time);
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.drawImage(WaterTurret.images[this.type.count() - 1], -32, -32);
        ctx.resetTransform();
    }
    addType(type) {
        if (this.type.count() >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new IceTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Fire:
                this.tile.turret = new FlamethrowerTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Earth:
                this.tile.turret = new AcidTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Water:
                this.type.add(type);
                break;
        }
    }
    static init() {
        let sandTex = new NoiseTextureGenerator(64, 64, RgbaColorSource.fromHex("#F2EBC1"), 0.08, 0, 1).generateImage();
        let groundTex = new NoiseTextureGenerator(64, 64, RgbaColorSource.fromHex("#B9B5A0"), 0.05, 0, 1).generateImage();
        let c0 = new PreRenderedImage(64, 64);
        let c1 = new PreRenderedImage(64, 64);
        let c2 = new PreRenderedImage(64, 64);
        let c3 = WaterTurret.preRender(groundTex, sandTex);
        c0.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex).image, 9, 9, 46, 46);
        c1.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex).image, 6, 6, 52, 52);
        c2.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex).image, 3, 3, 58, 58);
        WaterTurret.images = [c0.image, c1.image, c2.image, c3.image];
    }
    static preRender(groundTex, sandTex) {
        let waterTex = new CellularTextureGenerator(64, 64, Utils.randInt(16, 36), RgbaColorSource.fromHex("#3584CE"), RgbaColorSource.fromHex("#3EB4EF"), CellularTextureType.Balls).generateImage();
        let textures = [groundTex, sandTex, waterTex];
        let pts = [[], [], []];
        for (let i = 0; i < 8; ++i) {
            let d2 = Utils.rand(16, 20);
            let d1 = Utils.rand(d2 + 2, 24);
            let d0 = Utils.rand(d1, 24);
            let a = i * Angle.deg45;
            pts[0].push({ pt: Utils.ld(d0, a, 32, 32), pt_b: null, pt_a: null });
            pts[1].push({ pt: Utils.ld(d1, a, 32, 32), pt_b: null, pt_a: null });
            pts[2].push({ pt: Utils.ld(d2, a, 32, 32), pt_b: null, pt_a: null });
        }
        for (let j = 0; j < 3; ++j) {
            let layer = pts[j];
            for (let i = 0; i < 8; ++i) {
                let ob = layer[(i + 7) % 8];
                let o = layer[i];
                let oa = layer[(i + 1) % 8];
                let angle = Utils.angleBetween(Utils.getAngle(ob.pt.x, ob.pt.y, o.pt.x, o.pt.y), Utils.getAngle(o.pt.x, o.pt.y, oa.pt.x, oa.pt.y));
                o.pt_a = Utils.ld(5, angle, o.pt.x, o.pt.y);
                o.pt_b = Utils.ld(5, angle + Angle.deg180, o.pt.x, o.pt.y);
            }
        }
        let c = new PreRenderedImage(64, 64);
        let ctx = c.ctx;
        for (let j = 0; j < 3; ++j) {
            let layer = pts[j];
            ctx.beginPath();
            ctx.moveTo(layer[0].pt.x, layer[0].pt.y);
            for (let i = 0; i < 8; ++i) {
                let o0 = layer[i];
                let o1 = layer[(i + 1) % 8];
                ctx.bezierCurveTo(o0.pt_a.x, o0.pt_a.y, o1.pt_b.x, o1.pt_b.y, o1.pt.x, o1.pt.y);
            }
            ctx.fillStyle = ctx.createPattern(textures[j], "repeat");
            ctx.fill();
        }
        return c;
    }
}
class IceTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.angle = Angle.rand();
    }
    step(time) {
        super.step(time);
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        let r = 24 + 2 * this.type.water() + 2 * this.type.air();
        let i = Math.sign(this.type.water() - this.type.air()) + 1;
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.drawImage(IceTurret.images[i], -r, -r, r * 2, r * 2);
        ctx.resetTransform();
    }
    addType(type) {
        if (this.type.count() >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Earth:
                this.tile.turret = new MoonTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Fire:
                this.tile.turret = new PlasmaTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Air:
            case TurretElement.Water:
                this.type.add(type);
                break;
        }
    }
    static init() {
        let tex = new CellularTextureGenerator(64, 64, 64, RgbaColorSource.fromHex("#D1EFFF"), RgbaColorSource.fromHex("#70BECC"), CellularTextureType.Lava);
        let c0 = new PreRenderedImage(64, 64);
        let c1 = new PreRenderedImage(64, 64);
        let c2 = new PreRenderedImage(64, 64);
        let fill = c1.ctx.createPattern(tex.generateImage(), "no-repeat");
        IceTurret.preRender(c1.ctx, fill, true);
        c0.ctx.drawImage(c1.image, 0, 0);
        IceTurret.preRender(c0.ctx, "#FFFFFF80");
        c2.ctx.drawImage(c1.image, 0, 0);
        IceTurret.preRender(c2.ctx, "#51AFCC80");
        IceTurret.images = [c0.image, c1.image, c2.image];
    }
    static mkBranch(ctx, x, y, angle, size) {
        if (size >= 2.5) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            let x2 = Utils.ldx(8, angle, x);
            let y2 = Utils.ldy(8, angle, y);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = 3;
            ctx.stroke();
            IceTurret.mkBranch(ctx, (x + x2) / 2, (y + y2) / 2, angle - Angle.deg60, 2);
            IceTurret.mkBranch(ctx, (x + x2) / 2, (y + y2) / 2, angle + Angle.deg60, 2);
            IceTurret.mkBranch(ctx, x2, y2, angle, 2);
        }
        else if (size >= 1.5) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            let x2 = Utils.ldx(6, angle, x);
            let y2 = Utils.ldy(6, angle, y);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = 2;
            ctx.stroke();
            IceTurret.mkBranch(ctx, (x + x2) / 2, (y + y2) / 2, angle - Angle.deg45, 1);
            IceTurret.mkBranch(ctx, (x + x2) / 2, (y + y2) / 2, angle + Angle.deg45, 1);
            IceTurret.mkBranch(ctx, x2, y2, angle, 1);
        }
        else if (size >= 0.5) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            let x2 = Utils.ldx(4, angle, x);
            let y2 = Utils.ldy(4, angle, y);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
    static preRender(ctx, fill, drawCenter = false) {
        ctx.save();
        ctx.lineCap = "round";
        ctx.strokeStyle = fill;
        let centerPath = new Path2D();
        for (let k = 0; k < 6; ++k) {
            let a = k * Angle.deg60;
            if (k === 0) {
                centerPath.moveTo(Utils.ldx(8, a, 32), Utils.ldy(8, a, 32));
            }
            else {
                centerPath.lineTo(Utils.ldx(8, a, 32), Utils.ldy(8, a, 32));
            }
            IceTurret.mkBranch(ctx, Utils.ldx(8, a, 32), Utils.ldy(8, a, 32), a, 3);
        }
        centerPath.closePath();
        ctx.restore();
        ctx.fillStyle = fill;
        ctx.fill(centerPath);
        if (drawCenter) {
            let grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 6);
            grad.addColorStop(0, "#FFFFFF");
            grad.addColorStop(1, "#D1EFFF00");
            ctx.fillStyle = grad;
            ctx.fill(centerPath);
        }
    }
}
class AcidTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.frame = 0;
    }
    step(time) {
        super.step(time);
        this.frame = (this.frame + time * 25) % AcidTurret.frameCount;
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        let f = AcidTurret.images[Math.floor(this.frame)][this.type.water() + this.type.earth() - 2];
        ctx.drawImage(f, this.center.x - 32, this.center.y - 32);
    }
    addType(type) {
        if (this.type.count() >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new MoonTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Fire:
                this.tile.turret = new EarthquakeTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Earth:
            case TurretElement.Water:
                this.type.add(type);
                break;
        }
    }
    static init() {
        let acidTex = new CellularTextureGenerator(64, 64, 9, RgbaColorSource.fromHex("#E0FF00"), RgbaColorSource.fromHex("#5B7F00"), CellularTextureType.Balls).generateImage();
        AcidTurret.images = [];
        AcidTurret.frameCount = 100;
        for (let i = 0; i < AcidTurret.frameCount; ++i) {
            AcidTurret.images.push(AcidTurret.preRenderFrame(acidTex, i));
        }
    }
    static preRenderFrame(texture, frame) {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        let offset = frame / AcidTurret.frameCount * 64;
        let c0 = new PreRenderedImage(64, 64);
        let c1 = new PreRenderedImage(64, 64);
        let c2 = new PreRenderedImage(64, 64);
        let c = [c0, c1, c2];
        let ctx = c0.ctx;
        ctx.beginPath();
        ctx.moveTo(26, 20);
        ctx.arcTo(44, 20, 44, 26, 6);
        ctx.arcTo(44, 44, 38, 44, 6);
        ctx.arcTo(20, 44, 20, 38, 6);
        ctx.arcTo(20, 20, 26, 20, 6);
        ctx.closePath();
        ctx.fillStyle = "#B0B0B0";
        ctx.fill();
        ctx.strokeStyle = "#D0D0D0";
        ctx.lineWidth = 2;
        ctx.stroke();
        c1.ctx.drawImage(c0.image, 0, 0);
        c2.ctx.drawImage(c0.image, 0, 0);
        for (let i = 0; i < 3; ++i) {
            let w = 8 + 2 * i;
            let ca = new PreRenderedImage(w, w);
            ctx = ca.ctx;
            ctx.fillStyle = "#D0D0D060";
            ctx.fillRect(0, 0, w, w);
            ctx.fillStyle = "#D0D0D0";
            ctx.fillRect(0, 1, w, w - 2);
            ctx.fillRect(1, 0, w - 2, w);
            let pattern = ctx.createPattern(texture, "repeat");
            pattern.setTransform(svg.createSVGMatrix().translate(-offset, 0));
            ctx.fillStyle = pattern;
            ctx.fillRect(1, 1, w - 2, w - 2);
            ctx = c[i].ctx;
            ctx.translate(32, 32);
            ctx.drawImage(ca.image, 12, -4 - i);
            ctx.rotate(Angle.deg90);
            ctx.drawImage(ca.image, 12, -4 - i);
            ctx.rotate(Angle.deg90);
            ctx.drawImage(ca.image, 12, -4 - i);
            ctx.rotate(Angle.deg90);
            ctx.drawImage(ca.image, 12, -4 - i);
            ctx.resetTransform();
            pattern = ctx.createPattern(texture, "repeat");
            pattern.setTransform(svg.createSVGMatrix().translate(offset, offset));
            ctx.fillStyle = pattern;
            ctx.beginPath();
            ctx.arc(32, 32, 6 + i, 0, Angle.deg360);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#60606080";
            ctx.fill();
            let grad = ctx.createLinearGradient(25 - i / 2, 25 - i / 2, 38 + i / 2, 38 + i / 2);
            grad.addColorStop(0, "#808080");
            grad.addColorStop(1, "#404040");
            ctx.strokeStyle = grad;
            ctx.lineWidth = 2 + i;
            ctx.stroke();
        }
        return [c0.image, c1.image, c2.image];
    }
}
class CannonTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.angle = Angle.rand();
    }
    step(time) {
        super.step(time);
        if (this.cooldown <= 0) {
            this.cooldown = 2;
        }
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        let r = 24 + 2 * this.type.earth() + 2 * this.type.fire();
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.translate(-2 * this.cooldown, 0);
        ctx.drawImage(CannonTurret.image, -r, -r, r * 2, r * 2);
        ctx.resetTransform();
    }
    addType(type) {
        if (this.type.count() >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new PlasmaTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Earth:
            case TurretElement.Fire:
                this.type.add(type);
                break;
            case TurretElement.Water:
                this.tile.turret = new EarthquakeTurret(this.tile, this.type.add(type));
                break;
        }
    }
    static init() {
        let c = new PreRenderedImage(64, 64);
        let ctx = c.ctx;
        let grad = ctx.createLinearGradient(20, 32, 40, 32);
        grad.addColorStop(0.000, "#543B2C");
        grad.addColorStop(0.125, "#664936");
        grad.addColorStop(0.250, "#6C4D38");
        grad.addColorStop(0.375, "#6F4F3A");
        grad.addColorStop(0.500, "#70503B");
        grad.addColorStop(0.625, "#6F4F3A");
        grad.addColorStop(0.750, "#6C4D38");
        grad.addColorStop(0.875, "#664936");
        grad.addColorStop(1.000, "#543B2C");
        ctx.fillStyle = grad;
        ctx.fillRect(20, 19, 20, 26);
        ctx.beginPath();
        ctx.arc(20, 32, 7, Angle.deg90, Angle.deg270);
        ctx.arcTo(42, 25, 52, 28, 50);
        ctx.arc(54, 28, 2, Angle.deg180, Angle.deg360);
        ctx.lineTo(56, 36);
        ctx.arc(54, 36, 2, 0, Angle.deg180);
        ctx.arcTo(45, 39, 38, 39, 50);
        ctx.closePath();
        ctx.strokeStyle = "#101010";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#303030";
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(52, 28);
        ctx.lineTo(52, 36);
        ctx.lineWidth = 1;
        ctx.stroke();
        CannonTurret.image = c.image;
    }
}
class ArcherTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
    }
    step(time) {
        super.step(time);
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.drawImage(ArcherTurret.image, this.tile.pos.x, this.tile.pos.y);
    }
    addType(type) {
        if (this.type.count() >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
            case TurretElement.Earth:
                this.type.add(type);
                break;
            case TurretElement.Fire:
                this.tile.turret = new SunTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Water:
                this.tile.turret = new MoonTurret(this.tile, this.type.add(type));
                break;
        }
    }
    static init() {
        let c = new PreRenderedImage(64, 64);
        ArcherTurret.image = c.image;
    }
}
class LightningTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.animationTimer = Math.random();
    }
    step(time) {
        super.step(time);
        this.animationTimer = (this.animationTimer + time * (this.type.air() + this.type.fire() - 1) * 0.5) % 1;
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.drawImage(LightningTurret.images[Math.floor(this.animationTimer * 8)], this.tile.pos.x, this.tile.pos.y);
    }
    addType(type) {
        if (this.type.count() >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
            case TurretElement.Fire:
                this.type.add(type);
                break;
            case TurretElement.Earth:
                this.tile.turret = new SunTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Water:
                this.tile.turret = new PlasmaTurret(this.tile, this.type.add(type));
                break;
        }
    }
    static init() {
        let c = [];
        for (let i = 0; i < 8; ++i) {
            c[i] = new PreRenderedImage(64, 64);
        }
        let ctx = c[0].ctx;
        let grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 18);
        grad.addColorStop(0, "#FFFFFF");
        grad.addColorStop(0.33, "#A97FFF");
        grad.addColorStop(1, "#D6BFFF");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(50, 32);
        for (let i = 1; i < 16; ++i) {
            let r = i % 2 == 0 ? 21 : 7;
            let a = i * Angle.deg45 / 2;
            ctx.lineTo(Utils.ldx(r, a, 32), Utils.ldy(r, a, 32));
        }
        ctx.closePath();
        ctx.fill();
        grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 3);
        grad.addColorStop(0, "#F8F2FF");
        grad.addColorStop(1, "#C199FF");
        ctx.fillStyle = grad;
        let j = true;
        for (let i = 0; i < 8; ++i, j = !j) {
            let a = i * Angle.deg45;
            ctx.translate(Utils.ldx(18, a, 32), Utils.ldy(18, a, 32));
            if (j) {
                ctx.rotate(Angle.deg45);
            }
            ctx.fillRect(-3, -3, 6, 6);
            ctx.resetTransform();
        }
        for (let i = 1; i < 8; ++i) {
            c[i].ctx.drawImage(c[0].image, 0, 0);
        }
        for (let i = 0; i < 8; ++i, j = !j) {
            ctx = c[7 - i].ctx;
            grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
            grad.addColorStop(0, "#FFFFFFC0");
            grad.addColorStop(1, "#F8F2FF00");
            ctx.fillStyle = grad;
            let a = i * Angle.deg45;
            ctx.translate(Utils.ldx(18, a, 32), Utils.ldy(18, a, 32));
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Angle.deg360);
            ctx.closePath();
            ctx.fill();
            ctx.resetTransform();
        }
        LightningTurret.images = [];
        for (let i = 0; i < 8; ++i) {
            LightningTurret.images.push(c[i].image);
        }
    }
}
class FlamethrowerTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
    }
    step(time) {
        super.step(time);
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.drawImage(FlamethrowerTurret.image, this.tile.pos.x, this.tile.pos.y);
    }
    addType(type) {
        if (this.type.count() >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new SunTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Earth:
                this.tile.turret = new EarthquakeTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Fire:
            case TurretElement.Water:
                this.type.add(type);
                break;
        }
    }
    static init() {
        let c = new PreRenderedImage(64, 64);
        FlamethrowerTurret.image = c.image;
    }
}
class SunTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.frame = 0;
    }
    step(time) {
        super.step(time);
        this.frame = (this.frame + time * 25) % SunTurret.frameCount;
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        let r = 16 + 4 * this.type.count();
        ctx.drawImage(SunTurret.images[Math.floor(this.frame)], this.center.x - r, this.center.y - r, r * 2, r * 2);
    }
    addType(type) {
        if (this.type.count() >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
            case TurretElement.Earth:
            case TurretElement.Fire:
                this.type.add(type);
                break;
            case TurretElement.Water:
                this.tile.turret = new ArcaneTurret(this.tile, this.type.add(type));
                break;
        }
    }
    static init() {
        SunTurret.images = [];
        SunTurret.frameCount = 90;
        let c = new PreRenderedImage(64, 64);
        let ctx = c.ctx;
        let grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0.00000, "#FFFF40"); //  0
        grad.addColorStop(0.09375, "#FFFD3D"); //  3
        grad.addColorStop(0.18750, "#FFFA37"); //  6
        grad.addColorStop(0.28125, "#FFF42A"); //  9
        grad.addColorStop(0.37500, "#FFE000"); // 12
        grad.addColorStop(0.40625, "#FFFFC0"); // 13
        grad.addColorStop(1.00000, "#FFFFC000"); // 32
        ctx.fillStyle = grad;
        ctx.beginPath();
        for (let i = 0; i < 12; ++i) {
            let a0 = i * Angle.deg30;
            let a1 = a0 + Angle.deg10;
            let a2 = a0 + Angle.deg30;
            ctx.arc(32, 32, 32, a0, a1);
            ctx.lineTo(Utils.ldx(12, a1, 32), Utils.ldy(12, a1, 32));
            ctx.arc(32, 32, 12, a1, a2);
            ctx.lineTo(Utils.ldx(32, a2, 32), Utils.ldy(32, a2, 32));
        }
        ctx.fill();
        for (let i = 0; i < SunTurret.frameCount; ++i) {
            SunTurret.images.push(SunTurret.preRenderFrame(c.image, i));
        }
    }
    static preRenderFrame(texture, frame) {
        let offset = frame / SunTurret.frameCount * Angle.deg30;
        let c = new PreRenderedImage(64, 64);
        let ctx = c.ctx;
        ctx.translate(32, 32);
        ctx.drawImage(texture, -32, -32);
        ctx.rotate(offset);
        ctx.drawImage(texture, -32, -32);
        ctx.resetTransform();
        return c.image;
    }
}
class MoonTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
    }
    step(time) {
        super.step(time);
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.drawImage(MoonTurret.image, this.tile.pos.x, this.tile.pos.y);
    }
    addType(type) {
        if (this.type.count() >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
            case TurretElement.Earth:
            case TurretElement.Water:
                this.type.add(type);
                break;
            case TurretElement.Fire:
                this.tile.turret = new ArcaneTurret(this.tile, this.type.add(type));
                break;
        }
    }
    static init() {
        let c = new PreRenderedImage(64, 64);
        MoonTurret.image = c.image;
    }
}
class PlasmaTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.angle = Angle.rand();
    }
    step(time) {
        super.step(time);
        this.angle += time * Angle.deg90;
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.drawImage(PlasmaTurret.image, -32, -32);
        ctx.resetTransform();
    }
    addType(type) {
        if (this.type.count() >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
            case TurretElement.Fire:
            case TurretElement.Water:
                this.type.add(type);
                break;
            case TurretElement.Earth:
                this.tile.turret = new ArcaneTurret(this.tile, this.type.add(type));
                break;
        }
    }
    static init() {
        let tex = new CirclesTextureGenerator(64, 64, RgbaColorSource.fromHex("#889FFF40"), RgbaColorSource.fromHex("#BF9BFF"), RgbaColorSource.fromHex("#889FFF00"), 0.25, 3).generateImage();
        PlasmaTurret.image = tex;
    }
}
class EarthquakeTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
    }
    step(time) {
        super.step(time);
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.drawImage(EarthquakeTurret.image, this.tile.pos.x, this.tile.pos.y);
    }
    addType(type) {
        if (this.type.count() >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new ArcaneTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Earth:
            case TurretElement.Fire:
            case TurretElement.Water:
                this.type.add(type);
                break;
        }
    }
    static init() {
        let c = new PreRenderedImage(64, 64);
        EarthquakeTurret.image = c.image;
    }
}
class ArcaneTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
    }
    step(time) {
        super.step(time);
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.drawImage(ArcaneTurret.image, this.tile.pos.x, this.tile.pos.y);
    }
    addType(type) { }
    static init() {
        let c = new PreRenderedImage(64, 64);
        ArcaneTurret.image = c.image;
    }
}
/// <reference path='turrets.ts'/>
/// <reference path='GameItem.ts'/>
/// <reference path='Utils.ts'/>
/// <reference path="TurretType.ts"/>
/// <reference path="ParticleSystem.ts"/>
var TileType;
/// <reference path='turrets.ts'/>
/// <reference path='GameItem.ts'/>
/// <reference path='Utils.ts'/>
/// <reference path="TurretType.ts"/>
/// <reference path="ParticleSystem.ts"/>
(function (TileType) {
    TileType[TileType["Unknown"] = 0] = "Unknown";
    TileType[TileType["Empty"] = 1] = "Empty";
    TileType[TileType["WallGen"] = 2] = "WallGen";
    TileType[TileType["Tower"] = 3] = "Tower";
    TileType[TileType["Path"] = 4] = "Path";
    TileType[TileType["Spawn"] = 5] = "Spawn";
    TileType[TileType["HQ"] = 6] = "HQ";
})(TileType || (TileType = {}));
class Tile extends GameItem {
    constructor(game, x, y, type, ctx) {
        super(game);
        this.type = type;
        this.turret = null;
        this.pos = new Coords(x, y);
        this.decor = new RenderablePathSet();
        switch (type) {
            case TileType.Empty:
                this.groundFill = ctx.createPattern(Tile.grass, "repeat"); // "#5BA346"
                break;
            case TileType.Path:
                this.groundFill = "#B5947E";
                break;
            case TileType.Spawn:
                let spawnGradient = ctx.createLinearGradient(x, y + 32, x + 64, y + 32);
                spawnGradient.addColorStop(0, "#E77B65");
                spawnGradient.addColorStop(1, "#B5947E");
                this.groundFill = spawnGradient;
                break;
            case TileType.HQ:
                this.groundFill = "#B5947E";
                break;
            case TileType.Tower:
                this.groundFill = "#808080";
                this.turret = new Turret(this);
                break;
        }
        if (this.type === TileType.Path || this.type === TileType.Spawn || this.type === TileType.HQ) {
            let path = new Path2D();
            for (let i = 0; i < 4; ++i) {
                for (let j = 0; j < 4; ++j) {
                    if (Math.random() < 0.25) {
                        let _x = x + i * 16 + 4 + Math.random() * 8;
                        let _y = y + j * 16 + 4 + Math.random() * 8;
                        let radius = 2 + 2 * Math.random();
                        for (let k = 0; k < 4; ++k) {
                            let a = -Angle.deg45 + Angle.deg90 * (k + 0.25 + 0.5 * Math.random());
                            if (k === 0) {
                                path.moveTo(Utils.ldx(radius, a, _x), Utils.ldy(radius, a, _y));
                            }
                            else {
                                path.lineTo(Utils.ldx(radius, a, _x), Utils.ldy(radius, a, _y));
                            }
                        }
                        path.closePath();
                    }
                }
            }
            if (this.type === TileType.Spawn) {
                let gradient = ctx.createLinearGradient(x, y + 32, x + 64, y + 32);
                gradient.addColorStop(0, "#CB5E48");
                gradient.addColorStop(1, "#997761");
                this.decor.pushNew(path, gradient);
            }
            else {
                this.decor.pushNew(path, "#997761");
            }
        }
        else if (this.type === TileType.Empty) {
            let path1 = new Path2D();
            let path2 = new Path2D();
            for (let i = 0; i < 3; ++i) {
                for (let j = 0; j < 3; ++j) {
                    if (Math.random() < 0.25) {
                        let path = Math.random() < 0.5 ? path1 : path2;
                        path.arc(x + 6 + 21 * i + Math.random() * 10, y + 6 + 21 * j + Math.random() * 10, 4 + 2 * Math.random(), 0, Angle.deg360);
                        path.closePath();
                    }
                }
            }
            this.decor.pushNew(path1, "#337F1C");
            this.decor.pushNew(path2, "#479131");
        }
        else if (this.type === TileType.Tower) {
            let path1 = new Path2D();
            path1.moveTo(x, y);
            path1.lineTo(x + 62, y);
            path1.lineTo(x + 62, y + 2);
            path1.lineTo(x + 2, y + 2);
            path1.lineTo(x + 2, y + 62);
            path1.lineTo(x, y + 62);
            path1.closePath();
            this.decor.pushNew(path1, "#A0A0A0");
            let path2 = new Path2D();
            path2.moveTo(x + 62, y + 2);
            path2.lineTo(x + 64, y + 2);
            path2.lineTo(x + 64, y + 64);
            path2.lineTo(x + 2, y + 64);
            path2.lineTo(x + 2, y + 62);
            path2.lineTo(x + 62, y + 62);
            path2.closePath();
            this.decor.pushNew(path2, "#606060");
            let path3 = new Path2D();
            path3.moveTo(x + 56, y + 8);
            path3.lineTo(x + 58, y + 8);
            path3.lineTo(x + 58, y + 58);
            path3.lineTo(x + 8, y + 58);
            path3.lineTo(x + 8, y + 56);
            path3.lineTo(x + 56, y + 56);
            path3.closePath();
            this.decor.pushNew(path3, "#909090");
            let path4 = new Path2D();
            path4.moveTo(x + 6, y + 6);
            path4.lineTo(x + 56, y + 6);
            path4.lineTo(x + 56, y + 8);
            path4.lineTo(x + 8, y + 8);
            path4.lineTo(x + 8, y + 56);
            path4.lineTo(x + 6, y + 56);
            path4.closePath();
            this.decor.pushNew(path4, "#707070");
        }
    }
    step(time) {
        if (this.type === TileType.Tower && this.turret != null) {
            this.turret.step(time);
        }
    }
    render(ctx, preRender) {
        if (preRender) {
            ctx.fillStyle = this.groundFill;
            ctx.fillRect(this.pos.x, this.pos.y, 64, 64);
            this.decor.render(ctx);
        }
        else if (this.type === TileType.Tower && this.turret != null) {
            this.turret.render(ctx, preRender);
            var elems = this.turret.getType().toColorArray();
            var x = this.pos.x + 2;
            var y = this.pos.y + 2;
            for (const c of elems) {
                ctx.fillStyle = c;
                ctx.fillRect(x, y, 4, 4);
                x += 6;
            }
        }
    }
    static init() {
        Tile.grass = new NoiseTextureGenerator(64, 64, RgbaColorSource.fromHex("#5BA346"), 0.075, 0, 0.25).generateImage();
    }
}
class Game {
    constructor(canvas) {
        this.ctx = canvas.getContext("2d");
        this.prevTime = new Date().getTime();
        this.time = 0;
        this.performanceMeter = new PerformanceMeter();
        this.particles = new ParticleSystem(this);
        let canvasWidth = canvas.width;
        let mapWidth = Math.floor(canvasWidth / 64) - 3;
        mapWidth = mapWidth % 2 === 0 ? mapWidth - 1 : mapWidth;
        this.mapWidth = mapWidth < 3 ? 3 : mapWidth;
        this.width = (mapWidth + 3) * 64;
        let canvasHeight = canvas.height;
        let mapHeight = Math.floor(canvasHeight / 64);
        mapHeight = mapHeight % 2 === 0 ? mapHeight - 1 : mapHeight;
        this.mapHeight = mapHeight < 3 ? 3 : mapHeight;
        this.height = mapHeight * 64;
        this.guiPanel = new Rect(this.width - 192, 0, 192, this.height - 192);
    }
    init() {
        Tile.init();
        Turret.init();
        this.generateMap();
        this.generateCastle();
        this.preRender();
    }
    generateMap() {
        let mapGen = [];
        this.map = [];
        let dijkstraMap = [];
        let wallGens = new Set();
        for (let x = 0; x < this.mapWidth; ++x) {
            var columnDijkstra = [];
            var columnGen = [];
            var column = [];
            for (let y = 0; y < this.mapHeight; ++y) {
                if (x === 0 || x === this.mapWidth - 1 || y === 0 || y === this.mapHeight - 1) {
                    columnGen.push(TileType.Empty);
                }
                else if (x % 2 === 0 && y % 2 === 0) {
                    columnGen.push(TileType.WallGen);
                    wallGens.add(new Coords(x, y));
                }
                else {
                    columnGen.push(TileType.Unknown);
                }
                column.push(null);
                columnDijkstra.push(null);
            }
            mapGen.push(columnGen);
            dijkstraMap.push(columnDijkstra);
            this.map.push(column);
        }
        while (wallGens.size > 0) {
            let wg;
            let i = Math.random() * wallGens.size;
            for (const _wg of wallGens.values()) {
                if (i < 1) {
                    wg = _wg;
                    break;
                }
                else {
                    i -= 1;
                }
            }
            wallGens.delete(wg);
            if (mapGen[wg.x][wg.y] !== TileType.WallGen) {
                continue;
            }
            let x = wg.x;
            let y = wg.y;
            switch (Math.floor(Math.random() * 4)) {
                case 0:
                    for (; x < this.mapWidth && mapGen[x][y] !== TileType.Empty; ++x) {
                        mapGen[x][y] = TileType.Empty;
                    }
                    break;
                case 1:
                    for (; y < this.mapHeight && mapGen[x][y] !== TileType.Empty; ++y) {
                        mapGen[x][y] = TileType.Empty;
                    }
                    break;
                case 2:
                    for (; x >= 0 && mapGen[x][y] !== TileType.Empty; --x) {
                        mapGen[x][y] = TileType.Empty;
                    }
                    break;
                case 3:
                    for (; y >= 0 && mapGen[x][y] !== TileType.Empty; --y) {
                        mapGen[x][y] = TileType.Empty;
                    }
                    break;
            }
        }
        let startY = 1 + 2 * Math.floor((this.mapHeight - 1) / 2 * Math.random());
        let endY = this.mapHeight - 2;
        let startNode = new DijkstraNode(1, startY, null);
        dijkstraMap[1][0] = startNode;
        let queue = [dijkstraMap[1][0]];
        while (queue.length > 0) {
            let dn = queue.shift();
            let x = dn.pos.x;
            let y = dn.pos.y;
            if (x === this.mapWidth - 2 && y === endY) {
                do {
                    mapGen[dn.pos.x][dn.pos.y] = TileType.Path;
                    dn = dn.previous;
                } while (dn != null);
                break;
            }
            if (x > 1 && dijkstraMap[x - 1][y] === null && mapGen[x - 1][y] === TileType.Unknown) {
                let node = new DijkstraNode(x - 1, y, dn);
                dijkstraMap[x - 1][y] = node;
                queue.push(node);
            }
            if (y > 0 && dijkstraMap[x][y - 1] === null && mapGen[x][y - 1] === TileType.Unknown) {
                let node = new DijkstraNode(x, y - 1, dn);
                dijkstraMap[x][y - 1] = node;
                queue.push(node);
            }
            if (x < this.mapWidth - 2 && dijkstraMap[x + 1][y] === null && mapGen[x + 1][y] === TileType.Unknown) {
                let node = new DijkstraNode(x + 1, y, dn);
                dijkstraMap[x + 1][y] = node;
                queue.push(node);
            }
            if (y < this.mapHeight - 1 && dijkstraMap[x][y + 1] === null && mapGen[x][y + 1] === TileType.Unknown) {
                let node = new DijkstraNode(x, y + 1, dn);
                dijkstraMap[x][y + 1] = node;
                queue.push(node);
            }
        }
        mapGen[0][startY] = TileType.Spawn;
        mapGen[this.mapWidth - 1][endY] = TileType.HQ;
        for (let x = 0; x < this.mapWidth; ++x) {
            for (let y = 0; y < this.mapHeight; ++y) {
                if (mapGen[x][y] === TileType.Spawn) {
                    this.map[x][y] = new Tile(this, x * 64, y * 64, TileType.Spawn, this.ctx);
                }
                else if (mapGen[x][y] === TileType.HQ) {
                    this.map[x][y] = new Tile(this, x * 64, y * 64, TileType.HQ, this.ctx);
                }
                else if (mapGen[x][y] === TileType.Path) {
                    this.map[x][y] = new Tile(this, x * 64, y * 64, TileType.Path, this.ctx);
                }
                else if ((x > 0 && mapGen[x - 1][y] === TileType.Path) ||
                    (y > 0 && mapGen[x][y - 1] === TileType.Path) ||
                    (x < this.mapWidth - 1 && mapGen[x + 1][y] === TileType.Path) ||
                    (y < this.mapHeight - 1 && mapGen[x][y + 1] === TileType.Path) ||
                    (x > 0 && y > 0 && mapGen[x - 1][y - 1] === TileType.Path) ||
                    (x < this.mapWidth - 1 && y > 0 && mapGen[x + 1][y - 1] === TileType.Path) ||
                    (x > 0 && y < this.mapHeight - 1 && mapGen[x - 1][y + 1] === TileType.Path) ||
                    (x < this.mapWidth - 1 && y < this.mapHeight - 1 && mapGen[x + 1][y + 1] === TileType.Path)) {
                    this.map[x][y] = new Tile(this, x * 64, y * 64, TileType.Tower, this.ctx);
                    let r = Math.random();
                    /*if (r < 0.8) {
                        this.map[x][y].turret.addType(TurretElement.Water)
                    }
                    if (r < 0.6) {
                        this.map[x][y].turret.addType(TurretElement.Water)
                    }
                    if (r < 0.4) {
                        this.map[x][y].turret.addType(TurretElement.Water)
                    }
                    if (r < 0.2) {
                        this.map[x][y].turret.addType(TurretElement.Water)
                    }*/
                    let t = this.map[x][y].turret;
                    if (r < 0.2) {
                        t.addType(TurretElement.Air);
                    }
                    else if (r < 0.4) {
                        t.addType(TurretElement.Earth);
                    }
                    else if (r < 0.6) {
                        t.addType(TurretElement.Fire);
                    }
                    else if (r < 0.8) {
                        t.addType(TurretElement.Water);
                    }
                    r = Math.random();
                    t = this.map[x][y].turret;
                    if (r < 0.15) {
                        t.addType(TurretElement.Air);
                    }
                    else if (r < 0.3) {
                        t.addType(TurretElement.Earth);
                    }
                    else if (r < 0.45) {
                        t.addType(TurretElement.Fire);
                    }
                    else if (r < 0.6) {
                        t.addType(TurretElement.Water);
                    }
                    r = Math.random();
                    t = this.map[x][y].turret;
                    if (r < 0.1) {
                        t.addType(TurretElement.Air);
                    }
                    else if (r < 0.2) {
                        t.addType(TurretElement.Earth);
                    }
                    else if (r < 0.3) {
                        t.addType(TurretElement.Fire);
                    }
                    else if (r < 0.4) {
                        t.addType(TurretElement.Water);
                    }
                    r = Math.random();
                    t = this.map[x][y].turret;
                    if (r < 0.05) {
                        t.addType(TurretElement.Air);
                    }
                    else if (r < 0.1) {
                        t.addType(TurretElement.Earth);
                    }
                    else if (r < 0.15) {
                        t.addType(TurretElement.Fire);
                    }
                    else if (r < 0.2) {
                        t.addType(TurretElement.Water);
                    }
                }
                else {
                    this.map[x][y] = new Tile(this, x * 64, y * 64, TileType.Empty, this.ctx);
                }
            }
        }
    }
    generateCastle() {
        this.castle = new RenderablePathSet();
        let x = this.guiPanel.x;
        let y = this.height - 192;
        let path1 = new Path2D();
        path1.rect(x + 36, y + 36, 120, 120);
        let tex = new CellularTextureGenerator(192, 192, 144, RgbaColorSource.fromHex("#82614F"), RgbaColorSource.fromHex("#997663"), CellularTextureType.Balls);
        this.castle.pushNew(path1, this.ctx.createPattern(tex.generateImage(), "repeat"));
        let path2 = new Path2D();
        path2.rect(x + 6, y + 6, 60, 60);
        path2.rect(x + 126, y + 6, 60, 60);
        path2.rect(x + 6, y + 126, 60, 60);
        path2.rect(x + 126, y + 126, 60, 60);
        path2.rect(x + 30, y + 66, 12, 60);
        path2.rect(x + 66, y + 30, 60, 12);
        path2.rect(x + 150, y + 66, 12, 60);
        path2.rect(x + 66, y + 150, 60, 12);
        this.castle.pushNew(path2, "#505050");
        let path3 = new Path2D();
        path3.rect(x + 18, y + 18, 36, 36);
        path3.rect(x + 138, y + 18, 36, 36);
        path3.rect(x + 18, y + 138, 36, 36);
        path3.rect(x + 138, y + 138, 36, 36);
        this.castle.pushNew(path3, "#404040");
        let path4 = new Path2D();
        path4.rect(x + 6, y + 6, 12, 12);
        path4.rect(x + 30, y + 6, 12, 12);
        path4.rect(x + 54, y + 6, 12, 12);
        path4.rect(x + 126, y + 6, 12, 12);
        path4.rect(x + 150, y + 6, 12, 12);
        path4.rect(x + 174, y + 6, 12, 12);
        path4.rect(x + 6, y + 30, 12, 12);
        path4.rect(x + 54, y + 30, 12, 12);
        path4.rect(x + 78, y + 30, 12, 12);
        path4.rect(x + 102, y + 30, 12, 12);
        path4.rect(x + 126, y + 30, 12, 12);
        path4.rect(x + 174, y + 30, 12, 12);
        path4.rect(x + 6, y + 54, 12, 12);
        path4.rect(x + 30, y + 54, 12, 12);
        path4.rect(x + 54, y + 54, 12, 12);
        path4.rect(x + 126, y + 54, 12, 12);
        path4.rect(x + 150, y + 54, 12, 12);
        path4.rect(x + 174, y + 54, 12, 12);
        path4.rect(x + 30, y + 78, 12, 12);
        path4.rect(x + 150, y + 78, 12, 12);
        path4.rect(x + 30, y + 102, 12, 12);
        path4.rect(x + 150, y + 102, 12, 12);
        path4.rect(x + 6, y + 126, 12, 12);
        path4.rect(x + 30, y + 126, 12, 12);
        path4.rect(x + 54, y + 126, 12, 12);
        path4.rect(x + 126, y + 126, 12, 12);
        path4.rect(x + 150, y + 126, 12, 12);
        path4.rect(x + 174, y + 126, 12, 12);
        path4.rect(x + 6, y + 150, 12, 12);
        path4.rect(x + 54, y + 150, 12, 12);
        path4.rect(x + 78, y + 150, 12, 12);
        path4.rect(x + 102, y + 150, 12, 12);
        path4.rect(x + 126, y + 150, 12, 12);
        path4.rect(x + 174, y + 150, 12, 12);
        path4.rect(x + 6, y + 174, 12, 12);
        path4.rect(x + 30, y + 174, 12, 12);
        path4.rect(x + 54, y + 174, 12, 12);
        path4.rect(x + 126, y + 174, 12, 12);
        path4.rect(x + 150, y + 174, 12, 12);
        path4.rect(x + 174, y + 174, 12, 12);
        this.castle.pushNew(path4, "#606060");
    }
    run() {
        this.step();
        this.render();
    }
    step() {
        let time = new Date().getTime();
        let timeDiff = (time - this.prevTime) / 1000;
        this.performanceMeter.add(1 / timeDiff);
        for (let x = 0; x < this.mapWidth; ++x) {
            for (let y = 0; y < this.mapHeight; ++y) {
                this.map[x][y].step(timeDiff);
            }
        }
        this.particles.step(timeDiff);
        this.prevTime = time;
        this.time += timeDiff;
    }
    preRender() {
        let c = new PreRenderedImage(this.width, this.height);
        let tex1 = new PerlinNoiseTextureGenerator(this.width / 4, this.height / 2, RgbaColorSource.fromHex("#2020FF"), RgbaColorSource.fromHex("#C0FFFF")).generateImage();
        let tex2 = new CloudsTextureGenerator(this.width / 4, this.height / 2, RgbaColorSource.fromHex("#2020FF"), RgbaColorSource.fromHex("#C0FFFF")).generateImage();
        let tex3 = new VelvetTextureGenerator(this.width / 4, this.height / 2, RgbaColorSource.fromHex("#2020FF"), RgbaColorSource.fromHex("#C0FFFF")).generateImage();
        let tex4 = new GlassTextureGenerator(this.width / 4, this.height / 2, RgbaColorSource.fromHex("#2020FF"), RgbaColorSource.fromHex("#C0FFFF")).generateImage();
        let tex5 = new BarkTextureGenerator(this.width / 4, this.height / 2, RgbaColorSource.fromHex("#2020FF"), RgbaColorSource.fromHex("#C0FFFF")).generateImage();
        let tex6 = new CirclesTextureGenerator(this.width / 4, this.height / 2, RgbaColorSource.fromHex("#5050FF"), RgbaColorSource.fromHex("#90C0FF"), RgbaColorSource.fromHex("#5050FF00"), 1, 4).generateImage();
        let tex7 = new FrostedGlassTextureGenerator(this.width / 4, this.height / 2, RgbaColorSource.fromHex("#2020FF"), RgbaColorSource.fromHex("#C0FFFF")).generateImage();
        let tex8 = new CamouflageTextureGenerator(this.width / 4, this.height / 2, RgbaColorSource.fromHex("#2020FF"), RgbaColorSource.fromHex("#C0FFFF")).generateImage();
        c.ctx.drawImage(tex1, 0, 0);
        c.ctx.drawImage(tex2, this.width / 4, 0);
        c.ctx.drawImage(tex3, this.width / 2, 0);
        c.ctx.drawImage(tex4, this.width / 4 * 3, 0);
        c.ctx.drawImage(tex5, 0, this.height / 2);
        c.ctx.drawImage(tex6, this.width / 4, this.height / 2);
        c.ctx.drawImage(tex7, this.width / 2, this.height / 2);
        c.ctx.drawImage(tex8, this.width / 4 * 3, this.height / 2);
        /*c.ctx.fillStyle = "#C0C0C0"
        c.ctx.fillRect(0, 0, this.width, this.height)
        for (let x = 0; x < this.mapWidth; ++x) {
            for (let y = 0; y < this.mapHeight; ++y) {
                this.map[x][y].render(c.ctx, true)
            }
        }
        c.ctx.fillStyle = "#B5947E"
        c.ctx.fillRect(this.guiPanel.x, this.height - 192, 192, 192)
        c.ctx.fillStyle = "#606060"
        c.ctx.fillRect(this.guiPanel.x, this.guiPanel.y, 2, this.guiPanel.h)
        c.ctx.fillRect(this.guiPanel.x, this.guiPanel.y + this.guiPanel.h - 2, this.guiPanel.w, 2)
        this.castle.render(c.ctx)*/
        c.saveImage("textures");
        this.preRendered = c.image;
    }
    render() {
        this.ctx.drawImage(this.preRendered, 0, 0);
        /*for (let x = 0; x < this.mapWidth; ++x) {
            for (let y = 0; y < this.mapHeight; ++y) {
                this.map[x][y].render(this.ctx, false)
            }
        }
        this.particles.render(this.ctx, false)
        let fps = this.performanceMeter.getFps()
        if (!isNaN(fps)) {
            this.ctx.fillStyle = "#000000"
            this.ctx.textAlign = "right"
            this.ctx.textBaseline = "top"
            this.ctx.font = "bold 16px serif"
            this.ctx.fillText(Math.floor(fps).toString(), this.guiPanel.x + this.guiPanel.w - 16, this.guiPanel.y + 16)
        }*/
    }
}
/// <reference path='Game.ts'/>
let game = null;
function gameLoop() {
    window.requestAnimationFrame(gameLoop);
    game.run();
}
window.onload = () => {
    game = new Game($("#game-canvas").get(0));
    game.init();
    gameLoop();
};
//# sourceMappingURL=game.js.map