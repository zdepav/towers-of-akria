var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Utils = (function () {
    function Utils() {
    }
    Utils.sign = function (value) {
        return value < 0 ? -1 : value > 0 ? 1 : 0;
    };
    Utils.clamp = function (value, min, max) {
        return value > max ? max : value < min ? min : value;
    };
    Utils.wrap = function (value, min, max) {
        value -= min;
        var range = max - min;
        if (value < 0) {
            value = range - (-value) % range;
        }
        return value % range + min;
    };
    Utils.lerp = function (f1, f2, ammount) {
        if (ammount <= 0) {
            return f1;
        }
        else if (ammount >= 1) {
            return f2;
        }
        else {
            return f1 + ammount * (f2 - f1);
        }
    };
    Utils.lerpInt = function (f1, f2, ammount) {
        if (ammount <= 0) {
            return Math.floor(f1);
        }
        else if (ammount >= 1) {
            return Math.floor(f2);
        }
        else {
            return Math.floor((1 - ammount) * Math.floor(f1) + ammount * (Math.floor(f2) + 0.9999));
        }
    };
    Utils.interpolateSmooth = function (f1, f2, ammount) {
        if (ammount <= 0) {
            return f1;
        }
        else if (ammount >= 1) {
            return f2;
        }
        else {
            return f1 + (1 - Math.cos(ammount * Math.PI)) * 0.5 * (f2 - f1);
        }
    };
    Utils.flatten = function (width, x, y) {
        return width * y + x;
    };
    Utils.granulate = function (value, steps) {
        return Math.floor(value * steps) / steps + 1 / steps / 2;
    };
    Utils.euclideanDistance = function (dx, dy) {
        return Math.sqrt(dx * dx + dy * dy);
    };
    Utils.manhattanDistance = function (dx, dy) {
        return Math.abs(dx) + Math.abs(dy);
    };
    Utils.chebyshevDistance = function (dx, dy) {
        return Math.max(Math.abs(dx), Math.abs(dy));
    };
    Utils.minkowskiDistance = function (dx, dy) {
        var d = Math.sqrt(Math.abs(dx)) + Math.sqrt(Math.abs(dy));
        return d * d;
    };
    Utils.byteToHex = function (byte) {
        byte = Utils.clamp(byte, 0, 255);
        return Utils.hex[Math.floor(byte / 16)] + Utils.hex[Math.floor(byte % 16)];
    };
    Utils.ldx = function (distance, direction, startX) {
        if (startX === void 0) { startX = 0; }
        return startX + distance * Math.cos(direction);
    };
    Utils.ldy = function (distance, direction, startY) {
        if (startY === void 0) { startY = 0; }
        return startY + distance * Math.sin(direction);
    };
    Utils.ld = function (distance, direction, startX, startY) {
        if (startX === void 0) { startX = 0; }
        if (startY === void 0) { startY = 0; }
        return new Vec2(startX + distance * Math.cos(direction), startY + distance * Math.sin(direction));
    };
    Utils.rotatePoint = function (x, y, originX, originY, angle) {
        x -= originX;
        y -= originY;
        var c = Math.cos(angle), s = Math.sin(angle);
        return new Vec2(x * c - y * s + originX, x * s + y * c + originY);
    };
    Utils.getAngle = function (x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    };
    Utils.angleBetween = function (angle1, angle2) {
        angle1 %= Angle.deg360;
        angle2 %= Angle.deg360;
        var diff = Math.abs(angle2 - angle1);
        if (diff <= Angle.deg180) {
            return (angle1 + angle2) / 2;
        }
        else {
            return ((angle1 + angle2) / 2 + Angle.deg180) % Angle.deg360;
        }
    };
    Utils.rand = function (min, max) {
        if (max <= min) {
            return min;
        }
        return Math.random() * (max - min) + min;
    };
    Utils.randInt = function (min, max) {
        if (max <= min) {
            return min;
        }
        return Math.floor(Math.random() * (max - min) + min);
    };
    Utils.isString = function (obj) {
        return typeof obj === 'string' || obj instanceof String;
    };
    Utils.hex = "0123456789abcdef";
    return Utils;
}());
var MouseButton;
(function (MouseButton) {
    MouseButton[MouseButton["Left"] = 0] = "Left";
    MouseButton[MouseButton["Middle"] = 1] = "Middle";
    MouseButton[MouseButton["Right"] = 2] = "Right";
    MouseButton[MouseButton["Back"] = 3] = "Back";
    MouseButton[MouseButton["Forward"] = 4] = "Forward";
})(MouseButton || (MouseButton = {}));
var RenderablePath = (function () {
    function RenderablePath(path, fill) {
        this.path = path;
        this.fill = fill;
    }
    RenderablePath.prototype.render = function (ctx) {
        ctx.fillStyle = this.fill;
        ctx.fill(this.path);
    };
    return RenderablePath;
}());
var RenderablePathSet = (function () {
    function RenderablePathSet(paths) {
        this.paths = paths === undefined ? [] : paths;
    }
    RenderablePathSet.prototype.push = function (path) {
        this.paths.push(path);
    };
    RenderablePathSet.prototype.pushNew = function (path, fill) {
        if (fill === null) {
            return;
        }
        this.paths.push(new RenderablePath(path, fill));
    };
    RenderablePathSet.prototype.render = function (ctx) {
        for (var i = 0; i < this.paths.length; ++i) {
            this.paths[i].render(ctx);
        }
    };
    RenderablePathSet.prototype.pushPolygon = function (points, fill, originX, originY) {
        if (originX === void 0) { originX = 0; }
        if (originY === void 0) { originY = 0; }
        if (fill === null || points.length % 2 !== 0 || points.length < 6) {
            return;
        }
        var path = new Path2D();
        path.moveTo(originX + points[0], originY + points[1]);
        for (var i = 2; i < points.length; i += 2) {
            path.lineTo(originX + points[i], originY + points[i + 1]);
        }
        path.closePath();
        this.paths.push(new RenderablePath(path, fill));
    };
    return RenderablePathSet;
}());
var PreRenderedImage = (function () {
    function PreRenderedImage(width, height) {
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        this.ctx = canvas.getContext("2d");
        this.image = canvas;
    }
    PreRenderedImage.prototype.saveImage = function (fileName) {
        var a = document.createElement("a");
        a.setAttribute("download", fileName + ".png");
        a.setAttribute("href", this.image
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream"));
        a.setAttribute("target", "_blank");
        a.click();
    };
    return PreRenderedImage;
}());
var PerformanceMeter = (function () {
    function PerformanceMeter() {
        this.queue = [];
        this.sum = 0;
    }
    PerformanceMeter.prototype.add = function (fps) {
        this.queue.push(fps);
        this.sum += fps;
        if (this.queue.length > 100) {
            this.sum -= this.queue.shift();
        }
    };
    PerformanceMeter.prototype.getFps = function () {
        return this.queue.length > 0 ? this.sum / this.queue.length : NaN;
    };
    return PerformanceMeter;
}());
var Rect = (function () {
    function Rect(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    return Rect;
}());
var Vec2 = (function () {
    function Vec2(x, y) {
        this.x = x;
        this.y = y;
        this.len = null;
    }
    Vec2.prototype.add = function (v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    };
    Vec2.prototype.uadd = function (x, y) {
        return new Vec2(this.x + x, this.y + y);
    };
    Vec2.prototype.sub = function (v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    };
    Vec2.prototype.usub = function (x, y) {
        return new Vec2(this.x - x, this.y - y);
    };
    Vec2.prototype.dot = function (v) {
        return this.x * v.x + this.y * v.y;
    };
    Vec2.prototype.udot = function (x, y) {
        return this.x * x + this.y * y;
    };
    Vec2.prototype.mul = function (f) {
        return new Vec2(this.x * f, this.y * f);
    };
    Vec2.prototype.length = function () {
        if (this.len === null) {
            this.len = Math.sqrt(this.x * this.x + this.y * this.y);
        }
        return this.len;
    };
    Vec2.prototype.normalize = function () {
        var l = 1 / this.length();
        return new Vec2(this.x * l, this.y * l);
    };
    Vec2.prototype.isZero = function () {
        return this.x === 0 && this.y === 0;
    };
    Vec2.prototype.equals = function (v) {
        return this.x === v.x && this.y === v.y;
    };
    Vec2.prototype.toString = function () {
        return this.x + ";" + this.y;
    };
    Vec2.randUnit = function () {
        var a = Angle.rand();
        return new Vec2(Utils.ldx(1, a), Utils.ldy(1, a));
    };
    Vec2.init = function () {
        Vec2.zero = new Vec2(0, 0);
    };
    return Vec2;
}());
Vec2.init();
var Vec2Set = (function () {
    function Vec2Set() {
        this.data = {};
        this.size = 0;
    }
    Vec2Set.prototype.add = function (value) {
        var s = value.toString();
        if (this.data[s] !== undefined) {
            return false;
        }
        else {
            this.data[s] = value;
            ++this.size;
            return true;
        }
    };
    Vec2Set.prototype.contains = function (value) {
        return this.data[value.toString()] !== undefined;
    };
    Vec2Set.prototype.remove = function (value) {
        var s = value.toString();
        if (this.data[s] !== undefined) {
            delete this.data[value.toString()];
            --this.size;
            return true;
        }
        else {
            return false;
        }
    };
    Vec2Set.prototype.values = function () {
        var r = [];
        for (var v in this.data) {
            r.push(this.data[v]);
        }
        return r;
    };
    return Vec2Set;
}());
var DijkstraNode = (function () {
    function DijkstraNode(x, y, previous) {
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
    return DijkstraNode;
}());
var Angle = (function () {
    function Angle() {
    }
    Angle.deg = function (radians) {
        return radians * Angle.rad2deg;
    };
    Angle.rand = function () {
        return Math.random() * Angle.deg360;
    };
    Angle.init = function () {
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
    };
    return Angle;
}());
Angle.init();
var ColorSource = (function () {
    function ColorSource(width, height) {
        this.width = Math.max(1, Math.floor(width));
        this.height = Math.max(1, Math.floor(height));
    }
    ColorSource.prototype.getColor = function (x, y) {
        return this._getColor(Utils.wrap(x, 0, this.width), Utils.wrap(y, 0, this.height));
    };
    ColorSource.prototype.generateImage = function () {
        var tex = new PreRenderedImage(this.width, this.height);
        for (var x = 0; x < this.width; ++x) {
            for (var y = 0; y < this.height; ++y) {
                tex.ctx.fillStyle = this._getColor(x, y).toCss();
                tex.ctx.fillRect(x, y, 1, 1);
            }
        }
        return tex.image;
    };
    ColorSource.get = function (color) {
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
    };
    return ColorSource;
}());
var CanvasColorSource = (function (_super) {
    __extends(CanvasColorSource, _super);
    function CanvasColorSource(canvas, ctx) {
        var _this = _super.call(this, canvas.width, canvas.height) || this;
        _this.ctx = ctx === undefined ? canvas.getContext("2d") : ctx;
        return _this;
    }
    CanvasColorSource.prototype._getColor = function (x, y) {
        var data = this.ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
        return new RgbaColor(data[0], data[1], data[2], data[3]);
    };
    CanvasColorSource.prototype.generateImage = function () {
        var tex = new PreRenderedImage(this.width, this.height);
        tex.ctx.putImageData(this.ctx.getImageData(0, 0, this.width, this.height), 0, 0);
        return tex.image;
    };
    return CanvasColorSource;
}(ColorSource));
var RgbaColor = (function () {
    function RgbaColor(r, g, b, a) {
        if (a === void 0) { a = 255; }
        this.r = Math.floor(Utils.clamp(r, 0, 255));
        this.g = Math.floor(Utils.clamp(g, 0, 255));
        this.b = Math.floor(Utils.clamp(b, 0, 255));
        this.a = Math.floor(Utils.clamp(a, 0, 255));
    }
    RgbaColor.fromHex = function (color) {
        if (/^#[0-9a-f]{3}[0-9a-f]?$/i.test(color)) {
            var a = color.length > 4 ? parseInt(color[4], 16) * 17 : 255;
            return new RgbaColor(parseInt(color[1], 16) * 17, parseInt(color[2], 16) * 17, parseInt(color[3], 16) * 17, a);
        }
        else if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(color)) {
            var a = color.length > 7 ? parseInt(color.substr(7, 2), 16) : 255;
            return new RgbaColor(parseInt(color.substr(1, 2), 16), parseInt(color.substr(3, 2), 16), parseInt(color.substr(5, 2), 16), a);
        }
        else
            throw new Error("Invalid color format");
    };
    RgbaColor.prototype.pr = function () { return this.r * this.a / 255; };
    RgbaColor.prototype.pg = function () { return this.g * this.a / 255; };
    RgbaColor.prototype.pb = function () { return this.b * this.a / 255; };
    RgbaColor.prototype.pa = function () { return this.a * this.a / 255; };
    RgbaColor.prototype.toCss = function () {
        return "#"
            + Utils.byteToHex(this.r)
            + Utils.byteToHex(this.g)
            + Utils.byteToHex(this.b)
            + Utils.byteToHex(this.a);
    };
    RgbaColor.prototype.multiplyFloat = function (ammount, multiplyAlpha) {
        if (multiplyAlpha === void 0) { multiplyAlpha = false; }
        return new RgbaColor(this.r * ammount, this.g * ammount, this.b * ammount, multiplyAlpha ? this.a * ammount : this.a);
    };
    RgbaColor.prototype.multiply = function (c) {
        return new RgbaColor(this.r * c.r, this.g * c.g, this.b * c.b, this.a * c.a);
    };
    RgbaColor.prototype.add = function (c) {
        return new RgbaColor(this.r + c.pr(), this.g + c.pg(), this.b + c.pb(), this.a + c.pa());
    };
    RgbaColor.prototype.blend = function (c) {
        if (this.a === 0) {
            return c.a === 0 ? this : c;
        }
        else if (c.a === 0) {
            return this;
        }
        else {
            return new RgbaColor(this.r + c.pr(), this.g + c.pg(), this.b + c.pb(), this.a + c.a * (255 - this.a) / 255);
        }
    };
    RgbaColor.prototype.withRed = function (r) { return new RgbaColor(r, this.g, this.b, this.a); };
    RgbaColor.prototype.withGreen = function (g) { return new RgbaColor(this.r, g, this.b, this.a); };
    RgbaColor.prototype.withBlue = function (b) { return new RgbaColor(this.r, this.g, b, this.a); };
    RgbaColor.prototype.withAlpha = function (a) { return new RgbaColor(this.r, this.g, this.b, a); };
    RgbaColor.prototype.lerp = function (c, ammount) {
        if (ammount >= 1) {
            return c;
        }
        else if (ammount <= 0) {
            return this;
        }
        else {
            var a2 = 1 - ammount;
            return new RgbaColor(this.r * a2 + c.r * ammount, this.g * a2 + c.g * ammount, this.b * a2 + c.b * ammount, this.a * a2 + c.a * ammount);
        }
    };
    RgbaColor.prototype.addNoise = function (intensity, saturation, coverage) {
        if (Math.random() < coverage) {
            intensity *= 255;
            if (saturation <= 0) {
                var n = Utils.rand(-intensity, intensity);
                return new RgbaColor(this.r + n, this.g + n, this.b + n, this.a);
            }
            else if (saturation >= 1) {
                return new RgbaColor(this.r + Utils.rand(-intensity, intensity), this.g + Utils.rand(-intensity, intensity), this.b + Utils.rand(-intensity, intensity), this.a);
            }
            else {
                var s2 = 1 - saturation;
                var rn = Utils.rand(-intensity, intensity);
                var gn = saturation * Utils.rand(-intensity, intensity) + s2 * rn;
                var bn = saturation * Utils.rand(-intensity, intensity) + s2 * rn;
                return new RgbaColor(this.r + rn, this.g + gn, this.b + bn, this.a);
            }
        }
        else {
            return this;
        }
    };
    RgbaColor.prototype.source = function (width, height) {
        if (width === void 0) { width = 1; }
        if (height === void 0) { height = 1; }
        return new RgbaColorSource(this, width, height);
    };
    RgbaColor.init = function () {
        RgbaColor.transparent = new RgbaColor(0, 0, 0, 0);
        RgbaColor.black = new RgbaColor(0, 0, 0);
        RgbaColor.red = new RgbaColor(255, 0, 0);
        RgbaColor.green = new RgbaColor(0, 255, 0);
        RgbaColor.blue = new RgbaColor(0, 0, 255);
        RgbaColor.yellow = new RgbaColor(255, 255, 0);
        RgbaColor.cyan = new RgbaColor(0, 255, 255);
        RgbaColor.magenta = new RgbaColor(255, 0, 255);
        RgbaColor.white = new RgbaColor(255, 255, 255);
    };
    return RgbaColor;
}());
RgbaColor.init();
var RgbaColorSource = (function (_super) {
    __extends(RgbaColorSource, _super);
    function RgbaColorSource(color, width, height) {
        if (width === void 0) { width = 1; }
        if (height === void 0) { height = 1; }
        var _this = _super.call(this, width, height) || this;
        _this.color = color;
        return _this;
    }
    RgbaColorSource.prototype._getColor = function (x, y) { return this.color; };
    RgbaColorSource.prototype.generateImage = function () {
        var tex = new PreRenderedImage(this.width, this.height);
        tex.ctx.fillStyle = this.color.toCss();
        tex.ctx.fillRect(0, 0, this.width, this.height);
        return tex.image;
    };
    return RgbaColorSource;
}(ColorSource));
var TextureGenerator = (function (_super) {
    __extends(TextureGenerator, _super);
    function TextureGenerator(width, height, color) {
        var _this = _super.call(this, width, height) || this;
        _this.color = ColorSource.get(color !== null ? color : RgbaColor.black);
        return _this;
    }
    return TextureGenerator;
}(ColorSource));
var CellularTextureType;
(function (CellularTextureType) {
    CellularTextureType[CellularTextureType["Lava"] = 0] = "Lava";
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
var CellularTextureGenerator = (function (_super) {
    __extends(CellularTextureGenerator, _super);
    function CellularTextureGenerator(width, height, density, color1, color2, type, metric) {
        if (type === void 0) { type = CellularTextureType.Lava; }
        if (metric === void 0) { metric = CellularTextureDistanceMetric.Euclidean; }
        var _this = _super.call(this, width, height, color1) || this;
        _this.color2 = ColorSource.get(color2 !== null ? color2 : RgbaColor.white);
        _this.type = type;
        var distance;
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
        _this.density = Math.max(1, density);
        var points = [];
        var pointCount = _this.width * _this.height / _this.density;
        if (pointCount < 2) {
            pointCount = 2;
        }
        for (var i_1 = 0; i_1 < pointCount; ++i_1) {
            points[i_1] = new Vec2(Math.random() * _this.width, Math.random() * _this.height);
        }
        _this.distances = [];
        _this.min = Infinity;
        var max = 0, i, d;
        for (var x = 0; x < _this.width; ++x) {
            for (var y = 0; y < _this.height; ++y) {
                var _a = CellularTextureGenerator.distancesTo2Nearest(x, y, _this.width, _this.height, points, distance), min1 = _a.min1, min2 = _a.min2;
                switch (_this.type) {
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
                _this.min = Math.min(_this.min, d);
                max = Math.max(max, d);
                _this.distances[Utils.flatten(_this.width, x, y)] = d;
            }
        }
        _this.range = max - _this.min;
        return _this;
    }
    CellularTextureGenerator.wrappedDistance = function (x, y, width, height, b, distance) {
        var dx = Math.abs(x - b.x);
        var dy = Math.abs(y - b.y);
        if (dx > width / 2) {
            dx = width - dx;
        }
        if (dy > height / 2) {
            dy = height - dy;
        }
        return distance(dx, dy);
    };
    CellularTextureGenerator.distancesTo2Nearest = function (x, y, width, height, points, distance) {
        var min1 = Infinity;
        var min2 = Infinity;
        for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
            var p = points_1[_i];
            var d = CellularTextureGenerator.wrappedDistance(x, y, width, height, p, distance);
            if (d < min1) {
                min2 = min1;
                min1 = d;
            }
            else if (d < min2) {
                min2 = d;
            }
        }
        return { min1: min1, min2: min2 };
    };
    CellularTextureGenerator.prototype._getColor = function (x, y) {
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), (this.distances[Utils.flatten(this.width, x, y)] - this.min) / this.range);
    };
    return CellularTextureGenerator;
}(TextureGenerator));
var NoiseTextureGenerator = (function (_super) {
    __extends(NoiseTextureGenerator, _super);
    function NoiseTextureGenerator(width, height, color, intensity, saturation, coverage) {
        var _this = _super.call(this, width, height, color) || this;
        _this.intensity = Utils.clamp(intensity, 0, 1);
        _this.saturation = Utils.clamp(saturation, 0, 1);
        _this.coverage = Utils.clamp(coverage, 0, 1);
        _this.cache = [];
        return _this;
    }
    NoiseTextureGenerator.prototype._getColor = function (x, y) {
        var i = Utils.flatten(this.width, Math.floor(x), Math.floor(y));
        if (this.cache[i] === undefined) {
            this.cache[i] = this.color.getColor(x, y).addNoise(this.intensity, this.saturation, this.coverage);
        }
        return this.cache[i];
    };
    return NoiseTextureGenerator;
}(TextureGenerator));
var PerlinGradient = (function () {
    function PerlinGradient(width, height) {
        this.width = Math.ceil(width);
        this.height = Math.ceil(height);
        this.data = [];
        var c = this.width * this.height;
        for (var i = 0; i < c; ++i) {
            this.data.push(Vec2.randUnit());
        }
    }
    PerlinGradient.prototype.get = function (x, y) {
        return this.data[Utils.wrap(x, 0, this.width) +
            Utils.wrap(y, 0, this.height) * this.width];
    };
    return PerlinGradient;
}());
var PerlinTextureGenerator = (function (_super) {
    __extends(PerlinTextureGenerator, _super);
    function PerlinTextureGenerator(width, height, color1, color2, scale) {
        if (scale === void 0) { scale = 1; }
        var _this = _super.call(this, width, height, color1) || this;
        _this.color2 = ColorSource.get(color2 !== null ? color2 : RgbaColor.white);
        _this.scale = 1 / (scale * 32);
        return _this;
    }
    PerlinTextureGenerator.prototype.dotGridGradient = function (gradient, ix, iy, x, y) {
        return gradient.get(ix, iy).udot(x - ix, y - iy);
    };
    PerlinTextureGenerator.prototype.perlin = function (gradient, x, y) {
        var x0 = Math.floor(x);
        var x1 = x0 + 1;
        var y0 = Math.floor(y);
        var y1 = y0 + 1;
        var sx = x - x0;
        var sy = y - y0;
        return Utils.interpolateSmooth(Utils.interpolateSmooth(this.dotGridGradient(gradient, x0, y0, x, y), this.dotGridGradient(gradient, x1, y0, x, y), sx), Utils.interpolateSmooth(this.dotGridGradient(gradient, x0, y1, x, y), this.dotGridGradient(gradient, x1, y1, x, y), sx), sy);
    };
    return PerlinTextureGenerator;
}(TextureGenerator));
var PerlinNoiseTextureGenerator = (function (_super) {
    __extends(PerlinNoiseTextureGenerator, _super);
    function PerlinNoiseTextureGenerator(width, height, color1, color2, scale) {
        if (scale === void 0) { scale = 1; }
        var _this = _super.call(this, width, height, color1, color2, scale) || this;
        _this.gradient = new PerlinGradient(_this.width * _this.scale, _this.height * _this.scale);
        return _this;
    }
    PerlinNoiseTextureGenerator.prototype._getColor = function (x, y) {
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), this.perlin(this.gradient, x * this.scale, y * this.scale) / 2 + 0.5);
    };
    return PerlinNoiseTextureGenerator;
}(PerlinTextureGenerator));
var CloudsTextureGenerator = (function (_super) {
    __extends(CloudsTextureGenerator, _super);
    function CloudsTextureGenerator(width, height, color1, color2, scale) {
        if (scale === void 0) { scale = 1; }
        var _this = _super.call(this, width, height, color1, color2, scale) || this;
        _this.scales = [
            _this.scale / 4,
            _this.scale / 2,
            _this.scale,
            _this.scale * 2,
            _this.scale * 4,
            _this.scale * 8
        ];
        _this.coeficients = [0.5, 0.25, 0.125, 0.0625, 0.03125, 0.03125];
        _this.gradients = [];
        for (var i = 0; i < 6; ++i) {
            _this.gradients.push(new PerlinGradient(_this.width * _this.scales[i], _this.height * _this.scales[i]));
        }
        return _this;
    }
    CloudsTextureGenerator.prototype._getColor = function (x, y) {
        var v = 0;
        for (var i = 0; i < 6; ++i) {
            v += this.perlin(this.gradients[i], x * this.scales[i], y * this.scales[i]) * this.coeficients[i];
        }
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), v / 2 + 0.5);
    };
    return CloudsTextureGenerator;
}(PerlinTextureGenerator));
var VelvetTextureGenerator = (function (_super) {
    __extends(VelvetTextureGenerator, _super);
    function VelvetTextureGenerator(width, height, color1, color2, scale) {
        if (scale === void 0) { scale = 1; }
        var _this = _super.call(this, width, height, color1, color2, scale) || this;
        _this.gradients = [];
        var w = _this.width * _this.scale, h = _this.height * _this.scale;
        for (var i = 0; i < 3; ++i) {
            _this.gradients.push(new PerlinGradient(w, h));
        }
        return _this;
    }
    VelvetTextureGenerator.prototype._getColor = function (x, y) {
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), this.perlin(this.gradients[0], x * this.scale + this.perlin(this.gradients[1], x * this.scale, y * this.scale), y * this.scale + this.perlin(this.gradients[2], x * this.scale, y * this.scale)) / 2 + 0.5);
    };
    return VelvetTextureGenerator;
}(PerlinTextureGenerator));
var GlassTextureGenerator = (function (_super) {
    __extends(GlassTextureGenerator, _super);
    function GlassTextureGenerator(width, height, color1, color2, scale, turbulence) {
        if (scale === void 0) { scale = 1; }
        if (turbulence === void 0) { turbulence = 1; }
        var _this = _super.call(this, width, height, color1, color2, scale) || this;
        _this.turbulence = 0.125 * turbulence;
        _this.gradients = [];
        var w = _this.width * _this.scale, h = _this.height * _this.scale;
        for (var i = 0; i < 3; ++i) {
            _this.gradients.push(new PerlinGradient(w, h));
        }
        return _this;
    }
    GlassTextureGenerator.prototype._getColor = function (x, y) {
        var _x = Math.cos((this.perlin(this.gradients[1], x * this.scale, y * this.scale) * 128 + 128) * this.turbulence);
        var _y = Math.sin((this.perlin(this.gradients[2], x * this.scale, y * this.scale) * 128 + 128) * this.turbulence);
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), this.perlin(this.gradients[0], x * this.scale + _x, y * this.scale + _y) / 2 + 0.5);
    };
    return GlassTextureGenerator;
}(PerlinTextureGenerator));
var FrostedGlassTextureGenerator = (function (_super) {
    __extends(FrostedGlassTextureGenerator, _super);
    function FrostedGlassTextureGenerator(width, height, color1, color2, scale) {
        if (scale === void 0) { scale = 1; }
        var _this = _super.call(this, width, height, color1, color2, scale) || this;
        _this.scales = [_this.scale, _this.scale * 2, _this.scale * 4];
        _this.coeficients = [0.5, 0.25, 0.25];
        _this.gradients = [];
        for (var i = 0; i < 7; ++i) {
            _this.gradients.push(new PerlinGradient(_this.width * _this.scales[i % 3], _this.height * _this.scales[i % 3]));
        }
        return _this;
    }
    FrostedGlassTextureGenerator.prototype._getColor = function (x, y) {
        var _x = x * this.scale, _y = y * this.scale;
        for (var i = 0; i < 3; ++i) {
            _x += this.perlin(this.gradients[i], x * this.scales[i], y * this.scales[i]) * this.coeficients[i];
            _y += this.perlin(this.gradients[i + 3], x * this.scales[i], y * this.scales[i]) * this.coeficients[i];
        }
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), this.perlin(this.gradients[6], _x, _y) / 2 + 0.5);
    };
    return FrostedGlassTextureGenerator;
}(PerlinTextureGenerator));
var BarkTextureGenerator = (function (_super) {
    __extends(BarkTextureGenerator, _super);
    function BarkTextureGenerator(width, height, color1, color2, scale) {
        if (scale === void 0) { scale = 1; }
        var _this = _super.call(this, width, height, color1, color2, scale) || this;
        _this.scales = [_this.scale, _this.scale * 2, _this.scale * 4, _this.scale * 6];
        _this.coeficients = [0.5, 0.25, 0.25];
        _this.gradients = [];
        for (var i = 0; i < 4; ++i) {
            _this.gradients.push(new PerlinGradient(_this.width * _this.scales[i], _this.height * _this.scales[i]));
        }
        return _this;
    }
    BarkTextureGenerator.prototype._getColor = function (x, y) {
        var v = 0;
        for (var i = 0; i < 3; ++i) {
            v += this.perlin(this.gradients[i], x * this.scales[i], y * this.scales[i]) * this.coeficients[i];
        }
        v = Utils.granulate(Math.sin(2 * x * this.scale * Math.PI + 8 * v), 2);
        v += Utils.granulate(this.perlin(this.gradients[3], x * this.scales[3], y * this.scales[3]), 5);
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), v / 4 + 0.5);
    };
    return BarkTextureGenerator;
}(PerlinTextureGenerator));
var CirclesTextureGenerator = (function (_super) {
    __extends(CirclesTextureGenerator, _super);
    function CirclesTextureGenerator(width, height, color1, color2, background, scale, ringCount, turbulence) {
        if (scale === void 0) { scale = 1; }
        if (ringCount === void 0) { ringCount = Infinity; }
        if (turbulence === void 0) { turbulence = 1; }
        var _this = _super.call(this, width, height, color1, color2, scale) || this;
        _this.ringCount = ringCount;
        _this.ringCountL = _this.ringCount - 0.25;
        _this.turbulence = turbulence / 2;
        _this.background = ColorSource.get(background !== null ? background : RgbaColor.transparent);
        _this.gradients = [];
        _this.scale2 = _this.scale * 2;
        for (var i = 0; i < 2; ++i) {
            _this.gradients.push(new PerlinGradient(_this.width * _this.scale2, _this.height * _this.scale2));
        }
        _this.cx = _this.width * _this.scale / 2;
        _this.cy = _this.height * _this.scale / 2;
        return _this;
    }
    CirclesTextureGenerator.prototype._getColor = function (x, y) {
        var _x = x * this.scale + this.perlin(this.gradients[0], x * this.scale2, y * this.scale2) * this.turbulence - this.cx;
        var _y = y * this.scale + this.perlin(this.gradients[1], x * this.scale2, y * this.scale2) * this.turbulence - this.cy;
        var d = Math.sqrt(_x * _x + _y * _y);
        if (d > this.ringCount) {
            return this.background.getColor(x, y);
        }
        else {
            var c = this.color.getColor(x, y).lerp(this.color2.getColor(x, y), Utils.interpolateSmooth(0, 1, 1 - Math.abs(1 - d % 1 * 2)));
            if (d > this.ringCountL) {
                return c.lerp(this.background.getColor(x, y), Utils.interpolateSmooth(0, 1, (d - this.ringCountL) * 4));
            }
            else {
                return c;
            }
        }
    };
    return CirclesTextureGenerator;
}(PerlinTextureGenerator));
var CamouflageTextureGenerator = (function (_super) {
    __extends(CamouflageTextureGenerator, _super);
    function CamouflageTextureGenerator(width, height, color1, color2, scale) {
        if (scale === void 0) { scale = 1; }
        var _this = _super.call(this, width, height, color1, color2, scale) || this;
        _this.scales = [_this.scale, _this.scale * 2, _this.scale * 4];
        _this.coeficients = [1.5, 0.75, 0.75];
        _this.gradients = [];
        for (var i = 0; i < 9; ++i) {
            _this.gradients.push(new PerlinGradient(_this.width * _this.scales[i % 3], _this.height * _this.scales[i % 3]));
        }
        return _this;
    }
    CamouflageTextureGenerator.prototype._getColor = function (x, y) {
        var _x = x * this.scale, _y = y * this.scale;
        for (var i = 0; i < 3; ++i) {
            _x += this.perlin(this.gradients[i], x * this.scales[i], y * this.scales[i]) * this.coeficients[i];
            _y += this.perlin(this.gradients[i + 3], x * this.scales[i], y * this.scales[i]) * this.coeficients[i];
        }
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), (Utils.granulate(this.perlin(this.gradients[6], _x, _y), 4) * 0.7 +
            Utils.granulate(this.perlin(this.gradients[7], _x * 2, _y * 2), 5) * 0.2 +
            Utils.granulate(this.perlin(this.gradients[8], _x * 4, _y * 4), 6) * 0.1) / 2 + 0.5);
    };
    return CamouflageTextureGenerator;
}(PerlinTextureGenerator));
var GradientSource = (function (_super) {
    __extends(GradientSource, _super);
    function GradientSource(width, height) {
        var _this = _super.call(this, width, height) || this;
        _this.colorStops = [];
        return _this;
    }
    GradientSource.prototype.addColorStop = function (pos, color) {
        this.colorStops.push({ pos: pos, color: ColorSource.get(color) });
        this.colorStops.sort(function (a, b) { return a.pos - b.pos; });
    };
    GradientSource.prototype.getColorAtPosition = function (x, y, position) {
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
            var i = 1;
            while (position > this.colorStops[i].pos) {
                ++i;
            }
            return this.colorStops[i - 1].color.getColor(x, y).lerp(this.colorStops[i].color.getColor(x, y), (position - this.colorStops[i - 1].pos) / (this.colorStops[i].pos - this.colorStops[i - 1].pos));
        }
    };
    return GradientSource;
}(ColorSource));
var LinearGradientSource = (function (_super) {
    __extends(LinearGradientSource, _super);
    function LinearGradientSource(width, height, x1, y1, x2, y2) {
        var _this = _super.call(this, width, height) || this;
        _this.a = x2 - x1;
        _this.b = y2 - y1;
        _this.c = -_this.a * x1 - _this.b * y1;
        _this.d = Math.sqrt(_this.a * _this.a + _this.b * _this.b);
        _this.d *= _this.d;
        return _this;
    }
    LinearGradientSource.prototype._getColor = function (x, y) {
        return this.getColorAtPosition(x, y, (this.a * x + this.b * y + this.c) / this.d);
    };
    return LinearGradientSource;
}(GradientSource));
var RadialGradientSource = (function (_super) {
    __extends(RadialGradientSource, _super);
    function RadialGradientSource(width, height, x, y, r1, r2) {
        var _this = _super.call(this, width, height) || this;
        _this.x = x;
        _this.y = y;
        _this.r1 = r1;
        _this.dr = r2 - r1;
        return _this;
    }
    RadialGradientSource.prototype._getColor = function (x, y) {
        var dx = x - this.x, dy = y - this.y;
        return this.getColorAtPosition(x, y, (Math.sqrt(dx * dx + dy * dy) - this.r1) / this.dr);
    };
    return RadialGradientSource;
}(GradientSource));
var ShapeSource = (function (_super) {
    __extends(ShapeSource, _super);
    function ShapeSource(width, height, color, background) {
        var _this = _super.call(this, width, height) || this;
        _this.color = ColorSource.get(color !== null ? color : RgbaColor.white);
        _this.background = ColorSource.get(background !== null ? background : RgbaColor.black);
        return _this;
    }
    return ShapeSource;
}(ColorSource));
var RectangleSource = (function (_super) {
    __extends(RectangleSource, _super);
    function RectangleSource(width, height, x, y, w, h, color, background) {
        var _this = _super.call(this, width, height, color, background) || this;
        _this.x = x;
        _this.y = y;
        _this.w = w;
        _this.h = h;
        return _this;
    }
    RectangleSource.prototype._getColor = function (x, y) {
        var _x = (x - this.x) / this.w, _y = (y - this.y) / this.h;
        return (_x >= 0 || _x < 1 || _y >= 0 || _y < 1) ? this.color.getColor(x, y) : this.background.getColor(x, y);
    };
    return RectangleSource;
}(ShapeSource));
var EllipseSource = (function (_super) {
    __extends(EllipseSource, _super);
    function EllipseSource(width, height, x, y, r1, r2, color, background) {
        var _this = _super.call(this, width, height, color, background) || this;
        _this.x = x;
        _this.y = y;
        _this.r1 = r1;
        _this.r2 = r2;
        return _this;
    }
    EllipseSource.prototype._getColor = function (x, y) {
        var _x = (x - this.x) / this.r1, _y = (y - this.y) / this.r2;
        return Math.sqrt(_x * _x + _y * _y) <= 1 ? this.color.getColor(x, y) : this.background.getColor(x, y);
    };
    return EllipseSource;
}(ShapeSource));
var PathSource = (function (_super) {
    __extends(PathSource, _super);
    function PathSource(width, height, path, color, background, fillRule) {
        if (fillRule === void 0) { fillRule = "nonzero"; }
        var _this = _super.call(this, width, height, color, background) || this;
        _this.path = path;
        _this.fillRule = fillRule;
        _this.ctx = new PreRenderedImage(1, 1).ctx;
        return _this;
    }
    PathSource.prototype._getColor = function (x, y) {
        return this.ctx.isPointInPath(this.path, x, y, this.fillRule) ? this.color.getColor(x, y) : this.background.getColor(x, y);
    };
    return PathSource;
}(ShapeSource));
var CombiningSource = (function (_super) {
    __extends(CombiningSource, _super);
    function CombiningSource(width, height, color1, color2) {
        var _this = _super.call(this, width, height) || this;
        _this.color1 = ColorSource.get(color1 !== null ? color1 : RgbaColor.black);
        _this.color2 = ColorSource.get(color2 !== null ? color2 : RgbaColor.white);
        return _this;
    }
    CombiningSource.prototype._getColor = function (x, y) {
        return this.combine(this.color1.getColor(x, y), this.color2.getColor(x, y));
    };
    return CombiningSource;
}(ColorSource));
var AddingSource = (function (_super) {
    __extends(AddingSource, _super);
    function AddingSource(width, height, color1, color2) {
        return _super.call(this, width, height, color1, color2) || this;
    }
    AddingSource.prototype.combine = function (a, b) {
        return a.add(b);
    };
    return AddingSource;
}(CombiningSource));
var MultiplyingSource = (function (_super) {
    __extends(MultiplyingSource, _super);
    function MultiplyingSource(width, height, color1, color2) {
        return _super.call(this, width, height, color1, color2) || this;
    }
    MultiplyingSource.prototype.combine = function (a, b) {
        return a.multiply(b);
    };
    return MultiplyingSource;
}(CombiningSource));
var BlendingSource = (function (_super) {
    __extends(BlendingSource, _super);
    function BlendingSource(width, height, color1, color2) {
        return _super.call(this, width, height, color1, color2) || this;
    }
    BlendingSource.prototype.combine = function (a, b) {
        return a.blend(b);
    };
    return BlendingSource;
}(CombiningSource));
var LerpingSource = (function (_super) {
    __extends(LerpingSource, _super);
    function LerpingSource(width, height, color1, color2, coeficient) {
        var _this = _super.call(this, width, height, color1, color2) || this;
        _this.coeficient = coeficient;
        return _this;
    }
    LerpingSource.prototype.combine = function (a, b) {
        return a.lerp(b, this.coeficient);
    };
    return LerpingSource;
}(CombiningSource));
var TransformingSource = (function (_super) {
    __extends(TransformingSource, _super);
    function TransformingSource(width, height, source) {
        var _this = _super.call(this, width, height) || this;
        _this.source = source;
        return _this;
    }
    TransformingSource.prototype._getColor = function (x, y) {
        var v = this.reverseTransform(x, y);
        return this.source.getColor(v.x, v.y);
    };
    return TransformingSource;
}(ColorSource));
var TranslatingSource = (function (_super) {
    __extends(TranslatingSource, _super);
    function TranslatingSource(width, height, source, xd, yd) {
        var _this = _super.call(this, width, height, source) || this;
        _this.xd = xd;
        _this.yd = yd;
        return _this;
    }
    TranslatingSource.prototype.reverseTransform = function (x, y) {
        return new Vec2(x - this.xd, y - this.yd);
    };
    return TranslatingSource;
}(TransformingSource));
var RotatingSource = (function (_super) {
    __extends(RotatingSource, _super);
    function RotatingSource(width, height, source, angle, originX, originY) {
        var _this = _super.call(this, width, height, source) || this;
        _this.angle = angle;
        _this.originX = originX;
        _this.originY = originY;
        return _this;
    }
    RotatingSource.prototype.reverseTransform = function (x, y) {
        return Utils.rotatePoint(x, y, this.originX, this.originY, -this.angle);
    };
    return RotatingSource;
}(TransformingSource));
var ScalingSource = (function (_super) {
    __extends(ScalingSource, _super);
    function ScalingSource(width, height, source, scale, originX, originY) {
        var _this = _super.call(this, width, height, source) || this;
        _this.scale = scale;
        _this.origin = new Vec2(originX, originY);
        return _this;
    }
    ScalingSource.prototype.reverseTransform = function (x, y) {
        var v = new Vec2(x, y), dv = v.sub(this.origin);
        if (dv.isZero()) {
            return v;
        }
        return v.add(dv.mul(1 / this.scale));
    };
    return ScalingSource;
}(TransformingSource));
var Particle = (function () {
    function Particle() {
    }
    Particle.prototype.step = function (time) { };
    Particle.prototype.render = function (ctx) { };
    Particle.prototype.isDead = function () { return true; };
    return Particle;
}());
var SmokeParticle = (function (_super) {
    __extends(SmokeParticle, _super);
    function SmokeParticle(x, y, startSize) {
        var _this = _super.call(this) || this;
        _this.x = x;
        _this.y = y;
        _this.life = 0;
        var lightness = Utils.randInt(112, 176);
        var h = Utils.byteToHex(lightness);
        _this.rgb = "#" + h + h + h;
        _this.startSize = startSize;
        return _this;
    }
    SmokeParticle.prototype.step = function (time) {
        this.life += time;
    };
    SmokeParticle.prototype.render = function (ctx) {
        if (this.life >= 1) {
            return;
        }
        var r = this.life * 8 + this.startSize;
        ctx.fillStyle = this.rgb + Utils.byteToHex(255 * (1 - this.life));
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Angle.deg360);
        ctx.fill();
    };
    SmokeParticle.prototype.isDead = function () {
        return this.life >= 1;
    };
    return SmokeParticle;
}(Particle));
var ParticleSystem = (function () {
    function ParticleSystem(game) {
        this.game = game;
        this.parts = [];
        this.count = 0;
    }
    ParticleSystem.prototype.add = function (p) {
        this.parts[this.count] = p;
        ++this.count;
    };
    ParticleSystem.prototype.step = function (time) {
        if (this.count === 0) {
            return;
        }
        var j = this.count;
        for (var i = 0; i < j; ++i) {
            var p = this.parts[i];
            p.step(time);
            if (p.isDead()) {
                --j;
                if (i < j) {
                    this.parts[i] = this.parts[j];
                }
            }
        }
        this.count = j;
    };
    ParticleSystem.prototype.render = function (ctx, preRender) {
        if (preRender) {
            return;
        }
        for (var _i = 0, _a = this.parts; _i < _a.length; _i++) {
            var p = _a[_i];
            p.render(ctx);
        }
    };
    return ParticleSystem;
}());
var TurretElement;
(function (TurretElement) {
    TurretElement[TurretElement["Air"] = 0] = "Air";
    TurretElement[TurretElement["Earth"] = 1] = "Earth";
    TurretElement[TurretElement["Fire"] = 2] = "Fire";
    TurretElement[TurretElement["Water"] = 3] = "Water";
})(TurretElement || (TurretElement = {}));
var TurretType = (function () {
    function TurretType(type) {
        this.type = type === undefined ? [0, 0, 0, 0] : type;
    }
    TurretType.prototype.copy = function () { return new TurretType(this.type.slice()); };
    TurretType.prototype.add = function (elem) {
        ++this.type[elem];
        return this;
    };
    TurretType.prototype.air = function () { return this.type[TurretElement.Air]; };
    TurretType.prototype.earth = function () { return this.type[TurretElement.Earth]; };
    TurretType.prototype.fire = function () { return this.type[TurretElement.Fire]; };
    TurretType.prototype.water = function () { return this.type[TurretElement.Water]; };
    TurretType.prototype.count = function () {
        var c = 0;
        for (var i = 0; i < 4; ++i) {
            c += this.type[i];
        }
        return c;
    };
    TurretType.prototype.contains = function (type) { return this.type[type] > 0; };
    TurretType.prototype.toArray = function () {
        var arr = [];
        for (var i = 0; i < this.type[TurretElement.Air]; ++i) {
            arr.push(TurretElement.Air);
        }
        for (var i = 0; i < this.type[TurretElement.Earth]; ++i) {
            arr.push(TurretElement.Earth);
        }
        for (var i = 0; i < this.type[TurretElement.Fire]; ++i) {
            arr.push(TurretElement.Fire);
        }
        for (var i = 0; i < this.type[TurretElement.Water]; ++i) {
            arr.push(TurretElement.Water);
        }
        return arr;
    };
    TurretType.prototype.toColorArray = function () {
        var arr = [];
        for (var i = 0; i < this.type[TurretElement.Air]; ++i) {
            arr.push("#d8d1ff");
        }
        for (var i = 0; i < this.type[TurretElement.Earth]; ++i) {
            arr.push("#6dd13e");
        }
        for (var i = 0; i < this.type[TurretElement.Fire]; ++i) {
            arr.push("#f7854c");
        }
        for (var i = 0; i < this.type[TurretElement.Water]; ++i) {
            arr.push("#79b4f2");
        }
        return arr;
    };
    return TurretType;
}());
var Turret = (function () {
    function Turret(tile, type) {
        this.game = tile.game;
        this.tile = tile;
        this.center = new Vec2(tile.pos.x + 32, tile.pos.y + 32);
        this.hp = 100;
        this.type = type === undefined ? new TurretType() : type;
        this.cooldown = 0;
    }
    Turret.prototype.step = function (time) {
        if (this.cooldown > 0) {
            this.cooldown -= time;
        }
    };
    Turret.prototype.render = function (ctx, preRender) { };
    Turret.prototype.getType = function () { return this.type.copy(); };
    Turret.prototype.upgradeCostMultiplier = function (type) {
        switch (this.type.count()) {
            case 0: return 1;
            case 1: return this.type.contains(type) ? 1 : 2;
            case 2: return this.type.contains(type) ? 2 : 4;
            case 3: return this.type.contains(type) ? 4 : 8;
            default: return -1;
        }
    };
    Turret.prototype.addType = function (type) {
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
    };
    Turret.init = function () {
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
    };
    return Turret;
}());
var AirTurret = (function (_super) {
    __extends(AirTurret, _super);
    function AirTurret(tile, type) {
        var _this = _super.call(this, tile, type) || this;
        _this.angle = 0;
        return _this;
    }
    AirTurret.prototype.step = function (time) {
        _super.prototype.step.call(this, time);
        this.angle = (this.angle + Angle.deg360 - time * Angle.deg120) % Angle.deg360;
    };
    AirTurret.prototype.render = function (ctx, preRender) {
        _super.prototype.render.call(this, ctx, preRender);
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
    };
    AirTurret.prototype.addType = function (type) {
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
    };
    AirTurret.init = function () {
        var c = new PreRenderedImage(64, 64);
        var renderable = new RenderablePathSet();
        var path = new Path2D();
        path.ellipse(44, 32, 12, 8, 0, 0, Angle.deg180);
        var grad = c.ctx.createLinearGradient(32, 32, 32, 40);
        renderable.pushNew(path, grad);
        path = new Path2D();
        path.ellipse(20, 32, 12, 8, 0, Angle.deg180, 0);
        grad = c.ctx.createLinearGradient(32, 32, 32, 24);
        renderable.pushNew(path, grad);
        path = new Path2D();
        path.arc(32, 32, 8, 0, Angle.deg360);
        grad = c.ctx.createRadialGradient(32, 32, 8, 32, 32, 4);
        renderable.pushNew(path, grad);
        for (var _i = 0, _a = renderable.paths; _i < _a.length; _i++) {
            var rp = _a[_i];
            rp.path.closePath();
            var gr = rp.fill;
            gr.addColorStop(0, "#B2A5FF");
            gr.addColorStop(1, "#A0A0A0");
        }
        renderable.render(c.ctx);
        AirTurret.image = c.image;
    };
    return AirTurret;
}(Turret));
var EarthTurret = (function (_super) {
    __extends(EarthTurret, _super);
    function EarthTurret(tile, type) {
        return _super.call(this, tile, type) || this;
    }
    EarthTurret.prototype.step = function (time) {
        _super.prototype.step.call(this, time);
    };
    EarthTurret.prototype.render = function (ctx, preRender) {
        _super.prototype.render.call(this, ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.drawImage(EarthTurret.images[this.type.earth()], this.tile.pos.x, this.tile.pos.y);
    };
    EarthTurret.prototype.addType = function (type) {
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
    };
    EarthTurret.init = function () {
        EarthTurret.images = [];
        EarthTurret.preRender1();
        EarthTurret.preRender2();
        EarthTurret.preRender3();
        EarthTurret.preRender4();
    };
    EarthTurret.preRender1 = function () {
        var c = new PreRenderedImage(64, 64);
        var renderable = new RenderablePathSet();
        var path;
        var grad;
        var corners = [{ x: 22, y: 22 }, { x: 42, y: 22 }, { x: 22, y: 42 }, { x: 42, y: 42 }];
        for (var _i = 0, corners_1 = corners; _i < corners_1.length; _i++) {
            var corner = corners_1[_i];
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
    };
    EarthTurret.preRender2 = function () {
        var c = new PreRenderedImage(64, 64);
        var renderable = new RenderablePathSet();
        var path;
        var grad;
        var corners = [{ x: 21, y: 21 }, { x: 43, y: 21 }, { x: 21, y: 43 }, { x: 43, y: 43 }];
        for (var _i = 0, corners_2 = corners; _i < corners_2.length; _i++) {
            var corner = corners_2[_i];
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
    };
    EarthTurret.preRender3 = function () {
        var c = new PreRenderedImage(64, 64);
        var renderable = new RenderablePathSet();
        var path;
        var grad;
        var corners = [{ x: 20, y: 20 }, { x: 44, y: 20 }, { x: 20, y: 44 }, { x: 44, y: 44 }];
        for (var _i = 0, corners_3 = corners; _i < corners_3.length; _i++) {
            var corner = corners_3[_i];
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
    };
    EarthTurret.preRender4 = function () {
        var grad;
        var tex1 = new CamouflageTextureGenerator(64, 64, "#825D30", "#308236", 0.5);
        var tex2 = new CamouflageTextureGenerator(64, 64, "#92A33C", "#4ED314", 0.5);
        var src = RgbaColor.transparent.source();
        var corners = [
            { x: 20, y: 20 },
            { x: 44, y: 20 },
            { x: 20, y: 44 },
            { x: 44, y: 44 }
        ];
        for (var _i = 0, corners_4 = corners; _i < corners_4.length; _i++) {
            var corner = corners_4[_i];
            grad = new RadialGradientSource(64, 64, corner.x, corner.y, 12, 6);
            grad.addColorStop(0, "#825D3000");
            grad.addColorStop(0.2, tex1);
            grad.addColorStop(1, tex2);
            src = new EllipseSource(64, 64, corner.x, corner.y, 12, 12, grad, src);
        }
        var path = new Path2D;
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
        src = new PathSource(64, 64, path, tex2, src);
        grad = new RadialGradientSource(64, 64, 32, 32, 10, 4);
        grad.addColorStop(0, tex2);
        grad.addColorStop(1, "#B6FF00");
        EarthTurret.images[4] = new EllipseSource(64, 64, 32, 32, 10.5, 10.5, grad, src).generateImage();
    };
    return EarthTurret;
}(Turret));
var FireTurret = (function (_super) {
    __extends(FireTurret, _super);
    function FireTurret(tile, type) {
        var _this = _super.call(this, tile, type) || this;
        _this.angle = Angle.rand();
        _this.smokeTimer = Utils.randInt(0.5, 4);
        return _this;
    }
    FireTurret.prototype.spawnSmoke = function () {
        var x;
        var y;
        var r = 5 + this.type.fire();
        do {
            x = Math.random() * r * 2 - r;
            y = Math.random() * r * 2 - r;
        } while (x * x + y * y > 100);
        this.smokeTimer = Utils.randInt(0.5, 6 - this.type.fire());
        this.game.particles.add(new SmokeParticle(this.center.x + x, this.center.y + y, 0));
    };
    FireTurret.prototype.step = function (time) {
        _super.prototype.step.call(this, time);
        this.smokeTimer -= time;
        if (this.smokeTimer <= 0) {
            this.spawnSmoke();
        }
    };
    FireTurret.prototype.render = function (ctx, preRender) {
        _super.prototype.render.call(this, ctx, preRender);
        if (preRender) {
            return;
        }
        var r = 20 + 3 * this.type.fire();
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.drawImage(FireTurret.image, -r, -r, r * 2, r * 2);
        ctx.resetTransform();
    };
    FireTurret.prototype.addType = function (type) {
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
    };
    FireTurret.init = function () {
        var c = new PreRenderedImage(64, 64);
        var texLava = new CellularTextureGenerator(64, 64, 36, "#FF5020", "#C00000", CellularTextureType.Balls);
        var texRock = new CellularTextureGenerator(64, 64, 144, "#662D22", "#44150D", CellularTextureType.Balls);
        var renderable = new RenderablePathSet();
        var path = new Path2D();
        for (var k = 0; k < 36; ++k) {
            var radius = 20 + 4 * Math.random();
            var a = k * Angle.deg10;
            if (k === 0) {
                path.moveTo(Utils.ldx(radius, a, 32), Utils.ldy(radius, a, 32));
            }
            else {
                path.lineTo(Utils.ldx(radius, a, 32), Utils.ldy(radius, a, 32));
            }
        }
        path.closePath();
        renderable.pushNew(path, c.ctx.createPattern(texRock.generateImage(), "no-repeat"));
        var grad = c.ctx.createRadialGradient(32, 32, 24, 32, 32, 10);
        grad.addColorStop(0, "#300000");
        grad.addColorStop(1, "#30000000");
        renderable.pushNew(path, grad);
        path = new Path2D();
        for (var k = 0; k < 18; ++k) {
            var radius = 9 + 2 * Math.random();
            var a = k * Angle.deg20;
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
    };
    return FireTurret;
}(Turret));
var WaterTurret = (function (_super) {
    __extends(WaterTurret, _super);
    function WaterTurret(tile, type) {
        var _this = _super.call(this, tile, type) || this;
        _this.angle = Angle.rand();
        return _this;
    }
    WaterTurret.prototype.step = function (time) {
        _super.prototype.step.call(this, time);
    };
    WaterTurret.prototype.render = function (ctx, preRender) {
        _super.prototype.render.call(this, ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.drawImage(WaterTurret.images[this.type.count() - 1], -32, -32);
        ctx.resetTransform();
    };
    WaterTurret.prototype.addType = function (type) {
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
    };
    WaterTurret.init = function () {
        var sandTex = new NoiseTextureGenerator(64, 64, "#F2EBC1", 0.08, 0, 1).generateImage();
        var groundTex = new NoiseTextureGenerator(64, 64, "#B9B5A0", 0.05, 0, 1).generateImage();
        var c0 = new PreRenderedImage(64, 64);
        var c1 = new PreRenderedImage(64, 64);
        var c2 = new PreRenderedImage(64, 64);
        var c3 = WaterTurret.preRender(groundTex, sandTex);
        c0.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex).image, 9, 9, 46, 46);
        c1.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex).image, 6, 6, 52, 52);
        c2.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex).image, 3, 3, 58, 58);
        WaterTurret.images = [c0.image, c1.image, c2.image, c3.image];
    };
    WaterTurret.preRender = function (groundTex, sandTex) {
        var waterTex = new CellularTextureGenerator(64, 64, Utils.randInt(16, 36), "#3584CE", "#3EB4EF", CellularTextureType.Balls).generateImage();
        var textures = [groundTex, sandTex, waterTex];
        var pts = [[], [], []];
        for (var i = 0; i < 8; ++i) {
            var d2 = Utils.rand(16, 20);
            var d1 = Utils.rand(d2 + 2, 24);
            var d0 = Utils.rand(d1, 24);
            var a = i * Angle.deg45;
            pts[0].push({ pt: Utils.ld(d0, a, 32, 32), pt_b: Vec2.zero, pt_a: Vec2.zero });
            pts[1].push({ pt: Utils.ld(d1, a, 32, 32), pt_b: Vec2.zero, pt_a: Vec2.zero });
            pts[2].push({ pt: Utils.ld(d2, a, 32, 32), pt_b: Vec2.zero, pt_a: Vec2.zero });
        }
        for (var j = 0; j < 3; ++j) {
            var layer = pts[j];
            for (var i = 0; i < 8; ++i) {
                var ob = layer[(i + 7) % 8];
                var o = layer[i];
                var oa = layer[(i + 1) % 8];
                var angle = Utils.angleBetween(Utils.getAngle(ob.pt.x, ob.pt.y, o.pt.x, o.pt.y), Utils.getAngle(o.pt.x, o.pt.y, oa.pt.x, oa.pt.y));
                o.pt_a = Utils.ld(5, angle, o.pt.x, o.pt.y);
                o.pt_b = Utils.ld(5, angle + Angle.deg180, o.pt.x, o.pt.y);
            }
        }
        var c = new PreRenderedImage(64, 64);
        var ctx = c.ctx;
        for (var j = 0; j < 3; ++j) {
            var layer = pts[j];
            ctx.beginPath();
            ctx.moveTo(layer[0].pt.x, layer[0].pt.y);
            for (var i = 0; i < 8; ++i) {
                var o0 = layer[i];
                var o1 = layer[(i + 1) % 8];
                ctx.bezierCurveTo(o0.pt_a.x, o0.pt_a.y, o1.pt_b.x, o1.pt_b.y, o1.pt.x, o1.pt.y);
            }
            ctx.fillStyle = ctx.createPattern(textures[j], "repeat");
            ctx.fill();
        }
        return c;
    };
    return WaterTurret;
}(Turret));
var IceTurret = (function (_super) {
    __extends(IceTurret, _super);
    function IceTurret(tile, type) {
        var _this = _super.call(this, tile, type) || this;
        _this.angle = Angle.rand();
        return _this;
    }
    IceTurret.prototype.step = function (time) {
        _super.prototype.step.call(this, time);
    };
    IceTurret.prototype.render = function (ctx, preRender) {
        _super.prototype.render.call(this, ctx, preRender);
        if (preRender) {
            return;
        }
        var r = 24 + 2 * this.type.water() + 2 * this.type.air();
        var i = Utils.sign(this.type.water() - this.type.air()) + 1;
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.drawImage(IceTurret.images[i], -r, -r, r * 2, r * 2);
        ctx.resetTransform();
    };
    IceTurret.prototype.addType = function (type) {
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
    };
    IceTurret.init = function () {
        var tex = new CellularTextureGenerator(64, 64, 64, "#D1EFFF", "#70BECC", CellularTextureType.Lava);
        var c0 = new PreRenderedImage(64, 64);
        var c1 = new PreRenderedImage(64, 64);
        var c2 = new PreRenderedImage(64, 64);
        var fill = c1.ctx.createPattern(tex.generateImage(), "no-repeat");
        IceTurret.preRender(c1.ctx, fill, true);
        c0.ctx.drawImage(c1.image, 0, 0);
        IceTurret.preRender(c0.ctx, "#FFFFFF80");
        c2.ctx.drawImage(c1.image, 0, 0);
        IceTurret.preRender(c2.ctx, "#51AFCC80");
        IceTurret.images = [c0.image, c1.image, c2.image];
    };
    IceTurret.mkBranch = function (ctx, x, y, angle, size) {
        if (size >= 2.5) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            var x2 = Utils.ldx(8, angle, x);
            var y2 = Utils.ldy(8, angle, y);
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
            var x2 = Utils.ldx(6, angle, x);
            var y2 = Utils.ldy(6, angle, y);
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
            var x2 = Utils.ldx(4, angle, x);
            var y2 = Utils.ldy(4, angle, y);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    };
    IceTurret.preRender = function (ctx, fill, drawCenter) {
        if (drawCenter === void 0) { drawCenter = false; }
        ctx.save();
        ctx.lineCap = "round";
        ctx.strokeStyle = fill;
        var centerPath = new Path2D();
        for (var k = 0; k < 6; ++k) {
            var a = k * Angle.deg60;
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
            var grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 6);
            grad.addColorStop(0, "#FFFFFF");
            grad.addColorStop(1, "#D1EFFF00");
            ctx.fillStyle = grad;
            ctx.fill(centerPath);
        }
    };
    return IceTurret;
}(Turret));
var AcidTurret = (function (_super) {
    __extends(AcidTurret, _super);
    function AcidTurret(tile, type) {
        var _this = _super.call(this, tile, type) || this;
        _this.frame = 0;
        return _this;
    }
    AcidTurret.prototype.step = function (time) {
        _super.prototype.step.call(this, time);
        this.frame = (this.frame + time * 25) % AcidTurret.frameCount;
    };
    AcidTurret.prototype.render = function (ctx, preRender) {
        _super.prototype.render.call(this, ctx, preRender);
        if (preRender) {
            return;
        }
        var f = AcidTurret.images[Math.floor(this.frame)][this.type.water() + this.type.earth() - 2];
        ctx.drawImage(f, this.center.x - 32, this.center.y - 32);
    };
    AcidTurret.prototype.addType = function (type) {
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
    };
    AcidTurret.init = function () {
        var acidTex = new CellularTextureGenerator(64, 64, 9, "#E0FF00", "#5B7F00", CellularTextureType.Balls).generateImage();
        AcidTurret.images = [];
        AcidTurret.frameCount = 100;
        for (var i = 0; i < AcidTurret.frameCount; ++i) {
            AcidTurret.images.push(AcidTurret.preRenderFrame(acidTex, i));
        }
    };
    AcidTurret.preRenderFrame = function (texture, frame) {
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        var offset = frame / AcidTurret.frameCount * 64;
        var c0 = new PreRenderedImage(64, 64);
        var c1 = new PreRenderedImage(64, 64);
        var c2 = new PreRenderedImage(64, 64);
        var c = [c0, c1, c2];
        var ctx = c0.ctx;
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
        for (var i = 0; i < 3; ++i) {
            var w = 8 + 2 * i;
            var ca = new PreRenderedImage(w, w);
            ctx = ca.ctx;
            ctx.fillStyle = "#D0D0D060";
            ctx.fillRect(0, 0, w, w);
            ctx.fillStyle = "#D0D0D0";
            ctx.fillRect(0, 1, w, w - 2);
            ctx.fillRect(1, 0, w - 2, w);
            var pattern = ctx.createPattern(texture, "repeat");
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
            var grad = ctx.createLinearGradient(25 - i / 2, 25 - i / 2, 38 + i / 2, 38 + i / 2);
            grad.addColorStop(0, "#808080");
            grad.addColorStop(1, "#404040");
            ctx.strokeStyle = grad;
            ctx.lineWidth = 2 + i;
            ctx.stroke();
        }
        return [c0.image, c1.image, c2.image];
    };
    return AcidTurret;
}(Turret));
var CannonTurret = (function (_super) {
    __extends(CannonTurret, _super);
    function CannonTurret(tile, type) {
        var _this = _super.call(this, tile, type) || this;
        _this.angle = Angle.rand();
        return _this;
    }
    CannonTurret.prototype.step = function (time) {
        _super.prototype.step.call(this, time);
        if (this.cooldown <= 0) {
            this.cooldown = 2;
        }
    };
    CannonTurret.prototype.render = function (ctx, preRender) {
        _super.prototype.render.call(this, ctx, preRender);
        if (preRender) {
            return;
        }
        var r = 24 + 2 * this.type.earth() + 2 * this.type.fire();
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.translate(-2 * this.cooldown, 0);
        ctx.drawImage(CannonTurret.image, -r, -r, r * 2, r * 2);
        ctx.resetTransform();
    };
    CannonTurret.prototype.addType = function (type) {
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
    };
    CannonTurret.init = function () {
        var c = new PreRenderedImage(64, 64);
        var ctx = c.ctx;
        var grad = ctx.createLinearGradient(20, 32, 40, 32);
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
    };
    return CannonTurret;
}(Turret));
var ArcherTurret = (function (_super) {
    __extends(ArcherTurret, _super);
    function ArcherTurret(tile, type) {
        return _super.call(this, tile, type) || this;
    }
    ArcherTurret.prototype.step = function (time) {
        _super.prototype.step.call(this, time);
    };
    ArcherTurret.prototype.render = function (ctx, preRender) {
        _super.prototype.render.call(this, ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.drawImage(ArcherTurret.image, this.tile.pos.x, this.tile.pos.y);
    };
    ArcherTurret.prototype.addType = function (type) {
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
    };
    ArcherTurret.init = function () {
        var c = new PreRenderedImage(64, 64);
        ArcherTurret.image = c.image;
    };
    return ArcherTurret;
}(Turret));
var LightningTurret = (function (_super) {
    __extends(LightningTurret, _super);
    function LightningTurret(tile, type) {
        var _this = _super.call(this, tile, type) || this;
        _this.animationTimer = Math.random();
        return _this;
    }
    LightningTurret.prototype.step = function (time) {
        _super.prototype.step.call(this, time);
        this.animationTimer = (this.animationTimer + time * (this.type.air() + this.type.fire() - 1) * 0.5) % 1;
    };
    LightningTurret.prototype.render = function (ctx, preRender) {
        _super.prototype.render.call(this, ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.drawImage(LightningTurret.images[Math.floor(this.animationTimer * 8)], this.tile.pos.x, this.tile.pos.y);
    };
    LightningTurret.prototype.addType = function (type) {
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
    };
    LightningTurret.init = function () {
        var c = [];
        for (var i = 0; i < 8; ++i) {
            c[i] = new PreRenderedImage(64, 64);
        }
        var ctx = c[0].ctx;
        var grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 18);
        grad.addColorStop(0, "#FFFFFF");
        grad.addColorStop(0.33, "#A97FFF");
        grad.addColorStop(1, "#D6BFFF");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(50, 32);
        for (var i = 1; i < 16; ++i) {
            var r = i % 2 == 0 ? 21 : 7;
            var a = i * Angle.deg45 / 2;
            ctx.lineTo(Utils.ldx(r, a, 32), Utils.ldy(r, a, 32));
        }
        ctx.closePath();
        ctx.fill();
        grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 3);
        grad.addColorStop(0, "#F8F2FF");
        grad.addColorStop(1, "#C199FF");
        ctx.fillStyle = grad;
        var j = true;
        for (var i = 0; i < 8; ++i, j = !j) {
            var a = i * Angle.deg45;
            ctx.translate(Utils.ldx(18, a, 32), Utils.ldy(18, a, 32));
            if (j) {
                ctx.rotate(Angle.deg45);
            }
            ctx.fillRect(-3, -3, 6, 6);
            ctx.resetTransform();
        }
        for (var i = 1; i < 8; ++i) {
            c[i].ctx.drawImage(c[0].image, 0, 0);
        }
        for (var i = 0; i < 8; ++i, j = !j) {
            ctx = c[7 - i].ctx;
            grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
            grad.addColorStop(0, "#FFFFFFC0");
            grad.addColorStop(1, "#F8F2FF00");
            ctx.fillStyle = grad;
            var a = i * Angle.deg45;
            ctx.translate(Utils.ldx(18, a, 32), Utils.ldy(18, a, 32));
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Angle.deg360);
            ctx.closePath();
            ctx.fill();
            ctx.resetTransform();
        }
        LightningTurret.images = [];
        for (var i = 0; i < 8; ++i) {
            LightningTurret.images.push(c[i].image);
        }
    };
    return LightningTurret;
}(Turret));
var FlamethrowerTurret = (function (_super) {
    __extends(FlamethrowerTurret, _super);
    function FlamethrowerTurret(tile, type) {
        return _super.call(this, tile, type) || this;
    }
    FlamethrowerTurret.prototype.step = function (time) {
        _super.prototype.step.call(this, time);
    };
    FlamethrowerTurret.prototype.render = function (ctx, preRender) {
        _super.prototype.render.call(this, ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.drawImage(FlamethrowerTurret.image, this.tile.pos.x, this.tile.pos.y);
    };
    FlamethrowerTurret.prototype.addType = function (type) {
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
    };
    FlamethrowerTurret.init = function () {
        var c = new PreRenderedImage(64, 64);
        FlamethrowerTurret.image = c.image;
    };
    return FlamethrowerTurret;
}(Turret));
var SunTurret = (function (_super) {
    __extends(SunTurret, _super);
    function SunTurret(tile, type) {
        var _this = _super.call(this, tile, type) || this;
        _this.frame = 0;
        return _this;
    }
    SunTurret.prototype.step = function (time) {
        _super.prototype.step.call(this, time);
        this.frame = (this.frame + time * 25) % SunTurret.frameCount;
    };
    SunTurret.prototype.render = function (ctx, preRender) {
        _super.prototype.render.call(this, ctx, preRender);
        if (preRender) {
            return;
        }
        var r = 16 + 4 * this.type.count();
        ctx.drawImage(SunTurret.images[Math.floor(this.frame)], this.center.x - r, this.center.y - r, r * 2, r * 2);
    };
    SunTurret.prototype.addType = function (type) {
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
    };
    SunTurret.init = function () {
        SunTurret.images = [];
        SunTurret.frameCount = 90;
        var c = new PreRenderedImage(64, 64);
        var ctx = c.ctx;
        var grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0.00000, "#FFFF40");
        grad.addColorStop(0.09375, "#FFFD3D");
        grad.addColorStop(0.18750, "#FFFA37");
        grad.addColorStop(0.28125, "#FFF42A");
        grad.addColorStop(0.37500, "#FFE000");
        grad.addColorStop(0.40625, "#FFFFC0");
        grad.addColorStop(1.00000, "#FFFFC000");
        ctx.fillStyle = grad;
        ctx.beginPath();
        for (var i = 0; i < 12; ++i) {
            var a0 = i * Angle.deg30;
            var a1 = a0 + Angle.deg10;
            var a2 = a0 + Angle.deg30;
            ctx.arc(32, 32, 32, a0, a1);
            ctx.lineTo(Utils.ldx(12, a1, 32), Utils.ldy(12, a1, 32));
            ctx.arc(32, 32, 12, a1, a2);
            ctx.lineTo(Utils.ldx(32, a2, 32), Utils.ldy(32, a2, 32));
        }
        ctx.fill();
        for (var i = 0; i < SunTurret.frameCount; ++i) {
            SunTurret.images.push(SunTurret.preRenderFrame(c.image, i));
        }
    };
    SunTurret.preRenderFrame = function (texture, frame) {
        var offset = frame / SunTurret.frameCount * Angle.deg30;
        var c = new PreRenderedImage(64, 64);
        var ctx = c.ctx;
        ctx.translate(32, 32);
        ctx.drawImage(texture, -32, -32);
        ctx.rotate(offset);
        ctx.drawImage(texture, -32, -32);
        ctx.resetTransform();
        return c.image;
    };
    return SunTurret;
}(Turret));
var MoonTurret = (function (_super) {
    __extends(MoonTurret, _super);
    function MoonTurret(tile, type) {
        return _super.call(this, tile, type) || this;
    }
    MoonTurret.prototype.step = function (time) {
        _super.prototype.step.call(this, time);
    };
    MoonTurret.prototype.render = function (ctx, preRender) {
        _super.prototype.render.call(this, ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.drawImage(MoonTurret.image, this.tile.pos.x, this.tile.pos.y);
    };
    MoonTurret.prototype.addType = function (type) {
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
    };
    MoonTurret.init = function () {
        var c = new PreRenderedImage(64, 64);
        MoonTurret.image = c.image;
    };
    return MoonTurret;
}(Turret));
var PlasmaTurret = (function (_super) {
    __extends(PlasmaTurret, _super);
    function PlasmaTurret(tile, type) {
        var _this = _super.call(this, tile, type) || this;
        _this.frame = 0;
        return _this;
    }
    PlasmaTurret.prototype.step = function (time) {
        _super.prototype.step.call(this, time);
        this.frame = (this.frame + time * 25) % PlasmaTurret.frameCount;
    };
    PlasmaTurret.prototype.render = function (ctx, preRender) {
        _super.prototype.render.call(this, ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.drawImage(PlasmaTurret.images, Math.floor(this.frame) * 64, (this.type.count() - 3) * 64, 64, 64, this.tile.pos.x, this.tile.pos.y, 64, 64);
    };
    PlasmaTurret.prototype.addType = function (type) {
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
    };
    PlasmaTurret.init = function () {
        PlasmaTurret.frameCount = 100;
        var background = "#889FFF00";
        var color1 = new PerlinNoiseTextureGenerator(64, 64, "#8C8CFF", "#A3C6FF", 0.5);
        var tex1a = new CirclesTextureGenerator(64, 64, "#889FFF40", color1, background, 0.4, 2, 0.7);
        var tex1b = new CirclesTextureGenerator(64, 64, "#889FFF40", color1, background, 0.28, 3, 0.7);
        var color2 = new PerlinNoiseTextureGenerator(64, 64, "#B28CFF80", "#DAC6FF", 0.5);
        var tex2a = new CirclesTextureGenerator(64, 64, color2, background, background, 0.4, 2, 0.1);
        var tex2b = new CirclesTextureGenerator(64, 64, color2, background, background, 0.28, 3, 0.1);
        var c = new PreRenderedImage(64 * PlasmaTurret.frameCount, 128);
        PlasmaTurret.preRender(c.ctx, tex1a, tex2a, 0);
        PlasmaTurret.preRender(c.ctx, tex1b, tex2b, 64);
        c.saveImage("plasma");
        PlasmaTurret.images = c.image;
    };
    PlasmaTurret.preRender = function (ctx, tex1, tex2, y) {
        for (var i = 0; i < PlasmaTurret.frameCount; ++i) {
            var a = i * Angle.deg360 / PlasmaTurret.frameCount, x = i * 64;
            var src = new AddingSource(64, 64, new RotatingSource(64, 64, tex1, a, 32, 32), new RotatingSource(64, 64, tex2, -a, 32, 32));
            ctx.fillStyle = ctx.createPattern(src.generateImage(), "repeat");
            ctx.beginPath();
            ctx.arc(x + 32, y + 32, 30, 0, Angle.deg360);
            ctx.fill();
        }
    };
    return PlasmaTurret;
}(Turret));
var EarthquakeTurret = (function (_super) {
    __extends(EarthquakeTurret, _super);
    function EarthquakeTurret(tile, type) {
        return _super.call(this, tile, type) || this;
    }
    EarthquakeTurret.prototype.step = function (time) {
        _super.prototype.step.call(this, time);
    };
    EarthquakeTurret.prototype.render = function (ctx, preRender) {
        _super.prototype.render.call(this, ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.drawImage(EarthquakeTurret.image, this.tile.pos.x, this.tile.pos.y);
    };
    EarthquakeTurret.prototype.addType = function (type) {
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
    };
    EarthquakeTurret.init = function () {
        var c = new PreRenderedImage(64, 64);
        EarthquakeTurret.image = c.image;
    };
    return EarthquakeTurret;
}(Turret));
var ArcaneTurret = (function (_super) {
    __extends(ArcaneTurret, _super);
    function ArcaneTurret(tile, type) {
        return _super.call(this, tile, type) || this;
    }
    ArcaneTurret.prototype.step = function (time) {
        _super.prototype.step.call(this, time);
    };
    ArcaneTurret.prototype.render = function (ctx, preRender) {
        _super.prototype.render.call(this, ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.drawImage(ArcaneTurret.image, this.tile.pos.x, this.tile.pos.y);
    };
    ArcaneTurret.prototype.addType = function (type) { };
    ArcaneTurret.init = function () {
        var c = new PreRenderedImage(64, 64);
        ArcaneTurret.image = c.image;
    };
    return ArcaneTurret;
}(Turret));
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
var Tile = (function () {
    function Tile(game, x, y, type, ctx) {
        this.game = game;
        this.type = type;
        this.turret = null;
        this.pos = new Vec2(x, y);
        this.decor = new RenderablePathSet();
        if (type === TileType.Path || type === TileType.Spawn || type === TileType.HQ) {
            var path = new Path2D();
            for (var i = 0; i < 4; ++i) {
                for (var j = 0; j < 4; ++j) {
                    if (Math.random() < 0.25) {
                        var _x = x + i * 16 + 4 + Math.random() * 8;
                        var _y = y + j * 16 + 4 + Math.random() * 8;
                        var radius = 2 + 2 * Math.random();
                        for (var k = 0; k < 4; ++k) {
                            var a = -Angle.deg45 + Angle.deg90 * (k + 0.25 + 0.5 * Math.random());
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
                var gradient = ctx.createLinearGradient(x, y + 32, x + 64, y + 32);
                gradient.addColorStop(0, "#CB5E48");
                gradient.addColorStop(1, "#997761");
                this.decor.pushNew(path, gradient);
            }
            else {
                this.decor.pushNew(path, "#997761");
            }
        }
        else if (type === TileType.Empty) {
            var path1 = new Path2D();
            var path2 = new Path2D();
            for (var i = 0; i < 3; ++i) {
                for (var j = 0; j < 3; ++j) {
                    if (Math.random() < 0.25) {
                        var path = Math.random() < 0.5 ? path1 : path2;
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
    Tile.prototype.step = function (time) {
        if (this.type === TileType.Tower && this.turret != null) {
            this.turret.step(time);
        }
    };
    Tile.prototype.render = function (ctx, preRender) {
        if (preRender) {
            switch (this.type) {
                case TileType.Empty:
                    ctx.drawImage(Tile.grassTex, this.pos.x, this.pos.y);
                    break;
                case TileType.Path:
                    ctx.drawImage(Tile.pathTex, this.pos.x, this.pos.y);
                    break;
                case TileType.Spawn:
                    ctx.drawImage(Tile.spawnTex, this.pos.x, this.pos.y);
                    break;
                case TileType.HQ:
                    ctx.drawImage(Tile.pathTex, this.pos.x, this.pos.y);
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
            for (var _i = 0, elems_1 = elems; _i < elems_1.length; _i++) {
                var c = elems_1[_i];
                ctx.fillStyle = c;
                ctx.fillRect(x, y, 4, 4);
                x += 6;
            }
        }
    };
    Tile.init = function () {
        Tile.grassTex = new NoiseTextureGenerator(64, 64, "#5BA346", 0.075, 0, 0.25).generateImage();
        var pathTex = new NoiseTextureGenerator(64, 64, "#B5947E", 0.04, 0, 0.2);
        Tile.pathTex = pathTex.generateImage();
        var grad = new LinearGradientSource(64, 64, 0, 32, 64, 32);
        grad.addColorStop(0, "#E77B65");
        grad.addColorStop(1, pathTex);
        Tile.spawnTex = grad.generateImage();
    };
    Tile.prototype.onClick = function (button, x, y) {
    };
    return Tile;
}());
var Game = (function () {
    function Game(canvas) {
        var _this = this;
        this.onMouseMove = function (e) {
            _this.setMousePosition(e);
            if (_this.selectedTile == null) {
                return;
            }
            var tp = new Vec2(Math.floor(_this.mousePosition.x / 64), Math.floor(_this.mousePosition.y / 64));
            if (!tp.equals(_this.selectedTile)) {
                _this.selectedTile = null;
            }
        };
        this.onMouseDown = function (e) {
            _this.setMousePosition(e);
            var tp = new Vec2(Math.floor(_this.mousePosition.x / 64), Math.floor(_this.mousePosition.y / 64));
            if (tp.x < _this.mapWidth && tp.y < _this.mapHeight) {
                _this.selectedTile = tp;
            }
        };
        this.onMouseUp = function (e) {
            _this.setMousePosition(e);
        };
        this.onKeyDown = function (e) {
            switch (e.key.toUpperCase()) {
                case 'Q':
                    _this.selectedTurretElement = TurretElement.Air;
                    break;
                case 'W':
                    _this.selectedTurretElement = TurretElement.Earth;
                    break;
                case 'E':
                    _this.selectedTurretElement = TurretElement.Fire;
                    break;
                case 'R':
                    _this.selectedTurretElement = TurretElement.Water;
                    break;
            }
        };
        this.onKeyUp = function (e) { };
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.prevTime = new Date().getTime();
        this.time = 0;
        this.mousePosition = Vec2.zero;
        this.performanceMeter = new PerformanceMeter();
        this.particles = new ParticleSystem(this);
        this.selectedTurretElement = null;
        this.selectedTile = null;
        this.mouseButton = null;
        var canvasWidth = canvas.width;
        var mapWidth = Math.floor(canvasWidth / 64) - 3;
        mapWidth = mapWidth % 2 === 0 ? mapWidth - 1 : mapWidth;
        this.mapWidth = mapWidth < 3 ? 3 : mapWidth;
        this.width = (mapWidth + 3) * 64;
        var canvasHeight = canvas.height;
        var mapHeight = Math.floor(canvasHeight / 64);
        mapHeight = mapHeight % 2 === 0 ? mapHeight - 1 : mapHeight;
        this.mapHeight = mapHeight < 3 ? 3 : mapHeight;
        this.height = mapHeight * 64;
        this.guiPanel = new Rect(this.width - 192, 0, 192, this.height - 192);
    }
    Game.prototype.init = function () {
        Tile.init();
        Turret.init();
        this.generateMap();
        this.generateCastle();
        this.preRender();
        this.canvas.addEventListener("contextmenu", function (e) {
            e.preventDefault();
            return false;
        }, false);
        this.canvas.addEventListener("mousemove", this.onMouseMove, false);
        this.canvas.addEventListener("mousedown", this.onMouseDown, false);
        this.canvas.addEventListener("mouseup", this.onMouseUp, false);
        this.canvas.addEventListener("keydown", this.onKeyDown, false);
        this.canvas.addEventListener("keyup", this.onKeyUp, false);
    };
    Game.prototype.generateMap = function () {
        var mapGen = [];
        var map = [];
        var dijkstraMap = [];
        var wallGens = new Vec2Set();
        for (var x = 0; x < this.mapWidth; ++x) {
            var columnDijkstra = [];
            var columnGen = [];
            var column = [];
            for (var y = 0; y < this.mapHeight; ++y) {
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
            var wg = Vec2.zero;
            var i = Math.random() * wallGens.size;
            for (var _i = 0, _a = wallGens.values(); _i < _a.length; _i++) {
                var _wg = _a[_i];
                if (i < 1) {
                    wg = _wg;
                    break;
                }
                else {
                    i -= 1;
                }
            }
            wallGens.remove(wg);
            if (mapGen[wg.x][wg.y] !== TileType.WallGen) {
                continue;
            }
            var x = wg.x;
            var y = wg.y;
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
        var startY = 1 + 2 * Math.floor((this.mapHeight - 1) / 2 * Math.random());
        var endY = this.mapHeight - 2;
        var startNode = new DijkstraNode(1, startY);
        dijkstraMap[1][0] = startNode;
        var queue = [dijkstraMap[1][0]];
        while (queue.length > 0) {
            var dn = queue.shift();
            var x = dn.pos.x;
            var y = dn.pos.y;
            if (x === this.mapWidth - 2 && y === endY) {
                do {
                    mapGen[dn.pos.x][dn.pos.y] = TileType.Path;
                    dn = dn.previous;
                } while (dn != null);
                break;
            }
            if (x > 1 && dijkstraMap[x - 1][y] === null && mapGen[x - 1][y] === TileType.Unknown) {
                var node = new DijkstraNode(x - 1, y, dn);
                dijkstraMap[x - 1][y] = node;
                queue.push(node);
            }
            if (y > 0 && dijkstraMap[x][y - 1] === null && mapGen[x][y - 1] === TileType.Unknown) {
                var node = new DijkstraNode(x, y - 1, dn);
                dijkstraMap[x][y - 1] = node;
                queue.push(node);
            }
            if (x < this.mapWidth - 2 && dijkstraMap[x + 1][y] === null && mapGen[x + 1][y] === TileType.Unknown) {
                var node = new DijkstraNode(x + 1, y, dn);
                dijkstraMap[x + 1][y] = node;
                queue.push(node);
            }
            if (y < this.mapHeight - 1 && dijkstraMap[x][y + 1] === null && mapGen[x][y + 1] === TileType.Unknown) {
                var node = new DijkstraNode(x, y + 1, dn);
                dijkstraMap[x][y + 1] = node;
                queue.push(node);
            }
        }
        mapGen[0][startY] = TileType.Spawn;
        mapGen[this.mapWidth - 1][endY] = TileType.HQ;
        for (var x = 0; x < this.mapWidth; ++x) {
            for (var y = 0; y < this.mapHeight; ++y) {
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
    };
    Game.prototype.generateCastle = function () {
        this.castle = new RenderablePathSet();
        var x = this.guiPanel.x;
        var y = this.height - 192;
        var path = new Path2D();
        path.rect(x + 36, y + 36, 120, 120);
        var tex = new FrostedGlassTextureGenerator(192, 192, "#82614F", "#997663", 0.5);
        this.castle.pushNew(path, this.ctx.createPattern(tex.generateImage(), "repeat"));
        var points = [
            [6, 6, 60, 60], [126, 6, 60, 60], [6, 126, 60, 60], [126, 126, 60, 60],
            [30, 66, 12, 60], [66, 30, 60, 12], [150, 66, 12, 60], [66, 150, 60, 12]
        ];
        path = new Path2D();
        for (var _i = 0, points_2 = points; _i < points_2.length; _i++) {
            var p = points_2[_i];
            path.rect(x + p[0], y + p[1], p[2], p[3]);
        }
        this.castle.pushNew(path, "#505050");
        points = [[18, 18, 36, 36], [138, 18, 36, 36], [18, 138, 36, 36], [138, 138, 36, 36]];
        path = new Path2D();
        for (var _a = 0, points_3 = points; _a < points_3.length; _a++) {
            var p = points_3[_a];
            path.rect(x + p[0], y + p[1], p[2], p[3]);
        }
        this.castle.pushNew(path, "#404040");
        points = [
            [6, 6, 12, 12], [30, 6, 12, 12], [54, 6, 12, 12], [126, 6, 12, 12], [150, 6, 12, 12], [174, 6, 12, 12],
            [6, 30, 12, 12], [54, 30, 12, 12], [78, 30, 12, 12], [102, 30, 12, 12], [126, 30, 12, 12], [174, 30, 12, 12],
            [6, 54, 12, 12], [30, 54, 12, 12], [54, 54, 12, 12], [126, 54, 12, 12], [150, 54, 12, 12], [174, 54, 12, 12],
            [30, 78, 12, 12], [150, 78, 12, 12], [30, 102, 12, 12], [150, 102, 12, 12],
            [6, 126, 12, 12], [30, 126, 12, 12], [54, 126, 12, 12], [126, 126, 12, 12], [150, 126, 12, 12], [174, 126, 12, 12],
            [6, 150, 12, 12], [54, 150, 12, 12], [78, 150, 12, 12], [102, 150, 12, 12], [126, 150, 12, 12], [174, 150, 12, 12],
            [6, 174, 12, 12], [30, 174, 12, 12], [54, 174, 12, 12], [126, 174, 12, 12], [150, 174, 12, 12], [174, 174, 12, 12]
        ];
        path = new Path2D();
        for (var _b = 0, points_4 = points; _b < points_4.length; _b++) {
            var p = points_4[_b];
            path.rect(x + p[0], y + p[1], p[2], p[3]);
        }
        this.castle.pushNew(path, "#606060");
    };
    Game.prototype.run = function () {
        this.step();
        this.render();
    };
    Game.prototype.step = function () {
        var time = new Date().getTime();
        var timeDiff = (time - this.prevTime) / 1000;
        this.performanceMeter.add(1 / timeDiff);
        for (var x = 0; x < this.mapWidth; ++x) {
            for (var y = 0; y < this.mapHeight; ++y) {
                this.map[x][y].step(timeDiff);
            }
        }
        this.particles.step(timeDiff);
        this.prevTime = time;
        this.time += timeDiff;
    };
    Game.prototype.setMousePosition = function (e) {
        var rect = this.canvas.getBoundingClientRect();
        this.mousePosition = new Vec2(Utils.clamp(Math.floor(e.clientX - rect.left), 0, this.width - 1), Utils.clamp(Math.floor(e.clientY - rect.top), 0, this.width - 1));
    };
    Game.prototype.preRender = function () {
        var c = new PreRenderedImage(this.width, this.height);
        c.ctx.fillStyle = "#C0C0C0";
        c.ctx.fillRect(0, 0, this.width, this.height);
        for (var x_1 = 0; x_1 < this.mapWidth; ++x_1) {
            for (var y_1 = 0; y_1 < this.mapHeight; ++y_1) {
                this.map[x_1][y_1].render(c.ctx, true);
            }
        }
        c.ctx.fillStyle = "#B5947E";
        var x = this.guiPanel.x, y = this.height - 192;
        for (var i = 0; i < 9; ++i) {
            c.ctx.drawImage(Tile.pathTex, x + i % 3 * 64, y + Math.floor(i / 3) * 64);
        }
        c.ctx.fillStyle = "#606060";
        c.ctx.fillRect(this.guiPanel.x, this.guiPanel.y, 2, this.guiPanel.h);
        c.ctx.fillRect(this.guiPanel.x, this.guiPanel.y + this.guiPanel.h - 2, this.guiPanel.w, 2);
        this.castle.render(c.ctx);
        this.preRendered = c.image;
    };
    Game.prototype.render = function () {
        this.ctx.drawImage(this.preRendered, 0, 0);
        for (var x = 0; x < this.mapWidth; ++x) {
            for (var y = 0; y < this.mapHeight; ++y) {
                this.map[x][y].render(this.ctx, false);
            }
        }
        this.particles.render(this.ctx, false);
        var fps = this.performanceMeter.getFps();
        this.ctx.fillStyle = "#000000";
        this.ctx.textAlign = "right";
        this.ctx.textBaseline = "top";
        this.ctx.font = "bold 16px serif";
        if (!isNaN(fps)) {
            this.ctx.fillText(Math.floor(fps).toString(), this.guiPanel.x + this.guiPanel.w - 16, this.guiPanel.y + 16);
        }
        this.ctx.fillText(this.mousePosition.x.toString(), this.guiPanel.x + this.guiPanel.w - 16, this.guiPanel.y + 32);
        this.ctx.fillText(this.mousePosition.y.toString(), this.guiPanel.x + this.guiPanel.w - 16, this.guiPanel.y + 48);
    };
    return Game;
}());
window.onload = function () {
    var game = new Game($("#game-canvas").get(0));
    game.init();
    function gameLoop() {
        window.requestAnimationFrame(gameLoop);
        game.run();
    }
    gameLoop();
};
//# sourceMappingURL=game.js.map