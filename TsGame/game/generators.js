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
//# sourceMappingURL=generators.js.map