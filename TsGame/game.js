class Utils {
    static sign(value) {
        return value < 0 ? -1 : value > 0 ? 1 : 0;
    }
    static clamp(value, min, max) {
        return value > max ? max : value < min ? min : value;
    }
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
    static granulate(value, steps) {
        return Math.floor(value * steps) / steps + 1 / steps / 2;
    }
    static euclideanDistance(dx, dy) {
        return Math.sqrt(dx * dx + dy * dy);
    }
    static manhattanDistance(dx, dy) {
        return Math.abs(dx) + Math.abs(dy);
    }
    static chebyshevDistance(dx, dy) {
        return Math.max(Math.abs(dx), Math.abs(dy));
    }
    static minkowskiDistance(dx, dy) {
        let d = Math.sqrt(Math.abs(dx)) + Math.sqrt(Math.abs(dy));
        return d * d;
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
        return new Vec2(startX + distance * Math.cos(direction), startY + distance * Math.sin(direction));
    }
    static rotatePoint(x, y, originX, originY, angle) {
        x -= originX;
        y -= originY;
        let c = Math.cos(angle), s = Math.sin(angle);
        return new Vec2(x * c - y * s + originX, x * s + y * c + originY);
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
    static rand(min, max) {
        if (max <= min) {
            return min;
        }
        return Math.random() * (max - min) + min;
    }
    static randInt(min, max) {
        if (max <= min) {
            return min;
        }
        return Math.floor(Math.random() * (max - min) + min);
    }
    static isString(obj) {
        return typeof obj === 'string' || obj instanceof String;
    }
    static getImageFromCache(id) {
        return new Promise((resolve, reject) => {
            let data = localStorage.getItem(id);
            if (data) {
                let img = new Image();
                img.onload = () => {
                    console.log(`Restored ${id} from cache`);
                    resolve(img);
                };
                img.src = "data:image/png;base64," + data;
            }
            else
                reject();
        });
    }
}
Utils.hex = "0123456789abcdef";
var MouseButton;
(function (MouseButton) {
    MouseButton[MouseButton["Left"] = 0] = "Left";
    MouseButton[MouseButton["Middle"] = 1] = "Middle";
    MouseButton[MouseButton["Right"] = 2] = "Right";
    MouseButton[MouseButton["Back"] = 3] = "Back";
    MouseButton[MouseButton["Forward"] = 4] = "Forward";
})(MouseButton || (MouseButton = {}));
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
    constructor(paths) {
        this.paths = paths === undefined ? [] : paths;
    }
    push(path) {
        this.paths.push(path);
    }
    pushNew(path, fill) {
        if (fill === null) {
            return;
        }
        this.paths.push(new RenderablePath(path, fill));
    }
    render(ctx) {
        for (let i = 0; i < this.paths.length; ++i) {
            this.paths[i].render(ctx);
        }
    }
    pushPolygon(points, fill, originX = 0, originY = 0) {
        if (fill === null || points.length % 2 !== 0 || points.length < 6) {
            return;
        }
        let path = new Path2D();
        path.moveTo(originX + points[0], originY + points[1]);
        for (let i = 2; i < points.length; i += 2) {
            path.lineTo(originX + points[i], originY + points[i + 1]);
        }
        path.closePath();
        this.paths.push(new RenderablePath(path, fill));
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
    cacheImage(id) {
        if (Game.saveImages) {
            let a = document.createElement("a");
            a.setAttribute("download", id + ".png");
            a.setAttribute("href", this.image
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream"));
            a.setAttribute("target", "_blank");
            a.click();
            let element = document.createElement('a');
            element.setAttribute('download', id + ".txt");
            element.setAttribute('href', 'data:text/octet-stream;charset=utf-8,' + encodeURIComponent(this.toBase64()));
            element.click();
        }
    }
    toBase64() {
        return this.image
            .toDataURL("image/png")
            .replace(/^data:image\/png;base64,/, "");
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
    addu(x, y) {
        return new Vec2(this.x + x, this.y + y);
    }
    sub(v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    }
    subu(x, y) {
        return new Vec2(this.x - x, this.y - y);
    }
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    dotu(x, y) {
        return this.x * x + this.y * y;
    }
    mul(f) {
        return new Vec2(this.x * f, this.y * f);
    }
    angleTo(v) {
        return Utils.getAngle(this.x, this.y, v.x, v.y);
    }
    length() {
        if (this.len === null) {
            this.len = Math.sqrt(this.x * this.x + this.y * this.y);
        }
        return this.len;
    }
    normalize() {
        let m = 1 / this.length();
        return new Vec2(this.x * m, this.y * m);
    }
    isZero() {
        return this.x === 0 && this.y === 0;
    }
    equals(v) {
        return this.x === v.x && this.y === v.y;
    }
    toString() {
        return `${this.x};${this.y}`;
    }
    static randUnit() {
        let a = Angle.rand();
        return new Vec2(Utils.ldx(1, a), Utils.ldy(1, a));
    }
    static randUnit3d() {
        let a = Angle.rand(), a2 = Angle.rand();
        let len = Utils.ldx(1, a2);
        return new Vec2(Utils.ldx(len, a), Utils.ldy(len, a));
    }
    static init() {
        Vec2.zero = new Vec2(0, 0);
    }
}
Vec2.init();
class DijkstraNode {
    constructor(x, y, previous) {
        if (previous === undefined) {
            this.previous = null;
            this.distance = 0;
        }
        else {
            this.previous = previous;
            this.distance = previous.distance + 1;
        }
        this.pos = new Vec2(x, y);
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
class Curve {
    static linear(x) { return x; }
    static arc(x) { return Math.sqrt(x * (2 - x)); }
    static invArc(x) { return 1 - Math.sqrt(1 - x * x); }
    static sqr(x) { return x * x; }
    static sqrt(x) { return Math.sqrt(x); }
    static sin(x) { return (1 - Math.cos(x * Math.PI)) * 0.5; }
}
class ColorSource {
    constructor(width, height) {
        this.width = Math.max(1, Math.floor(width));
        this.height = Math.max(1, Math.floor(height));
    }
    getColor(x, y) {
        return this._getColor(Utils.wrap(x, 0, this.width), Utils.wrap(y, 0, this.height));
    }
    generateInto(ctx, x, y) {
        for (let _x = 0; _x < this.width; ++_x) {
            for (let _y = 0; _y < this.height; ++_y) {
                ctx.fillStyle = this._getColor(_x, _y).toCss();
                ctx.fillRect(x + _x, y + _y, 1, 1);
            }
        }
    }
    generatePrImage() {
        let tex = new PreRenderedImage(this.width, this.height);
        this.generateInto(tex.ctx, 0, 0);
        return tex;
    }
    generateImage() { return this.generatePrImage().image; }
    static get(color) {
        if (color === null) {
            return RgbaColor.transparent.source();
        }
        else if (color instanceof ColorSource) {
            return color;
        }
        else if (color instanceof RgbaColor) {
            return color.source();
        }
        else if (Utils.isString(color)) {
            return RgbaColor.fromHex(color).source();
        }
        else {
            return RgbaColor.transparent.source();
        }
    }
}
class BufferedColorSource extends ColorSource {
    constructor(width, height, source, scale = 1) {
        super(width, height);
        this.data = [];
        let inverseScale = 1 / scale;
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                this.data.push(source.getColor(x * inverseScale, y * inverseScale));
            }
        }
    }
    _getColor(x, y) {
        x = Math.floor(x);
        y = Math.floor(y);
        return this.data[Utils.flatten(this.width, x, y)];
    }
    generateInto(ctx, x, y) {
        for (let _y = 0; _y < this.height; ++_y) {
            for (let _x = 0; _x < this.width; ++_x) {
                ctx.fillStyle = this.data[Utils.flatten(this.width, _x, _y)].toCss();
                ctx.fillRect(x + _x, y + _y, 1, 1);
            }
        }
    }
}
class CanvasColorSource extends ColorSource {
    constructor(canvas, buffer = false) {
        super(canvas.width, canvas.height);
        this.ctx = canvas.getContext("2d");
        if (buffer) {
            let data = this.ctx.getImageData(0, 0, this.width, this.height).data;
            this.data = [];
            let c = this.width * this.height * 4;
            for (let i = 0; i < c; i += 4) {
                this.data.push(new RgbaColor(data[i], data[i + 1], data[i + 2], data[i + 3]));
            }
        }
        else {
            this.data = null;
        }
    }
    _getColor(x, y) {
        x = Math.floor(x);
        y = Math.floor(y);
        if (this.data) {
            return this.data[Utils.flatten(this.width, x, y)];
        }
        else {
            var data = this.ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
            return new RgbaColor(data[0], data[1], data[2], data[3]);
        }
    }
    generateInto(ctx, x, y) {
        ctx.drawImage(this.ctx.canvas, 0, 0);
    }
}
class RgbaColor {
    constructor(r, g, b, a = 255) {
        this.r = Math.floor(Utils.clamp(r, 0, 255));
        this.g = Math.floor(Utils.clamp(g, 0, 255));
        this.b = Math.floor(Utils.clamp(b, 0, 255));
        this.a = Math.floor(Utils.clamp(a, 0, 255));
    }
    static fromHex(color) {
        if (/^#[0-9a-f]{3}[0-9a-f]?$/i.test(color)) {
            let a = color.length > 4 ? parseInt(color[4], 16) * 17 : 255;
            return new RgbaColor(parseInt(color[1], 16) * 17, parseInt(color[2], 16) * 17, parseInt(color[3], 16) * 17, a);
        }
        else if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(color)) {
            let a = color.length > 7 ? parseInt(color.substr(7, 2), 16) : 255;
            return new RgbaColor(parseInt(color.substr(1, 2), 16), parseInt(color.substr(3, 2), 16), parseInt(color.substr(5, 2), 16), a);
        }
        else
            throw new Error("Invalid color format");
    }
    pr() { return this.r * this.a / 255; }
    pg() { return this.g * this.a / 255; }
    pb() { return this.b * this.a / 255; }
    pa() { return this.a * this.a / 255; }
    multiplyFloat(ammount, multiplyAlpha = false) {
        return new RgbaColor(this.r * ammount, this.g * ammount, this.b * ammount, multiplyAlpha ? this.a * ammount : this.a);
    }
    multiply(c) {
        return new RgbaColor(this.r * c.r, this.g * c.g, this.b * c.b, this.a * c.a);
    }
    add(c) {
        let a = false;
        if (a) {
            console.log(`${this} + ${c} = ${new RgbaColor(this.r + c.pr(), this.g + c.pg(), this.b + c.pb(), this.a + c.pa())}`);
        }
        return new RgbaColor(this.r + c.pr(), this.g + c.pg(), this.b + c.pb(), this.a + c.pa());
    }
    blend(c) {
        if (this.a === 0) {
            return c.a === 0 ? this : c;
        }
        else if (c.a === 0) {
            return this;
        }
        else {
            return new RgbaColor(this.r + c.pr(), this.g + c.pg(), this.b + c.pb(), this.a + c.a * (255 - this.a) / 255);
        }
    }
    withRed(r) { return new RgbaColor(r, this.g, this.b, this.a); }
    withGreen(g) { return new RgbaColor(this.r, g, this.b, this.a); }
    withBlue(b) { return new RgbaColor(this.r, this.g, b, this.a); }
    withAlpha(a) { return new RgbaColor(this.r, this.g, this.b, a); }
    lerp(c, ammount) {
        if (ammount >= 1) {
            return c;
        }
        else if (ammount <= 0) {
            return this;
        }
        else {
            let a2 = 1 - ammount;
            return new RgbaColor(this.r * a2 + c.r * ammount, this.g * a2 + c.g * ammount, this.b * a2 + c.b * ammount, this.a * a2 + c.a * ammount);
        }
    }
    addNoise(intensity, saturation, coverage) {
        if (Math.random() < coverage) {
            intensity *= 255;
            if (saturation <= 0) {
                let n = Utils.rand(-intensity, intensity);
                return new RgbaColor(this.r + n, this.g + n, this.b + n, this.a);
            }
            else if (saturation >= 1) {
                return new RgbaColor(this.r + Utils.rand(-intensity, intensity), this.g + Utils.rand(-intensity, intensity), this.b + Utils.rand(-intensity, intensity), this.a);
            }
            else {
                let s2 = 1 - saturation;
                let rn = Utils.rand(-intensity, intensity);
                let gn = saturation * Utils.rand(-intensity, intensity) + s2 * rn;
                let bn = saturation * Utils.rand(-intensity, intensity) + s2 * rn;
                return new RgbaColor(this.r + rn, this.g + gn, this.b + bn, this.a);
            }
        }
        else {
            return this;
        }
    }
    source(width = 1, height = 1) {
        return new RgbaColorSource(this, width, height);
    }
    toCss() {
        return "#"
            + Utils.byteToHex(this.r)
            + Utils.byteToHex(this.g)
            + Utils.byteToHex(this.b)
            + Utils.byteToHex(this.a);
    }
    toString() {
        return `rgba(${this.r},${this.g},${this.b},${this.a / 255})`;
    }
    static init() {
        RgbaColor.transparent = new RgbaColor(0, 0, 0, 0);
        RgbaColor.black = new RgbaColor(0, 0, 0);
        RgbaColor.red = new RgbaColor(255, 0, 0);
        RgbaColor.green = new RgbaColor(0, 255, 0);
        RgbaColor.blue = new RgbaColor(0, 0, 255);
        RgbaColor.yellow = new RgbaColor(255, 255, 0);
        RgbaColor.cyan = new RgbaColor(0, 255, 255);
        RgbaColor.magenta = new RgbaColor(255, 0, 255);
        RgbaColor.white = new RgbaColor(255, 255, 255);
    }
}
RgbaColor.init();
class RgbaColorSource extends ColorSource {
    constructor(color, width = 1, height = 1) {
        super(width, height);
        this.color = color;
    }
    _getColor(x, y) { return this.color; }
    generateInto(ctx, x, y) {
        ctx.fillStyle = this.color.toCss();
        ctx.fillRect(x, y, this.width, this.height);
    }
}
class TextureGenerator extends ColorSource {
    constructor(width, height, color) {
        super(width, height);
        this.color = ColorSource.get((color !== null && color !== void 0 ? color : RgbaColor.black));
    }
}
var CellularTextureType;
(function (CellularTextureType) {
    CellularTextureType[CellularTextureType["Cells"] = 0] = "Cells";
    CellularTextureType[CellularTextureType["Net"] = 1] = "Net";
    CellularTextureType[CellularTextureType["Balls"] = 2] = "Balls";
})(CellularTextureType || (CellularTextureType = {}));
var CellularTextureDistanceMetric;
(function (CellularTextureDistanceMetric) {
    CellularTextureDistanceMetric[CellularTextureDistanceMetric["Euclidean"] = 0] = "Euclidean";
    CellularTextureDistanceMetric[CellularTextureDistanceMetric["Manhattan"] = 1] = "Manhattan";
    CellularTextureDistanceMetric[CellularTextureDistanceMetric["Chebyshev"] = 2] = "Chebyshev";
    CellularTextureDistanceMetric[CellularTextureDistanceMetric["Minkowski"] = 3] = "Minkowski";
})(CellularTextureDistanceMetric || (CellularTextureDistanceMetric = {}));
class CellularTextureGenerator extends TextureGenerator {
    constructor(width, height, density, color1, color2, type = CellularTextureType.Cells, metric = CellularTextureDistanceMetric.Euclidean, curve) {
        super(width, height, color1);
        this.color2 = ColorSource.get((color2 !== null && color2 !== void 0 ? color2 : RgbaColor.white));
        this.type = type;
        let distance;
        switch (metric) {
            case CellularTextureDistanceMetric.Euclidean:
                distance = Utils.euclideanDistance;
                break;
            case CellularTextureDistanceMetric.Manhattan:
                distance = Utils.manhattanDistance;
                break;
            case CellularTextureDistanceMetric.Chebyshev:
                distance = Utils.chebyshevDistance;
                break;
            case CellularTextureDistanceMetric.Minkowski:
                distance = Utils.minkowskiDistance;
                break;
        }
        this.density = Math.max(1, density);
        this.curve = (curve !== null && curve !== void 0 ? curve : Curve.linear);
        let points = [];
        let pointCount = this.width * this.height / this.density;
        if (pointCount < 2) {
            pointCount = 2;
        }
        for (let i = 0; i < pointCount; ++i) {
            points[i] = new Vec2(Math.random() * this.width, Math.random() * this.height);
        }
        this.distances = [];
        this.min = Infinity;
        let max = 0, i, d;
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                let { min1, min2 } = CellularTextureGenerator.distancesTo2Nearest(x, y, this.width, this.height, points, distance);
                switch (this.type) {
                    case CellularTextureType.Net:
                        d = min2 - min1;
                        break;
                    case CellularTextureType.Balls:
                        d = min2 * min1;
                        break;
                    default:
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
    static wrappedDistance(x, y, width, height, b, distance) {
        let dx = Math.abs(x - b.x);
        let dy = Math.abs(y - b.y);
        if (dx > width / 2) {
            dx = width - dx;
        }
        if (dy > height / 2) {
            dy = height - dy;
        }
        return distance(dx, dy);
    }
    static distancesTo2Nearest(x, y, width, height, points, distance) {
        let min1 = Infinity;
        let min2 = Infinity;
        for (const p of points) {
            let d = CellularTextureGenerator.wrappedDistance(x, y, width, height, p, distance);
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
        x = Math.round(x);
        y = Math.round(y);
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), this.curve((this.distances[Utils.flatten(this.width, x, y)] - this.min) / this.range));
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
            this.cache[i] = this.color.getColor(x, y).addNoise(this.intensity, this.saturation, this.coverage);
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
    constructor(width, height, color1, color2, scale = 1, curve) {
        super(width, height, color1);
        this.color2 = ColorSource.get((color2 !== null && color2 !== void 0 ? color2 : RgbaColor.white));
        this.scale = 1 / (scale * 32);
        this.curve = (curve !== null && curve !== void 0 ? curve : Curve.linear);
    }
    dotGridGradient(gradient, ix, iy, x, y) {
        return gradient.get(ix, iy).dotu(x - ix, y - iy);
    }
    perlin(gradient, x, y) {
        let x0 = Math.floor(x);
        let x1 = x0 + 1;
        let y0 = Math.floor(y);
        let y1 = y0 + 1;
        let sx = x - x0;
        let sy = y - y0;
        return Utils.interpolateSmooth(Utils.interpolateSmooth(this.dotGridGradient(gradient, x0, y0, x, y), this.dotGridGradient(gradient, x1, y0, x, y), sx), Utils.interpolateSmooth(this.dotGridGradient(gradient, x0, y1, x, y), this.dotGridGradient(gradient, x1, y1, x, y), sx), sy) * 1.428;
    }
}
class PerlinNoiseTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, scale = 1, curve) {
        super(width, height, color1, color2, scale, curve);
        this.gradient = new PerlinGradient(this.width * this.scale, this.height * this.scale);
    }
    _getColor(x, y) {
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), this.curve(this.perlin(this.gradient, x * this.scale, y * this.scale) / 2 + 0.5));
    }
}
class CloudsTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, scale = 1, curve) {
        super(width, height, color1, color2, scale, curve);
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
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), this.curve(v / 2 + 0.5));
    }
}
class VelvetTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, scale = 1, curve) {
        super(width, height, color1, color2, scale, curve);
        this.gradients = [];
        let w = this.width * this.scale, h = this.height * this.scale;
        for (let i = 0; i < 3; ++i) {
            this.gradients.push(new PerlinGradient(w, h));
        }
    }
    _getColor(x, y) {
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), this.curve(this.perlin(this.gradients[0], x * this.scale + this.perlin(this.gradients[1], x * this.scale, y * this.scale), y * this.scale + this.perlin(this.gradients[2], x * this.scale, y * this.scale)) / 2 + 0.5));
    }
}
class GlassTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, scale = 1, turbulence = 1, curve) {
        super(width, height, color1, color2, scale, curve);
        this.turbulence = 0.125 * turbulence;
        this.gradients = [];
        let w = this.width * this.scale, h = this.height * this.scale;
        for (let i = 0; i < 3; ++i) {
            this.gradients.push(new PerlinGradient(w, h));
        }
    }
    _getColor(x, y) {
        let _x = Math.cos((this.perlin(this.gradients[1], x * this.scale, y * this.scale) * 128 + 128) * this.turbulence);
        let _y = Math.sin((this.perlin(this.gradients[2], x * this.scale, y * this.scale) * 128 + 128) * this.turbulence);
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), this.curve(this.perlin(this.gradients[0], x * this.scale + _x, y * this.scale + _y) / 2 + 0.5));
    }
}
class FrostedGlassTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, scale = 1, curve) {
        super(width, height, color1, color2, scale, curve);
        this.scales = [this.scale, this.scale * 2, this.scale * 4];
        this.coeficients = [0.5, 0.25, 0.25];
        this.gradients = [];
        for (let i = 0; i < 7; ++i) {
            this.gradients.push(new PerlinGradient(this.width * this.scales[i % 3], this.height * this.scales[i % 3]));
        }
    }
    _getColor(x, y) {
        let _x = x * this.scale, _y = y * this.scale;
        for (let i = 0; i < 3; ++i) {
            _x += this.perlin(this.gradients[i], x * this.scales[i], y * this.scales[i]) * this.coeficients[i];
            _y += this.perlin(this.gradients[i + 3], x * this.scales[i], y * this.scales[i]) * this.coeficients[i];
        }
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), this.curve(this.perlin(this.gradients[6], _x, _y) / 2 + 0.5));
    }
}
class BarkTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, scale = 1, turbulence = 1, curve) {
        super(width, height, color1, color2, scale, curve);
        this.scales = [this.scale, this.scale * 2, this.scale * 4, this.scale * 6];
        this.coeficients = [0.5, 0.25, 0.25];
        this.turbulence = turbulence;
        this.gradients = [];
        for (let i = 0; i < 4; ++i) {
            this.gradients.push(new PerlinGradient(this.width * this.scales[i], this.height * this.scales[i]));
        }
    }
    _getColor(x, y) {
        let v = 0;
        for (let i = 0; i < 3; ++i) {
            v += this.perlin(this.gradients[i], x * this.scales[i], y * this.scales[i]) * this.coeficients[i] * this.turbulence;
        }
        v = Utils.granulate(Math.sin(2 * x * this.scale * Math.PI + 8 * v), 2);
        v += Utils.granulate(this.perlin(this.gradients[3], x * this.scales[3], y * this.scales[3]), 5);
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), this.curve(v / 4 + 0.5));
    }
}
class CirclesTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, background, scale = 1, ringCount = Infinity, turbulence = 1, curve) {
        super(width, height, color1, color2, scale, (curve !== null && curve !== void 0 ? curve : Curve.sin));
        this.ringCount = ringCount;
        this.ringCountL = this.ringCount - 0.25;
        this.turbulence = turbulence / 2;
        this.background = ColorSource.get((background !== null && background !== void 0 ? background : RgbaColor.transparent));
        this.gradients = [];
        this.scale2 = this.scale * 2;
        for (let i = 0; i < 2; ++i) {
            this.gradients.push(new PerlinGradient(this.width * this.scale2, this.height * this.scale2));
        }
        this.cx = this.width * this.scale / 2;
        this.cy = this.height * this.scale / 2;
    }
    _getColor(x, y) {
        let _x = x * this.scale + this.perlin(this.gradients[0], x * this.scale2, y * this.scale2) * this.turbulence - this.cx;
        let _y = y * this.scale + this.perlin(this.gradients[1], x * this.scale2, y * this.scale2) * this.turbulence - this.cy;
        let d = Math.sqrt(_x * _x + _y * _y);
        if (d > this.ringCount) {
            return this.background.getColor(x, y);
        }
        else {
            let c = this.color.getColor(x, y).lerp(this.color2.getColor(x, y), this.curve(1 - Math.abs(1 - d % 1 * 2)));
            if (d > this.ringCountL) {
                return c.lerp(this.background.getColor(x, y), this.curve((d - this.ringCountL) * 4));
            }
            else {
                return c;
            }
        }
    }
}
class CamouflageTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, scale = 1, curve) {
        super(width, height, color1, color2, scale, curve);
        this.scales = [this.scale, this.scale * 2, this.scale * 4];
        this.coeficients = [1.5, 0.75, 0.75];
        this.gradients = [];
        for (let i = 0; i < 9; ++i) {
            this.gradients.push(new PerlinGradient(this.width * this.scales[i % 3], this.height * this.scales[i % 3]));
        }
    }
    _getColor(x, y) {
        let _x = x * this.scale, _y = y * this.scale;
        for (let i = 0; i < 3; ++i) {
            _x += this.perlin(this.gradients[i], x * this.scales[i], y * this.scales[i]) * this.coeficients[i];
            _y += this.perlin(this.gradients[i + 3], x * this.scales[i], y * this.scales[i]) * this.coeficients[i];
        }
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), this.curve((Utils.granulate(this.perlin(this.gradients[6], _x, _y), 4) * 0.7 +
            Utils.granulate(this.perlin(this.gradients[7], _x * 2, _y * 2), 5) * 0.2 +
            Utils.granulate(this.perlin(this.gradients[8], _x * 4, _y * 4), 6) * 0.1) / 2 + 0.5));
    }
}
class GradientSource extends ColorSource {
    constructor(width, height) {
        super(width, height);
        this.colorStops = [];
    }
    addColorStop(pos, color) {
        this.colorStops.push({ pos: pos, color: ColorSource.get(color) });
        this.colorStops.sort((a, b) => a.pos - b.pos);
    }
    getColorAtPosition(x, y, position) {
        if (this.colorStops.length == 0) {
            return RgbaColor.black;
        }
        else if (this.colorStops.length == 1) {
            return this.colorStops[0].color.getColor(x, y);
        }
        else if (position <= this.colorStops[0].pos) {
            return this.colorStops[0].color.getColor(x, y);
        }
        else if (position >= this.colorStops[this.colorStops.length - 1].pos) {
            return this.colorStops[this.colorStops.length - 1].color.getColor(x, y);
        }
        else {
            let i = 1;
            while (position > this.colorStops[i].pos) {
                ++i;
            }
            return this.colorStops[i - 1].color.getColor(x, y).lerp(this.colorStops[i].color.getColor(x, y), (position - this.colorStops[i - 1].pos) / (this.colorStops[i].pos - this.colorStops[i - 1].pos));
        }
    }
}
class LinearGradientSource extends GradientSource {
    constructor(width, height, x1, y1, x2, y2) {
        super(width, height);
        this.a = x2 - x1;
        this.b = y2 - y1;
        this.c = -this.a * x1 - this.b * y1;
        this.d = Math.sqrt(this.a * this.a + this.b * this.b);
        this.d *= this.d;
    }
    _getColor(x, y) {
        return this.getColorAtPosition(x, y, (this.a * x + this.b * y + this.c) / this.d);
    }
}
class RadialGradientSource extends GradientSource {
    constructor(width, height, x, y, r1, r2) {
        super(width, height);
        this.x = x;
        this.y = y;
        this.r1 = r1;
        this.dr = r2 - r1;
    }
    _getColor(x, y) {
        let dx = x - this.x, dy = y - this.y;
        return this.getColorAtPosition(x, y, (Math.sqrt(dx * dx + dy * dy) - this.r1) / this.dr);
    }
}
class ShapeSource extends ColorSource {
    constructor(width, height, color, background) {
        super(width, height);
        this.color = ColorSource.get((color !== null && color !== void 0 ? color : RgbaColor.white));
        this.background = ColorSource.get((background !== null && background !== void 0 ? background : RgbaColor.black));
    }
}
class RectangleSource extends ShapeSource {
    constructor(width, height, x, y, w, h, color, background) {
        super(width, height, color, background);
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    _getColor(x, y) {
        let _x = x - this.x, _y = y - this.y;
        return (_x >= 0 && _x < this.w && _y >= 0 && _y < this.h) ? this.color.getColor(x, y) : this.background.getColor(x, y);
    }
}
class CircleSource extends ShapeSource {
    constructor(width, height, x, y, r, color, background) {
        super(width, height, color, background);
        this.x = x;
        this.y = y;
        this.r1 = r;
        this.r2 = r + 1;
    }
    _getColor(x, y) {
        let _x = x - this.x, _y = y - this.y, d = Math.sqrt(_x * _x + _y * _y);
        if (d <= this.r1) {
            return this.color.getColor(x, y);
        }
        else if (d >= this.r2) {
            return this.background.getColor(x, y);
        }
        else {
            return this.color.getColor(x, y).lerp(this.background.getColor(x, y), d - this.r1);
        }
    }
}
class EllipseSource extends ShapeSource {
    constructor(width, height, x, y, r1, r2, color, background) {
        super(width, height, color, background);
        this.x = x;
        this.y = y;
        this.r1 = r1;
        this.r2 = r2;
    }
    _getColor(x, y) {
        let _x = (x - this.x) / this.r1, _y = (y - this.y) / this.r2;
        return _x * _x + _y * _y <= 1 ? this.color.getColor(x, y) : this.background.getColor(x, y);
    }
}
class PathSource extends ShapeSource {
    constructor(width, height, path, color, background, fillRule = "nonzero") {
        super(width, height, color, background);
        this.path = path;
        this.fillRule = fillRule;
        this.ctx = new PreRenderedImage(1, 1).ctx;
    }
    _getColor(x, y) {
        return this.ctx.isPointInPath(this.path, x, y, this.fillRule) ? this.color.getColor(x, y) : this.background.getColor(x, y);
    }
}
class CombiningSource extends ColorSource {
    constructor(width, height, color1, color2) {
        super(width, height);
        this.color1 = ColorSource.get((color1 !== null && color1 !== void 0 ? color1 : RgbaColor.black));
        this.color2 = ColorSource.get((color2 !== null && color2 !== void 0 ? color2 : RgbaColor.white));
    }
    _getColor(x, y) {
        return this.combine(this.color1.getColor(x, y), this.color2.getColor(x, y));
    }
}
class AddingSource extends CombiningSource {
    constructor(width, height, color1, color2) {
        super(width, height, color1, color2);
    }
    combine(a, b) { return a.add(b); }
}
class MultiplyingSource extends CombiningSource {
    constructor(width, height, color1, color2) {
        super(width, height, color1, color2);
    }
    combine(a, b) { return a.multiply(b); }
}
class BlendingSource extends CombiningSource {
    constructor(width, height, color1, color2) {
        super(width, height, color1, color2);
    }
    combine(a, b) { return a.blend(b); }
}
class LerpingSource extends CombiningSource {
    constructor(width, height, color1, color2, coeficient) {
        super(width, height, color1, color2);
        this.coeficient = coeficient;
    }
    combine(a, b) { return a.lerp(b, this.coeficient); }
}
class TransformingSource extends ColorSource {
    constructor(width, height, source) {
        super(width, height);
        this.source = source;
    }
    _getColor(x, y) {
        let v = this.reverseTransform(x, y);
        return this.source.getColor(v.x, v.y);
    }
}
class TranslatingSource extends TransformingSource {
    constructor(width, height, source, xd, yd) {
        super(width, height, source);
        this.xd = xd;
        this.yd = yd;
    }
    reverseTransform(x, y) {
        return new Vec2(x - this.xd, y - this.yd);
    }
}
class RotatingSource extends TransformingSource {
    constructor(width, height, source, angle, originX, originY) {
        super(width, height, source);
        this.angle = angle;
        this.originX = originX;
        this.originY = originY;
    }
    reverseTransform(x, y) {
        return Utils.rotatePoint(x, y, this.originX, this.originY, -this.angle);
    }
}
class ScalingSource extends TransformingSource {
    constructor(width, height, source, scale, originX, originY) {
        super(width, height, source);
        if (scale instanceof Vec2) {
            this.inverseScale = new Vec2(1 / scale.x, 1 / scale.y);
        }
        else {
            this.inverseScale = new Vec2(1 / scale, 1 / scale);
        }
        this.origin = new Vec2(originX, originY);
    }
    reverseTransform(x, y) {
        let v = new Vec2(x, y), dv = v.sub(this.origin);
        if (dv.isZero()) {
            return v;
        }
        return this.origin.addu(dv.x * this.inverseScale.x, dv.y * this.inverseScale.y);
    }
}
class FisheyeSource extends TransformingSource {
    constructor(width, height, source, scale, originX, originY, radius) {
        super(width, height, source);
        this.scale = Utils.clamp(scale, -1, 1);
        this.radius = radius;
        this.origin = new Vec2(originX, originY);
    }
    reverseTransform(x, y) {
        let v = new Vec2(x, y), dv = v.sub(this.origin);
        if (dv.isZero()) {
            return v;
        }
        let d = dv.length() / this.radius;
        if (d >= 1) {
            return v;
        }
        if (this.scale < 0) {
            let coef = Utils.lerp(d, Curve.arc(d), -this.scale);
            return this.origin.add(dv.mul(coef / d));
        }
        else {
            let coef = Utils.lerp(d, Curve.invArc(d), this.scale);
            return this.origin.add(dv.mul(coef / d));
        }
    }
}
class PolarSource extends TransformingSource {
    constructor(width, height, source, sourceWidth, sourceHeight) {
        super(width, height, source);
        this.source = source;
        this.origin = new Vec2(this.width / 2, this.height / 2);
        this.coef = new Vec2(sourceWidth / Angle.deg360, sourceHeight * 2 / Math.min(this.width, this.height));
    }
    reverseTransform(x, y) {
        let v = new Vec2(x, y);
        return new Vec2(this.origin.angleTo(v) * this.coef.x, v.sub(this.origin).length() * this.coef.y);
    }
}
class AntialiasedSource extends ColorSource {
    constructor(width, height, source) {
        super(width, height);
        this.source = source;
    }
    _getColor(x, y) {
        return this.source.getColor(x, y).lerp(this.source.getColor(x + 0.5, y), 0.5).lerp(this.source.getColor(x, y + 0.5).lerp(this.source.getColor(x + 0.5, y + 0.5), 0.5), 0.5);
    }
}
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
class ElementSparkParticle extends Particle {
    constructor(x, y, type) {
        super();
        this.x = x;
        this.y = y;
        let v = Vec2.randUnit3d();
        this.vx = v.x;
        this.vy = v.y;
        this.life = 0;
        this.color = TurretType.getColor(type) + "40";
    }
    step(time) {
        this.life += time * 2;
        this.x += this.vx;
        this.y += this.vy;
    }
    render(ctx) {
        if (this.life >= 1) {
            return;
        }
        let r = 8 - this.life * 8;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Angle.deg360);
        ctx.fill();
    }
    isDead() {
        return this.life >= 1;
    }
}
class ParticleSystem {
    constructor(game) {
        this.game = game;
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
    constructor(type) {
        this.type = type === undefined ? [0, 0, 0, 0] : type;
    }
    copy() { return new TurretType(this.type.slice()); }
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
    contains(type) { return this.type[type] > 0; }
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
        for (let e = TurretElement.Air; e <= TurretElement.Water; ++e) {
            for (let i = 0; i < this.type[e]; ++i) {
                arr.push(TurretType.getColor(e));
            }
        }
        return arr;
    }
    static getColor(type) {
        switch (type) {
            case TurretElement.Air:
                return "#d8d1ff";
            case TurretElement.Earth:
                return "#6dd13e";
            case TurretElement.Fire:
                return "#f7854c";
            case TurretElement.Water:
                return "#79b4f2";
            default:
                return "#000000";
        }
    }
}
class Turret {
    constructor(tile, type) {
        this.game = tile.game;
        this.tile = tile;
        this.center = new Vec2(tile.pos.x + 32, tile.pos.y + 32);
        this.hp = 100;
        this.type = type === undefined ? new TurretType() : type;
        this.cooldown = 0;
    }
    step(time) {
        if (this.cooldown > 0) {
            this.cooldown -= time;
        }
    }
    render(ctx, preRender) { }
    getType() { return this.type.copy(); }
    upgradeCostMultiplier(type) {
        switch (this.type.count()) {
            case 0: return 1;
            case 1: return this.type.contains(type) ? 1 : 2;
            case 2: return this.type.contains(type) ? 2 : 4;
            case 3: return this.type.contains(type) ? 4 : 8;
            default: return -1;
        }
    }
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
    static initAll() {
        return Promise.all([
            AirTurret.init(),
            FireTurret.init(),
            EarthTurret.init(),
            WaterTurret.init(),
            IceTurret.init(),
            AcidTurret.init(),
            CannonTurret.init(),
            ArcherTurret.init(),
            LightningTurret.init(),
            FlamethrowerTurret.init(),
            SunTurret.init(),
            MoonTurret.init(),
            PlasmaTurret.init(),
            EarthquakeTurret.init(),
            ArcaneTurret.init()
        ]);
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
        ctx.drawImage(AirTurret.image, -24, -8);
        switch (this.type.air()) {
            case 1:
                ctx.rotate(Angle.deg90);
                ctx.drawImage(AirTurret.image, -24, -8);
                break;
            case 2:
                for (let i = 0; i < 2; ++i) {
                    ctx.rotate(Angle.deg60);
                    ctx.drawImage(AirTurret.image, -24, -8);
                }
                break;
            case 3:
                for (let i = 0; i < 3; ++i) {
                    ctx.rotate(Angle.deg45);
                    ctx.drawImage(AirTurret.image, -24, -8);
                }
                break;
            case 4:
                for (let i = 0; i < 4; ++i) {
                    ctx.rotate(Angle.deg36);
                    ctx.drawImage(AirTurret.image, -24, -8);
                }
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
        return Utils.getImageFromCache("td_tower_Aefw_air").then(tex => { AirTurret.image = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(48, 16);
            let renderable = new RenderablePathSet();
            let path = new Path2D();
            path.ellipse(36, 8, 12, 8, 0, 0, Angle.deg180);
            let grad = c.ctx.createLinearGradient(24, 8, 24, 16);
            renderable.pushNew(path, grad);
            path = new Path2D();
            path.ellipse(12, 8, 12, 8, 0, Angle.deg180, 0);
            grad = c.ctx.createLinearGradient(24, 8, 24, 0);
            renderable.pushNew(path, grad);
            path = new Path2D();
            path.arc(24, 8, 8, 0, Angle.deg360);
            grad = c.ctx.createRadialGradient(24, 8, 8, 24, 8, 4);
            renderable.pushNew(path, grad);
            for (const rp of renderable.paths) {
                rp.path.closePath();
                const gr = rp.fill;
                gr.addColorStop(0, "#B2A5FF");
                gr.addColorStop(1, "#A0A0A0");
            }
            renderable.render(c.ctx);
            c.cacheImage("td_tower_Aefw_air");
            AirTurret.image = c.image;
            resolve();
        }));
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
        ctx.drawImage(EarthTurret.images, 0, this.type.earth() * 48 - 48, 48, 48, this.tile.pos.x + 8, this.tile.pos.y + 8, 48, 48);
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
        return Utils.getImageFromCache("td_tower_aEfw_earth").then(tex => { EarthTurret.images = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(48, 192);
            EarthTurret.preRender1(c.ctx, 0);
            EarthTurret.preRender2(c.ctx, 48);
            EarthTurret.preRender3(c.ctx, 96);
            EarthTurret.preRender4(c.ctx, 144);
            c.cacheImage("td_tower_aEfw_earth");
            EarthTurret.images = c.image;
            resolve();
        }));
    }
    static preRender1(ctx, y) {
        let renderable = new RenderablePathSet();
        let path;
        let grad;
        let corners = [{ x: 14, y: 14 }, { x: 34, y: 14 }, { x: 14, y: 34 }, { x: 34, y: 34 }];
        for (const corner of corners) {
            path = new Path2D();
            path.arc(corner.x, y + corner.y, 10, 0, Angle.deg360);
            grad = ctx.createRadialGradient(corner.x, y + corner.y, 5, corner.x, y + corner.y, 10);
            grad.addColorStop(0, "#90d173");
            grad.addColorStop(1, "#6ba370");
            renderable.pushNew(path, grad);
        }
        renderable.pushPolygon([12, 16, 16, 12, 36, 32, 32, 36], "#90d173", 0, y);
        renderable.pushPolygon([36, 16, 32, 12, 12, 32, 16, 36], "#90d173", 0, y);
        path = new Path2D();
        path.arc(24, y + 24, 6, 0, Angle.deg360);
        grad = ctx.createRadialGradient(24, y + 24, 2, 24, y + 24, 6);
        grad.addColorStop(0, "#beefa7");
        grad.addColorStop(1, "#90d173");
        renderable.pushNew(path, grad);
        renderable.render(ctx);
    }
    static preRender2(ctx, y) {
        let renderable = new RenderablePathSet();
        let path;
        let grad;
        let corners = [{ x: 13, y: 13 }, { x: 35, y: 13 }, { x: 13, y: 35 }, { x: 35, y: 35 }];
        for (const corner of corners) {
            path = new Path2D();
            path.arc(corner.x, y + corner.y, 10, 0, Angle.deg360);
            grad = ctx.createRadialGradient(corner.x, y + corner.y, 5, corner.x, y + corner.y, 10);
            grad.addColorStop(0, "#6fd243");
            grad.addColorStop(1, "#54a45b");
            renderable.pushNew(path, grad);
        }
        renderable.pushPolygon([12, 16, 16, 12, 36, 32, 32, 36], "#6fd243", 0, y);
        renderable.pushPolygon([36, 16, 32, 12, 12, 32, 16, 36], "#6fd243", 0, y);
        path = new Path2D();
        path.arc(24, y + 24, 6, 0, Angle.deg360);
        grad = ctx.createRadialGradient(24, y + 24, 2, 24, y + 24, 6);
        grad.addColorStop(0, "#a6f083");
        grad.addColorStop(1, "#6fd243");
        renderable.pushNew(path, grad);
        renderable.render(ctx);
    }
    static preRender3(ctx, y) {
        let renderable = new RenderablePathSet();
        let path;
        let grad;
        let corners = [{ x: 12, y: 12 }, { x: 36, y: 12 }, { x: 12, y: 36 }, { x: 36, y: 36 }];
        for (const corner of corners) {
            path = new Path2D();
            path.arc(corner.x, y + corner.y, 11, 0, Angle.deg360);
            grad = ctx.createRadialGradient(corner.x, y + corner.y, 5, corner.x, y + corner.y, 10);
            grad.addColorStop(0, "#4ed314");
            grad.addColorStop(1, "#3da547");
            renderable.pushNew(path, grad);
        }
        renderable.pushPolygon([11, 17, 17, 11, 37, 31, 31, 37], "#4ed314", 0, y);
        renderable.pushPolygon([37, 17, 31, 11, 11, 31, 17, 37], "#4ed314", 0, y);
        path = new Path2D();
        path.arc(24, y + 24, 8, 0, Angle.deg360);
        grad = ctx.createRadialGradient(24, y + 24, 3, 24, y + 24, 8);
        grad.addColorStop(0, "#8ef260");
        grad.addColorStop(1, "#4ed314");
        renderable.pushNew(path, grad);
        renderable.render(ctx);
    }
    static preRender4(ctx, y) {
        let grad;
        let tex1 = new CamouflageTextureGenerator(48, 48, "#825D30", "#308236", 0.5);
        let tex2 = new CamouflageTextureGenerator(48, 48, "#92A33C", "#4ED314", 0.5);
        let src = RgbaColor.transparent.source();
        let corners = [{ x: 12, y: 12 }, { x: 36, y: 12 }, { x: 12, y: 36 }, { x: 36, y: 36 }];
        for (const corner of corners) {
            grad = new RadialGradientSource(48, 48, corner.x, corner.y, 12, 6);
            grad.addColorStop(0, "#825D3000");
            grad.addColorStop(0.2, tex1);
            grad.addColorStop(1, tex2);
            src = new CircleSource(48, 48, corner.x, corner.y, 12.5, grad, src);
        }
        let path = new Path2D;
        path.moveTo(10, 18);
        path.lineTo(18, 10);
        path.lineTo(38, 30);
        path.lineTo(30, 38);
        path.closePath();
        path.moveTo(38, 18);
        path.lineTo(30, 10);
        path.lineTo(10, 30);
        path.lineTo(18, 38);
        path.closePath();
        src = new PathSource(48, 48, path, tex2, src);
        grad = new RadialGradientSource(48, 48, 24, 24, 10, 4);
        grad.addColorStop(0, tex2);
        grad.addColorStop(1, "#B6FF00");
        new CircleSource(48, 48, 24, 24, 10.5, grad, src).generateInto(ctx, 0, y);
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
        let r = 16 + 2 * this.type.fire();
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
        return Utils.getImageFromCache("td_tower_aeFw_fire").then(tex => { FireTurret.image = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(48, 48);
            let texLava = new CellularTextureGenerator(48, 48, 36, "#FF5020", "#C00000", CellularTextureType.Balls);
            let texRock = new CellularTextureGenerator(48, 48, 144, "#662D22", "#44150D", CellularTextureType.Balls);
            let renderable = new RenderablePathSet();
            let path = new Path2D();
            for (let k = 0; k < 36; ++k) {
                let radius = 20 + 4 * Math.random();
                let a = k * Angle.deg10;
                if (k === 0) {
                    path.moveTo(Utils.ldx(radius, a, 24), Utils.ldy(radius, a, 24));
                }
                else {
                    path.lineTo(Utils.ldx(radius, a, 24), Utils.ldy(radius, a, 24));
                }
            }
            path.closePath();
            renderable.pushNew(path, c.ctx.createPattern(texRock.generateImage(), "no-repeat"));
            let grad = c.ctx.createRadialGradient(24, 24, 24, 24, 24, 10);
            grad.addColorStop(0, "#300000");
            grad.addColorStop(1, "#30000000");
            renderable.pushNew(path, grad);
            path = new Path2D();
            for (let k = 0; k < 18; ++k) {
                let radius = 9 + 2 * Math.random();
                let a = k * Angle.deg20;
                if (k === 0) {
                    path.moveTo(Utils.ldx(radius, a, 24), Utils.ldy(radius, a, 24));
                }
                else {
                    path.lineTo(Utils.ldx(radius, a, 24), Utils.ldy(radius, a, 24));
                }
            }
            path.closePath();
            renderable.pushNew(path, c.ctx.createPattern(texLava.generateImage(), "no-repeat"));
            renderable.render(c.ctx);
            c.cacheImage("td_tower_aeFw_fire");
            FireTurret.image = c.image;
            resolve();
        }));
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
        ctx.drawImage(WaterTurret.images, 0, (this.type.count() - 1) * 48, 48, 48, -24, -24, 48, 48);
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
        return Utils.getImageFromCache("td_tower_aefW_water").then(tex => { WaterTurret.images = tex; }, () => new Promise(resolve => {
            let sandTex = new NoiseTextureGenerator(48, 48, "#F2EBC1", 0.08, 0, 1).generateImage();
            let groundTex = new NoiseTextureGenerator(48, 48, "#B9B5A0", 0.05, 0, 1).generateImage();
            let c = new PreRenderedImage(48, 192);
            c.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex), 1, 1, 46, 46);
            c.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex), -2, 46, 52, 52);
            c.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex), -5, 91, 58, 58);
            c.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex), -8, 136);
            c.cacheImage("td_tower_aefW_water");
            WaterTurret.images = c.image;
            resolve();
        }));
    }
    static preRender(groundTex, sandTex) {
        let waterTex = new CellularTextureGenerator(64, 64, Utils.randInt(16, 36), "#3584CE", "#3EB4EF", CellularTextureType.Balls).generateImage();
        let textures = [groundTex, sandTex, waterTex];
        let pts = [[], [], []];
        for (let i = 0; i < 8; ++i) {
            let d2 = Utils.rand(16, 20);
            let d1 = Utils.rand(d2 + 2, 24);
            let d0 = Utils.rand(d1, 24);
            let a = i * Angle.deg45;
            pts[0].push({ pt: Utils.ld(d0, a, 32, 32), pt_b: Vec2.zero, pt_a: Vec2.zero });
            pts[1].push({ pt: Utils.ld(d1, a, 32, 32), pt_b: Vec2.zero, pt_a: Vec2.zero });
            pts[2].push({ pt: Utils.ld(d2, a, 32, 32), pt_b: Vec2.zero, pt_a: Vec2.zero });
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
        return c.image;
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
        let i = Utils.sign(this.type.water() - this.type.air()) + 1;
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.drawImage(IceTurret.images, 0, i * 64, 64, 64, -r, -r, r * 2, r * 2);
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
        return Utils.getImageFromCache("td_tower_AefW_ice").then(tex => { IceTurret.images = tex; }, () => new Promise(resolve => {
            let tex = new CellularTextureGenerator(64, 64, 64, "#D1EFFF", "#70BECC", CellularTextureType.Cells);
            let c = new PreRenderedImage(64, 192);
            let c2 = new PreRenderedImage(64, 64);
            let fill = c2.ctx.createPattern(tex.generateImage(), "repeat");
            IceTurret.preRender(c2.ctx, 0, fill, true);
            c.ctx.drawImage(c2.image, 0, 0);
            c.ctx.drawImage(c2.image, 0, 64);
            c.ctx.drawImage(c2.image, 0, 128);
            IceTurret.preRender(c.ctx, 0, "#FFFFFF80");
            IceTurret.preRender(c.ctx, 128, "#51AFCC60");
            c.cacheImage("td_tower_AefW_ice");
            IceTurret.images = c.image;
            resolve();
        }));
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
    static preRender(ctx, baseY, fill, drawCenter = false) {
        ctx.save();
        ctx.lineCap = "round";
        ctx.strokeStyle = fill;
        let centerPath = new Path2D();
        for (let k = 0; k < 6; ++k) {
            let a = k * Angle.deg60;
            if (k === 0) {
                centerPath.moveTo(Utils.ldx(8, a, 32), baseY + Utils.ldy(8, a, 32));
            }
            else {
                centerPath.lineTo(Utils.ldx(8, a, 32), baseY + Utils.ldy(8, a, 32));
            }
            IceTurret.mkBranch(ctx, Utils.ldx(8, a, 32), baseY + Utils.ldy(8, a, 32), a, 3);
        }
        centerPath.closePath();
        ctx.restore();
        ctx.fillStyle = fill;
        ctx.fill(centerPath);
        if (drawCenter) {
            let grad = ctx.createRadialGradient(32, baseY + 32, 0, 32, baseY + 32, 6);
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
        ctx.drawImage(AcidTurret.images, Math.floor(this.frame) * 48, (this.type.water() + this.type.earth() - 2) * 48, 48, 48, this.tile.pos.x + 8, this.tile.pos.y + 8, 48, 48);
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
        AcidTurret.frameCount = 50;
        return Utils.getImageFromCache("td_tower_aEfW_acid_strip" + AcidTurret.frameCount).then(tex => { AcidTurret.images = tex; }, () => new Promise(resolve => {
            let acidTex = new CellularTextureGenerator(32, 32, 9, "#E0FF00", "#5B7F00", CellularTextureType.Balls).generateImage();
            let c = new PreRenderedImage(48 * AcidTurret.frameCount, 144);
            for (let i = 0; i < AcidTurret.frameCount; ++i) {
                AcidTurret.preRenderFrame(acidTex, c.ctx, i);
            }
            c.cacheImage("td_tower_aEfW_acid_strip" + AcidTurret.frameCount);
            AcidTurret.images = c.image;
            resolve();
        }));
    }
    static preRenderFrame(texture, targetCtx, frame) {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        let offset = frame / AcidTurret.frameCount * 32;
        let c0 = new PreRenderedImage(48, 48);
        let c1 = new PreRenderedImage(48, 48);
        let c2 = new PreRenderedImage(48, 48);
        let c = [c0, c1, c2];
        let ctx = c0.ctx;
        ctx.beginPath();
        ctx.moveTo(18, 12);
        ctx.arcTo(36, 12, 36, 18, 6);
        ctx.arcTo(36, 36, 30, 36, 6);
        ctx.arcTo(12, 36, 12, 30, 6);
        ctx.arcTo(12, 12, 18, 12, 6);
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
            ctx.translate(24, 24);
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
            ctx.arc(24, 24, 6 + i, 0, Angle.deg360);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#60606080";
            ctx.fill();
            let grad = ctx.createLinearGradient(17 - i / 2, 17 - i / 2, 30 + i / 2, 30 + i / 2);
            grad.addColorStop(0, "#808080");
            grad.addColorStop(1, "#404040");
            ctx.strokeStyle = grad;
            ctx.lineWidth = 2 + i;
            ctx.stroke();
        }
        targetCtx.drawImage(c0.image, frame * 48, 0);
        targetCtx.drawImage(c1.image, frame * 48, 48);
        targetCtx.drawImage(c2.image, frame * 48, 96);
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
        let r = 12 + this.type.earth() + this.type.fire();
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.translate(-2 * this.cooldown, 0);
        ctx.drawImage(CannonTurret.image, -r * 2, -r, r * 4, r * 2);
        ctx.resetTransform();
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
            case TurretElement.Fire:
                this.type.add(type);
                break;
            case TurretElement.Water:
                this.tile.turret = new EarthquakeTurret(this.tile, this.type.add(type));
                break;
        }
    }
    static init() {
        return Utils.getImageFromCache("td_tower_aEFw_cannon").then(tex => { CannonTurret.image = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(64, 32);
            let ctx = c.ctx;
            let grad = ctx.createLinearGradient(20, 16, 40, 16);
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
            ctx.fillRect(20, 3, 20, 26);
            ctx.beginPath();
            ctx.arc(20, 16, 7, Angle.deg90, Angle.deg270);
            ctx.arcTo(42, 9, 52, 12, 50);
            ctx.arc(54, 12, 2, Angle.deg180, Angle.deg360);
            ctx.lineTo(56, 20);
            ctx.arc(54, 20, 2, 0, Angle.deg180);
            ctx.arcTo(45, 23, 38, 23, 50);
            ctx.closePath();
            ctx.strokeStyle = "#101010";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = "#303030";
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(52, 12);
            ctx.lineTo(52, 20);
            ctx.lineWidth = 1;
            ctx.stroke();
            c.cacheImage("td_tower_aEFw_cannon");
            CannonTurret.image = c.image;
            resolve();
        }));
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
        return Utils.getImageFromCache("td_tower_AEfw_archer").then(tex => { ArcherTurret.image = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(64, 64);
            c.cacheImage("td_tower_AEfw_archer");
            ArcherTurret.image = c.image;
            resolve();
        }));
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
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(-Math.floor(this.animationTimer * 8) * Angle.deg45);
        ctx.drawImage(LightningTurret.image, -24, -24);
        ctx.resetTransform();
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
        return Utils.getImageFromCache("td_tower_AeFw_lightning").then(tex => { LightningTurret.image = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(48, 48);
            let ctx = c.ctx;
            let grad = ctx.createRadialGradient(24, 24, 0, 24, 24, 18);
            grad.addColorStop(0, "#FFFFFF");
            grad.addColorStop(0.33, "#A97FFF");
            grad.addColorStop(1, "#D6BFFF");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(42, 24);
            for (let i = 1; i < 16; ++i) {
                let r = i % 2 == 0 ? 21 : 7;
                let a = i * Angle.deg45 / 2;
                ctx.lineTo(Utils.ldx(r, a, 24), Utils.ldy(r, a, 24));
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
                ctx.translate(Utils.ldx(18, a, 24), Utils.ldy(18, a, 24));
                if (j) {
                    ctx.rotate(Angle.deg45);
                }
                ctx.fillRect(-3, -3, 6, 6);
                ctx.resetTransform();
            }
            grad = ctx.createRadialGradient(42, 24, 0, 42, 24, 8);
            grad.addColorStop(0, "#FFFFFFC0");
            grad.addColorStop(1, "#F8F2FF00");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(42, 24, 8, 0, Angle.deg360);
            ctx.closePath();
            ctx.fill();
            c.cacheImage("td_tower_AeFw_lightning");
            LightningTurret.image = c.image;
            resolve();
        }));
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
                this.tile.turret = new PlasmaTurret(this.tile, this.type.add(type));
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
        return Utils.getImageFromCache("td_tower_aeFW_flamethrower").then(tex => { FlamethrowerTurret.image = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(64, 64);
            c.cacheImage("td_tower_aeFW_flamethrower");
            FlamethrowerTurret.image = c.image;
            resolve();
        }));
    }
}
class SunTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.frame = Utils.rand(0, SunTurret.frameCount);
        this.angle = Angle.rand();
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
        let r = 28 + 4 * (this.type.count() - 3);
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.drawImage(SunTurret.image, -r, -r, r * 2, r * 2);
        ctx.rotate(this.frame / SunTurret.frameCount * Angle.deg30);
        ctx.drawImage(SunTurret.image, -r, -r, r * 2, r * 2);
        ctx.resetTransform();
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
        SunTurret.frameCount = 90;
        return Utils.getImageFromCache("td_tower_AEFw_sun").then(tex => { SunTurret.image = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(64, 64);
            let ctx = c.ctx;
            let grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            grad.addColorStop(0.00000, "#FFFF40");
            grad.addColorStop(0.09375, "#FFFD3D");
            grad.addColorStop(0.18750, "#FFFA37");
            grad.addColorStop(0.28125, "#FFF42A");
            grad.addColorStop(0.37500, "#FFE000");
            grad.addColorStop(0.40625, "#FFFFC0");
            grad.addColorStop(1.00000, "#FFFFC000");
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
            c.cacheImage("td_tower_AEFw_sun");
            SunTurret.image = c.image;
            resolve();
        }));
    }
}
class MoonTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.frame = Utils.rand(0, MoonTurret.frameCount);
    }
    step(time) {
        super.step(time);
        this.frame = (this.frame + time * 25) % MoonTurret.frameCount;
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        let r = 28 + 4 * (this.type.count() - 3);
        ctx.drawImage(MoonTurret.images, Math.floor(this.frame) * 64, 0, 64, 64, this.center.x - r, this.center.y - r, r * 2, r * 2);
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
        MoonTurret.frameCount = 50;
        return Utils.getImageFromCache("td_tower_AEfW_moon_strip" + MoonTurret.frameCount).then(tex => { MoonTurret.images = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(MoonTurret.frameCount * 64, 64);
            let colorA = ColorSource.get("#E0E0E0");
            let colorB = ColorSource.get("#FFFFFF00");
            let s = new CellularTextureGenerator(64, 32, 49, "#A0A0A0", colorA, CellularTextureType.Balls);
            for (let i = 0; i < 3; ++i) {
                s = new CellularTextureGenerator(64, 32, 49, s, colorA, CellularTextureType.Cells);
            }
            s = new BufferedColorSource(64, 32, s);
            let p = new PerlinNoiseTextureGenerator(64, 64, "#FFFFFF00", "#FFFFFF80", 0.4);
            for (let i = 0; i < MoonTurret.frameCount; ++i) {
                let coef = i / MoonTurret.frameCount;
                let t1 = new TranslatingSource(64, 64, s, -64 * coef, 0);
                let ns = new ScalingSource(64, 64, t1, 0.5, 32, 32);
                let t2 = new TranslatingSource(64, 64, p, 64 * coef, 0);
                let grad = new RadialGradientSource(64, 64, 32, 32, 16, 32);
                grad.addColorStop(0, t2);
                grad.addColorStop(1, colorB);
                ns = new FisheyeSource(64, 64, ns, 0.5, 32, 32, 16);
                ns = new CircleSource(64, 64, 32, 32, 16, ns, grad);
                ns.generateInto(c.ctx, i * 64, 0);
            }
            c.cacheImage("td_tower_AEfW_moon_strip" + MoonTurret.frameCount);
            MoonTurret.images = c.image;
            resolve();
        }));
    }
}
class PlasmaTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.frame = 0;
    }
    step(time) {
        super.step(time);
        this.frame = (this.frame + time * 25) % PlasmaTurret.frameCount;
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.drawImage(PlasmaTurret.images, Math.floor(this.frame) * 64, (this.type.count() - 3) * 64, 64, 64, this.tile.pos.x, this.tile.pos.y, 64, 64);
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
        PlasmaTurret.frameCount = 65;
        return Utils.getImageFromCache("td_tower_AeFW_plasma_strip" + PlasmaTurret.frameCount).then(tex => { PlasmaTurret.images = tex; }, () => new Promise(resolve => {
            let background = "#552BA800";
            let color1 = new PerlinNoiseTextureGenerator(64, 64, "#4B007A00", "#FFFFFF", 0.5);
            let tex1a = new CirclesTextureGenerator(64, 64, "#A389FFC0", color1, background, 0.4, 2, 0.7);
            let tex1b = new CirclesTextureGenerator(64, 64, "#A389FFC0", color1, background, 0.28, 3, 0.7);
            let color2 = new PerlinNoiseTextureGenerator(64, 64, "#552BA840", "#AF84FF", 0.5);
            let back2 = new LerpingSource(64, 64, background, color2, 0.5);
            let tex2a = new CirclesTextureGenerator(64, 64, color2, back2, background, 0.4, 2, 0.1);
            let tex2b = new CirclesTextureGenerator(64, 64, color2, back2, background, 0.28, 3, 0.1);
            let c = new PreRenderedImage(64 * PlasmaTurret.frameCount, 128);
            PlasmaTurret.preRender(c.ctx, tex1a, tex2a, 0);
            PlasmaTurret.preRender(c.ctx, tex1b, tex2b, 64);
            c.cacheImage("td_tower_AeFW_plasma_strip" + PlasmaTurret.frameCount);
            PlasmaTurret.images = c.image;
            resolve();
        }));
    }
    static preRender(ctx, tex1, tex2, y) {
        let back = RgbaColor.transparent.source();
        for (let i = 0; i < PlasmaTurret.frameCount; ++i) {
            let a = i * Angle.deg360 / PlasmaTurret.frameCount;
            new CircleSource(64, 64, 32, 32, 32, new AddingSource(64, 64, new RotatingSource(64, 64, tex1, a, 32, 32), new RotatingSource(64, 64, tex2, -a, 32, 32)), back).generateInto(ctx, i * 64, y);
        }
    }
}
class EarthquakeTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.frame = Utils.rand(0, EarthquakeTurret.totalFrameCount);
    }
    step(time) {
        super.step(time);
        this.frame = (this.frame + time * 25) % EarthquakeTurret.totalFrameCount;
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        let a, b;
        if (this.type.count() == 3) {
            a = Math.floor(this.frame / EarthquakeTurret.halfFrameCount);
            b = Math.floor(this.frame % EarthquakeTurret.halfFrameCount);
        }
        else {
            a = Math.floor(this.frame / EarthquakeTurret.baseFrameCount);
            b = Math.floor(this.frame % EarthquakeTurret.baseFrameCount) * 2;
        }
        ctx.drawImage(EarthquakeTurret.images, a * 48, 0, 48, 48, this.tile.pos.x + 8, this.tile.pos.y + 8, 48, 48);
        ctx.drawImage(EarthquakeTurret.images, 192 + b * 48, 0, 48, 48, this.tile.pos.x + 8, this.tile.pos.y + 8, 48, 48);
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
        EarthquakeTurret.baseFrameCount = 12;
        EarthquakeTurret.halfFrameCount = 24;
        EarthquakeTurret.totalFrameCount = 48;
        return Utils.getImageFromCache("td_tower_aEFW_earthquake_strip" + (EarthquakeTurret.halfFrameCount + 4)).then(tex => { EarthquakeTurret.images = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(192 + EarthquakeTurret.halfFrameCount * 48, 48);
            let ctx = c.ctx;
            for (let i = 0; i < 4; ++i) {
                let cel = new CellularTextureGenerator(48, 48, Utils.randInt(32, 128), "#808080", new PerlinNoiseTextureGenerator(48, 48, RgbaColor.black, "#808080", 0.75), CellularTextureType.Cells, CellularTextureDistanceMetric.Manhattan, Curve.sqr);
                cel = new CellularTextureGenerator(48, 48, Utils.randInt(32, 128), cel, new PerlinNoiseTextureGenerator(48, 48, RgbaColor.black, "#808080", 0.75), CellularTextureType.Cells, CellularTextureDistanceMetric.Chebyshev, Curve.sqr);
                cel.generateInto(ctx, i * 48, 0);
            }
            for (let i = 0; i < EarthquakeTurret.halfFrameCount; ++i) {
                ctx.fillStyle = "#808080" + Utils.byteToHex(Math.floor(i / EarthquakeTurret.halfFrameCount * 256));
                ctx.fillRect(192 + i * 48, 0, 48, 48);
                let grad = ctx.createRadialGradient(0, 0, 4, 0, 0, 12);
                let b = i / EarthquakeTurret.halfFrameCount;
                grad.addColorStop(0.4, RgbaColor.fromHex("#E8E144").lerp(RgbaColor.fromHex("#E86544").lerp(RgbaColor.fromHex("#808080"), b), Curve.arc(b)).toCss());
                grad.addColorStop(0.5, "#606060");
                grad.addColorStop(1, "#000000");
                ctx.fillStyle = grad;
                ctx.translate(216 + 48 * i, 24);
                ctx.rotate(b * Angle.deg90);
                EarthquakeTurret.path(ctx);
                ctx.fill();
                ctx.resetTransform();
            }
            c.cacheImage("td_tower_aEFW_earthquake_strip" + (EarthquakeTurret.halfFrameCount + 4));
            EarthquakeTurret.images = c.image;
            resolve();
        }));
    }
    static path(ctx) {
        ctx.beginPath();
        ctx.moveTo(12, -12);
        ctx.lineTo(Utils.ldx(8, -Angle.deg30), Utils.ldy(8, -Angle.deg30));
        ctx.arc(0, 0, 8, -Angle.deg30, Angle.deg30);
        ctx.lineTo(12, 12);
        ctx.lineTo(Utils.ldx(8, Angle.deg60), Utils.ldy(8, Angle.deg60));
        ctx.arc(0, 0, 8, Angle.deg60, Angle.deg120);
        ctx.lineTo(-12, 12);
        ctx.lineTo(Utils.ldx(8, Angle.deg150), Utils.ldy(8, Angle.deg150));
        ctx.arc(0, 0, 8, Angle.deg150, Angle.deg210);
        ctx.lineTo(-12, -12);
        ctx.lineTo(Utils.ldx(8, Angle.deg240), Utils.ldy(8, Angle.deg240));
        ctx.arc(0, 0, 8, Angle.deg240, Angle.deg300);
        ctx.closePath();
    }
}
class ArcaneTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.frame = 0;
    }
    step(time) {
        super.step(time);
        this.frame = (this.frame + time * 25) % ArcaneTurret.frameCount;
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.drawImage(ArcaneTurret.images, Math.floor(this.frame) * 64, 0, 64, 64, this.tile.pos.x, this.tile.pos.y, 64, 64);
    }
    addType(type) { }
    static init() {
        ArcaneTurret.frameCount = 50;
        return Utils.getImageFromCache("td_tower_AEFW_arcane").then(tex => { ArcaneTurret.images = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(ArcaneTurret.frameCount * 64, 64);
            let r = this.prepareGradient(RgbaColor.red);
            let g = new RotatingSource(64, 64, this.prepareGradient(RgbaColor.green), Angle.deg60, 32, 32);
            let b = new RotatingSource(64, 64, this.prepareGradient(RgbaColor.blue), Angle.deg120, 32, 32);
            let rgb = new BufferedColorSource(64, 64, new AddingSource(64, 64, r, new AddingSource(64, 64, g, b)));
            let v = new BufferedColorSource(64, 64, new VelvetTextureGenerator(64, 64, "#FFFFFF00", "#FFFFFF", 0.5));
            let i = 0;
            function curve(x) {
                return Math.cos(i * Angle.deg360 / ArcaneTurret.frameCount + x * Angle.deg360) / 2 + 0.5;
            }
            let glass = new GlassTextureGenerator(64, 64, "#606060", "#A0A0A0", 0.5, 0.5, curve);
            for (; i < ArcaneTurret.frameCount; ++i) {
                let ic = i * 64 / ArcaneTurret.frameCount;
                let s = new TranslatingSource(192, 64, v, 0, ic);
                s = new PolarSource(64, 64, s, 192, 64);
                s = new FisheyeSource(64, 64, s, 0.5, 32, 32, 24);
                s = new BlendingSource(64, 64, rgb, s);
                let grad = new RadialGradientSource(64, 64, 32, 32, 0, 4);
                grad.addColorStop(0, RgbaColor.white);
                grad.addColorStop(1, s);
                let ground = new RectangleSource(64, 64, 8, 8, 48, 48, glass, RgbaColor.transparent);
                new CircleSource(64, 64, 32, 32, 24, grad, ground).generateInto(c.ctx, i * 64, 0);
            }
            c.cacheImage("td_tower_AEFW_arcane");
            ArcaneTurret.images = c.image;
            resolve();
        }));
    }
    static prepareGradient(color) {
        let grad = new LinearGradientSource(64, 64, 32, 16, 32, 48);
        grad.addColorStop(0, RgbaColor.black);
        grad.addColorStop(1, RgbaColor.black);
        for (let i = 0; i < 8; ++i) {
            let c = RgbaColor.black.lerp(color, Curve.sin(i / 8));
            grad.addColorStop(i / 16, c);
            grad.addColorStop(32 - i / 16, c);
        }
        grad.addColorStop(0.5, color);
        return grad;
    }
}
var TileType;
(function (TileType) {
    TileType[TileType["Unknown"] = 0] = "Unknown";
    TileType[TileType["Empty"] = 1] = "Empty";
    TileType[TileType["WallGen"] = 2] = "WallGen";
    TileType[TileType["Tower"] = 3] = "Tower";
    TileType[TileType["Path"] = 4] = "Path";
    TileType[TileType["Spawn"] = 5] = "Spawn";
    TileType[TileType["HQ"] = 6] = "HQ";
})(TileType || (TileType = {}));
class Tile {
    constructor(game, x, y, type, ctx) {
        this.game = game;
        this.type = type;
        this.turret = null;
        this.pos = new Vec2(x, y);
        this.decor = new RenderablePathSet();
        if (type === TileType.Path || type === TileType.Spawn || type === TileType.HQ) {
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
            if (type === TileType.Spawn) {
                let gradient = ctx.createLinearGradient(x, y + 32, x + 64, y + 32);
                gradient.addColorStop(0, "#CB5E48");
                gradient.addColorStop(1, "#997761");
                this.decor.pushNew(path, gradient);
            }
            else {
                this.decor.pushNew(path, "#997761");
            }
        }
        else if (type === TileType.Empty) {
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
        else if (type === TileType.Tower) {
            this.decor.pushPolygon([0, 0, 62, 0, 62, 2, 2, 2, 2, 62, 0, 62], "#A0A0A0", x, y);
            this.decor.pushPolygon([62, 2, 64, 2, 64, 64, 2, 64, 2, 62, 62, 62], "#606060", x, y);
            this.decor.pushPolygon([56, 8, 58, 8, 58, 58, 8, 58, 8, 56, 56, 56], "#909090", x, y);
            this.decor.pushPolygon([6, 6, 56, 6, 56, 8, 8, 8, 8, 56, 6, 56], "#707070", x, y);
            this.turret = new Turret(this);
        }
    }
    step(time) {
        if (this.type === TileType.Tower && this.turret != null) {
            this.turret.step(time);
        }
    }
    render(ctx, preRender) {
        if (preRender) {
            switch (this.type) {
                case TileType.Empty:
                    ctx.drawImage(Tile.tiles, 0, 0, 64, 64, this.pos.x, this.pos.y, 64, 64);
                    break;
                case TileType.Path:
                    ctx.drawImage(Tile.tiles, 0, 64, 64, 64, this.pos.x, this.pos.y, 64, 64);
                    break;
                case TileType.Spawn:
                    ctx.drawImage(Tile.tiles, 0, 128, 64, 64, this.pos.x, this.pos.y, 64, 64);
                    break;
                case TileType.HQ:
                    ctx.drawImage(Tile.tiles, 0, 64, 64, 64, this.pos.x, this.pos.y, 64, 64);
                    break;
                case TileType.Tower:
                    ctx.fillStyle = "#808080";
                    ctx.fillRect(this.pos.x, this.pos.y, 64, 64);
                    break;
            }
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
    onClick(button, x, y) {
        if (this.type == TileType.Tower && this.turret != null && this.game.selectedTurretElement != null) {
            switch (button) {
                case MouseButton.Left:
                    if (this.turret.upgradeCostMultiplier(this.game.selectedTurretElement) > 0) {
                        this.turret.addType(this.game.selectedTurretElement);
                    }
                    break;
                case MouseButton.Right:
                    this.turret = new Turret(this);
                    break;
            }
        }
    }
    static init() {
        return Utils.getImageFromCache("td_tiles").then(tex => { Tile.tiles = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(64, 192);
            let ctx = c.ctx;
            new NoiseTextureGenerator(64, 64, "#5BA346", 0.075, 0, 0.25).generateInto(ctx, 0, 0);
            new NoiseTextureGenerator(64, 128, "#B5947E", 0.04, 0, 0.2).generateInto(ctx, 0, 64);
            let grad = ctx.createLinearGradient(0, 160, 64, 160);
            grad.addColorStop(0, "#E77B65");
            grad.addColorStop(1, "#E77B6500");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 128, 64, 64);
            c.cacheImage("td_tiles");
            Tile.tiles = c.image;
            resolve();
        }));
    }
    static drawPathGround(ctx, x, y) {
        ctx.drawImage(Tile.tiles, 0, 64, 64, 64, x, y, 64, 64);
    }
}
var InitializationStatus;
(function (InitializationStatus) {
    InitializationStatus[InitializationStatus["Uninitialized"] = 0] = "Uninitialized";
    InitializationStatus[InitializationStatus["Initializing"] = 1] = "Initializing";
    InitializationStatus[InitializationStatus["Initialized"] = 2] = "Initialized";
})(InitializationStatus || (InitializationStatus = {}));
class Game {
    constructor(container) {
        let canvasWidth = 1152;
        let canvasHeight = 576;
        let canvas = document.createElement("canvas");
        canvas.id = "game-canvas";
        container.appendChild(canvas);
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.prevTime = new Date().getTime();
        this.time = 0;
        this.mousePosition = Vec2.zero;
        this.performanceMeter = new PerformanceMeter();
        this.particles = new ParticleSystem(this);
        this.selectedTurretElement = null;
        this.selectedTilePos = null;
        this.mouseButton = null;
        this.status = InitializationStatus.Uninitialized;
        canvas.width = canvasWidth;
        let mapWidth = Math.floor(canvasWidth / 64) - 3;
        mapWidth = mapWidth % 2 === 0 ? mapWidth - 1 : mapWidth;
        this.mapWidth = mapWidth < 3 ? 3 : mapWidth;
        this.width = (mapWidth + 3) * 64;
        canvas.height = canvasHeight;
        let mapHeight = Math.floor(canvasHeight / 64);
        mapHeight = mapHeight % 2 === 0 ? mapHeight - 1 : mapHeight;
        this.mapHeight = mapHeight < 3 ? 3 : mapHeight;
        this.height = mapHeight * 64;
        this.guiPanel = new Rect(this.width - 192, 0, 192, this.height - 192);
    }
    get selectedTile() {
        return this.selectedTilePos !== null ? this.map[this.selectedTilePos.x][this.selectedTilePos.y] : null;
    }
    init() {
        return Tile.init()
            .then(() => Turret.initAll())
            .then(() => this.generateMap())
            .then(() => this.generateCastle())
            .then(() => this.preRender())
            .then(() => new Promise(resolve => {
            this.canvas.setAttribute("tabindex", "0");
            this.canvas.focus();
            this.canvas.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                return false;
            }, false);
            let g = this;
            this.canvas.addEventListener("mousemove", (e) => g.onMouseMove(e));
            this.canvas.addEventListener("mousedown", (e) => g.onMouseDown(e));
            this.canvas.addEventListener("mouseup", (e) => g.onMouseUp(e));
            this.canvas.addEventListener("keydown", (e) => g.onKeyDown(e));
            this.canvas.addEventListener("keyup", (e) => g.onKeyUp(e));
            resolve();
        }));
    }
    generateMap() {
        let mapGen = [];
        let map = [];
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
                    wallGens.add(new Vec2(x, y));
                }
                else {
                    columnGen.push(TileType.Unknown);
                }
                column.push(null);
                columnDijkstra.push(null);
            }
            mapGen.push(columnGen);
            dijkstraMap.push(columnDijkstra);
            map.push(column);
        }
        while (wallGens.size > 0) {
            let wg = Vec2.zero;
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
        let startNode = new DijkstraNode(1, startY);
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
                    map[x][y] = new Tile(this, x * 64, y * 64, TileType.Spawn, this.ctx);
                }
                else if (mapGen[x][y] === TileType.HQ) {
                    map[x][y] = new Tile(this, x * 64, y * 64, TileType.HQ, this.ctx);
                }
                else if (mapGen[x][y] === TileType.Path) {
                    map[x][y] = new Tile(this, x * 64, y * 64, TileType.Path, this.ctx);
                }
                else if ((x > 0 && mapGen[x - 1][y] === TileType.Path) ||
                    (y > 0 && mapGen[x][y - 1] === TileType.Path) ||
                    (x < this.mapWidth - 1 && mapGen[x + 1][y] === TileType.Path) ||
                    (y < this.mapHeight - 1 && mapGen[x][y + 1] === TileType.Path) ||
                    (x > 0 && y > 0 && mapGen[x - 1][y - 1] === TileType.Path) ||
                    (x < this.mapWidth - 1 && y > 0 && mapGen[x + 1][y - 1] === TileType.Path) ||
                    (x > 0 && y < this.mapHeight - 1 && mapGen[x - 1][y + 1] === TileType.Path) ||
                    (x < this.mapWidth - 1 && y < this.mapHeight - 1 && mapGen[x + 1][y + 1] === TileType.Path)) {
                    map[x][y] = new Tile(this, x * 64, y * 64, TileType.Tower, this.ctx);
                }
                else {
                    map[x][y] = new Tile(this, x * 64, y * 64, TileType.Empty, this.ctx);
                }
            }
        }
        this.map = map;
    }
    generateCastle() {
        this.castle = new RenderablePathSet();
        let x = this.guiPanel.x;
        let y = this.height - 192;
        let path = new Path2D();
        path.rect(x + 36, y + 36, 120, 120);
        let tex = new FrostedGlassTextureGenerator(192, 192, "#82614F", "#997663", 0.5);
        this.castle.pushNew(path, this.ctx.createPattern(tex.generateImage(), "repeat"));
        let walls = [
            [6, 6, 60, 60], [126, 6, 60, 60], [6, 126, 60, 60], [126, 126, 60, 60],
            [30, 66, 12, 60], [66, 30, 60, 12], [150, 66, 12, 60], [66, 150, 60, 12]
        ];
        path = new Path2D();
        for (let w of walls) {
            path.rect(x + w[0], y + w[1], w[2], w[3]);
        }
        this.castle.pushNew(path, "#505050");
        path = new Path2D();
        path.rect(x + 18, y + 18, 36, 36);
        path.rect(x + 138, y + 18, 36, 36);
        path.rect(x + 18, y + 138, 36, 36);
        path.rect(x + 138, y + 138, 36, 36);
        this.castle.pushNew(path, "#404040");
        let pts = [
            6, 6, 30, 6, 54, 6, 126, 6, 150, 6, 174, 6,
            6, 30, 54, 30, 78, 30, 102, 30, 126, 30, 174, 30,
            6, 54, 30, 54, 54, 54, 126, 54, 150, 54, 174, 54,
            30, 78, 150, 78, 30, 102, 150, 102,
            6, 126, 30, 126, 54, 126, 126, 126, 150, 126, 174, 126,
            6, 150, 54, 150, 78, 150, 102, 150, 126, 150, 174, 150,
            6, 174, 30, 174, 54, 174, 126, 174, 150, 174, 174, 174
        ];
        path = new Path2D();
        for (let i = 0; i < pts.length; i += 2) {
            path.rect(x + pts[i], y + pts[i + 1], 12, 12);
        }
        this.castle.pushNew(path, "#606060");
    }
    start() {
        let g = this;
        this.render();
        function gameLoop() {
            window.requestAnimationFrame(gameLoop);
            g.step();
            g.render();
        }
        gameLoop();
    }
    step() {
        switch (this.status) {
            case InitializationStatus.Uninitialized: {
                this.status = InitializationStatus.Initializing;
                this.init().then(() => { this.status = InitializationStatus.Initialized; });
                return;
            }
            case InitializationStatus.Initializing: {
                let time = new Date().getTime();
                let timeDiff = (time - this.prevTime) / 1000;
                this.prevTime = time;
                this.time += timeDiff;
                return;
            }
            case InitializationStatus.Initialized: {
                let time = new Date().getTime();
                let timeDiff = (time - this.prevTime) / 1000;
                this.performanceMeter.add(1 / timeDiff);
                for (let x = 0; x < this.mapWidth; ++x) {
                    for (let y = 0; y < this.mapHeight; ++y) {
                        this.map[x][y].step(timeDiff);
                    }
                }
                this.particles.step(timeDiff);
                if (this.selectedTurretElement !== null) {
                    this.particles.add(new ElementSparkParticle(this.mousePosition.x, this.mousePosition.y, this.selectedTurretElement));
                }
                this.prevTime = time;
                this.time += timeDiff;
                return;
            }
        }
    }
    setMousePosition(e) {
        var rect = this.canvas.getBoundingClientRect();
        this.mousePosition = new Vec2(Utils.clamp(Math.floor(e.clientX - rect.left), 0, this.width - 1), Utils.clamp(Math.floor(e.clientY - rect.top), 0, this.width - 1));
    }
    onMouseMove(e) {
        if (this.status < InitializationStatus.Initialized) {
            return;
        }
        this.setMousePosition(e);
        if (this.selectedTilePos === null) {
            return;
        }
        let tp = new Vec2(Math.floor(this.mousePosition.x / 64), Math.floor(this.mousePosition.y / 64));
        if (!tp.equals(this.selectedTilePos)) {
            this.selectedTilePos = null;
        }
    }
    onMouseDown(e) {
        if (this.status < InitializationStatus.Initialized) {
            return;
        }
        this.setMousePosition(e);
        let tp = new Vec2(Math.floor(this.mousePosition.x / 64), Math.floor(this.mousePosition.y / 64));
        if (tp.x < this.mapWidth && tp.y < this.mapHeight) {
            this.selectedTilePos = tp;
            this.mouseButton = e.button;
        }
    }
    onMouseUp(e) {
        var _a;
        if (this.status < InitializationStatus.Initialized) {
            return;
        }
        this.setMousePosition(e);
        if (this.selectedTilePos != null) {
            (_a = this.selectedTile) === null || _a === void 0 ? void 0 : _a.onClick(this.mouseButton, this.mousePosition.x % 64, this.mousePosition.y % 64);
            this.selectedTilePos = null;
        }
        this.mouseButton = null;
    }
    onKeyDown(e) {
        if (this.status < InitializationStatus.Initialized) {
            return;
        }
        switch (e.key.toUpperCase()) {
            case 'Q':
                this.selectedTurretElement = TurretElement.Air;
                break;
            case 'W':
                this.selectedTurretElement = TurretElement.Earth;
                break;
            case 'E':
                this.selectedTurretElement = TurretElement.Fire;
                break;
            case 'R':
                this.selectedTurretElement = TurretElement.Water;
                break;
            case 'T':
                this.selectedTurretElement = null;
                break;
            case 'C':
                if (e.altKey) {
                    localStorage.clear();
                    alert("Cache cleared.");
                }
                break;
            case 'G':
                gen();
                break;
        }
    }
    onKeyUp(e) { }
    preRender() {
        let c = new PreRenderedImage(this.width, this.height);
        let ctx = c.ctx;
        ctx.fillStyle = "#C0C0C0";
        ctx.fillRect(0, 0, this.width, this.height);
        for (let x = 0; x < this.mapWidth; ++x) {
            for (let y = 0; y < this.mapHeight; ++y) {
                this.map[x][y].render(ctx, true);
            }
        }
        ctx.fillStyle = "#B5947E";
        let x = this.guiPanel.x, y = this.height - 192;
        for (let i = 0; i < 9; ++i) {
            Tile.drawPathGround(ctx, x + i % 3 * 64, y + Math.floor(i / 3) * 64);
        }
        ctx.fillStyle = "#606060";
        ctx.fillRect(this.guiPanel.x, this.guiPanel.y, 2, this.guiPanel.h);
        ctx.fillRect(this.guiPanel.x, this.guiPanel.y + this.guiPanel.h - 2, this.guiPanel.w, 2);
        this.castle.render(ctx);
        this.preRendered = c.image;
    }
    render() {
        switch (this.status) {
            case InitializationStatus.Uninitialized:
            case InitializationStatus.Initializing: {
                this.ctx.fillStyle = "#C0C0C0";
                this.ctx.fillRect(0, 0, this.width, this.height);
                this.ctx.fillStyle = "#000000";
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.font = "bold 32px serif";
                this.ctx.fillText("Loading", this.width / 2, this.height / 2);
                return;
            }
            case InitializationStatus.Initialized: {
                this.ctx.drawImage(this.preRendered, 0, 0);
                for (let x = 0; x < this.mapWidth; ++x) {
                    for (let y = 0; y < this.mapHeight; ++y) {
                        this.map[x][y].render(this.ctx, false);
                    }
                }
                this.particles.render(this.ctx, false);
                let fps = this.performanceMeter.getFps();
                this.ctx.fillStyle = "#000000";
                this.ctx.textAlign = "right";
                this.ctx.textBaseline = "top";
                this.ctx.font = "bold 16px serif";
                if (!isNaN(fps)) {
                    this.ctx.fillText(Math.floor(fps).toString(), this.guiPanel.x + this.guiPanel.w - 16, this.guiPanel.y + 16);
                }
                this.ctx.fillText(this.mousePosition.x.toString(), this.guiPanel.x + this.guiPanel.w - 16, this.guiPanel.y + 32);
                this.ctx.fillText(this.mousePosition.y.toString(), this.guiPanel.x + this.guiPanel.w - 16, this.guiPanel.y + 48);
                return;
            }
        }
    }
    static initializeAndRun() {
        let container = document.getElementById("zptd-game-container");
        if (container == null) {
            throw new Error('Html element with id "zptd-game-container" not found');
        }
        else {
            new Game(container).start();
        }
    }
}
Game.saveImages = true;
function gen() {
    let w = 258, h = 286;
    let c = new PreRenderedImage(w * 6, h * 4);
    let ctx = c.ctx, i = 0, c1 = "#A01713", c2 = "#FFE2A8", ch = "#CF7C5D";
    ctx.fillStyle = "#404040";
    ctx.fillRect(0, 0, w * 6, h * 4);
    function label(line1, line2) {
        let x = i % 6 * w + 1;
        let y = Math.floor(i / 6) * h + 257;
        ctx.fillStyle = "#C0C0C0";
        ctx.fillRect(x, y, 256, 28);
        ctx.fillStyle = "#000000";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = "bold 16px serif";
        ctx.fillText(line1, x + 6, y + 14, 248);
        if (line2) {
            ctx.textAlign = "right";
            ctx.fillText(`(${line2})`, x + 250, y + 12, 248);
        }
    }
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Cells, CellularTextureDistanceMetric.Euclidean).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Cellular", "Cells, Euclidean");
    ++i;
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Cells, CellularTextureDistanceMetric.Manhattan).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Cellular", "Cells, Manhattan");
    ++i;
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Balls, CellularTextureDistanceMetric.Euclidean).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Cellular", "Balls, Euclidean");
    ++i;
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Balls, CellularTextureDistanceMetric.Manhattan).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Cellular", "Balls, Manhattan");
    ++i;
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Net, CellularTextureDistanceMetric.Euclidean).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Cellular", "Net, Euclidean");
    ++i;
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Net, CellularTextureDistanceMetric.Manhattan).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Cellular", "Net, Manhattan");
    ++i;
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Cells, CellularTextureDistanceMetric.Chebyshev).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Cellular", "Cells, Chebyshev");
    ++i;
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Cells, CellularTextureDistanceMetric.Minkowski).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Cellular", "Cells, Minkowski");
    ++i;
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Balls, CellularTextureDistanceMetric.Chebyshev).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Cellular", "Balls, Chebyshev");
    ++i;
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Balls, CellularTextureDistanceMetric.Minkowski).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Cellular", "Balls, Minkowski");
    ++i;
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Net, CellularTextureDistanceMetric.Chebyshev).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Cellular", "Net, Chebyshev");
    ++i;
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Net, CellularTextureDistanceMetric.Minkowski).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Cellular", "Net, Minkowski");
    ++i;
    ctx.drawImage(new NoiseTextureGenerator(256, 256, ch, 0.5, 0.5, 1).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Noise");
    ++i;
    ctx.drawImage(new PerlinNoiseTextureGenerator(256, 256, c1, c2, 1).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Perlin", "Noise");
    ++i;
    ctx.drawImage(new CloudsTextureGenerator(256, 256, c1, c2, 1).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Perlin", "Clouds");
    ++i;
    ctx.drawImage(new VelvetTextureGenerator(256, 256, c1, c2, 1).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Perlin", "Velvet");
    ++i;
    ctx.drawImage(new GlassTextureGenerator(256, 256, c1, c2, 1, 1).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Perlin", "Glass");
    ++i;
    ctx.drawImage(new FrostedGlassTextureGenerator(256, 256, c1, c2, 1).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Perlin", "Frosted glass");
    ++i;
    ctx.drawImage(new BarkTextureGenerator(256, 256, c1, c2, 1, 0.75).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Perlin", "Bark");
    ++i;
    ctx.drawImage(new CirclesTextureGenerator(256, 256, c1, c2, ch, 1, 4, 1).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Perlin", "Circles");
    ++i;
    ctx.drawImage(new CamouflageTextureGenerator(256, 256, c1, c2, 1).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Perlin", "Camouflage");
    ++i;
    let grads = [
        new RadialGradientSource(256, 256, 128, 128, 0, 128),
        new LinearGradientSource(256, 256, 0, 128, 256, 128)
    ];
    for (const g of grads) {
        g.addColorStop(0.000, "#FF0000");
        g.addColorStop(0.167, "#FFFF00");
        g.addColorStop(0.333, "#00FF00");
        g.addColorStop(0.500, "#00FFFF");
        g.addColorStop(0.667, "#0000FF");
        g.addColorStop(0.833, "#FF00FF");
        g.addColorStop(1.000, "#FF0000");
    }
    ctx.drawImage(grads[0].generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Gradient", "Radial");
    ++i;
    ctx.drawImage(new FisheyeSource(256, 256, grads[1], 0.5, 128, 128, 128).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Gradient", "Linear, Fisheye[+]");
    ++i;
    ctx.drawImage(new FisheyeSource(256, 256, grads[1], -0.5, 128, 128, 128).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1);
    label("Gradient", "Linear, Fisheye[-]");
    c.saveImage("textures");
}
