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
//# sourceMappingURL=particles.js.map