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
//# sourceMappingURL=utils.js.map