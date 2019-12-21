class Angles {
    static init() {
        Angles.deg10 = Math.PI / 18;
        Angles.deg15 = Math.PI / 12;
        Angles.deg20 = Math.PI / 9;
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
class PreRenderedImage {
    constructor(width, height) {
        let canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        this.ctx = canvas.getContext("2d");
        this.image = canvas;
    }
}
class ColorRgb {
    constructor(r, g, b) {
        this.r = Math.min(Math.max(r, 0), 255);
        this.g = Math.min(Math.max(g, 0), 255);
        this.b = Math.min(Math.max(b, 0), 255);
    }
    toCss() {
        const hex = "0123456789abcdef";
        return "#" +
            hex[Math.floor(this.r / 16)] +
            hex[Math.floor(this.r % 16)] +
            hex[Math.floor(this.g / 16)] +
            hex[Math.floor(this.g % 16)] +
            hex[Math.floor(this.b / 16)] +
            hex[Math.floor(this.b % 16)];
    }
    static MultiplyFloat(c, ammount) {
        return new ColorRgb(c.r * ammount, c.g * ammount, c.b * ammount);
    }
    static Multiply(c1, c2) {
        return new ColorRgb(c1.r * c2.r, c1.g * c2.g, c1.b * c2.b);
    }
    static Add(c1, c2) {
        return new ColorRgb(c1.r + c2.r, c1.g + c2.g, c1.b + c2.b);
    }
    static Mix(c1, c2, ammount) {
        if (ammount >= 1) {
            return c2;
        }
        else if (ammount <= 0) {
            return c1;
        }
        else {
            let a2 = 1 - ammount;
            return new ColorRgb(c1.r * a2 + c2.r * ammount, c1.g * a2 + c2.g * ammount, c1.b * a2 + c2.b * ammount);
        }
    }
}
class Coords {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
/// <reference path="PreRenderedImage.ts"/>
/// <reference path="ColorRgb.ts"/>
/// <reference path="Coords.ts"/>
var CellularTextureType;
/// <reference path="PreRenderedImage.ts"/>
/// <reference path="ColorRgb.ts"/>
/// <reference path="Coords.ts"/>
(function (CellularTextureType) {
    CellularTextureType[CellularTextureType["Lava"] = 0] = "Lava";
    CellularTextureType[CellularTextureType["Net"] = 1] = "Net";
    CellularTextureType[CellularTextureType["Balls"] = 2] = "Balls";
})(CellularTextureType || (CellularTextureType = {}));
// based on https://blackpawn.com/texts/cellular/default.html
class CellularTexture {
    // density n => 1 point per n pixels, has to be at least 16
    constructor(width, height, density, color1, color2, type) {
        this.width = width;
        this.height = height;
        this.color1 = color1;
        this.color2 = color2;
        this.type = type;
        this.density = Math.max(16, density);
    }
    wrappedDistance(x, y, b) {
        let dx = Math.abs(x - b.x);
        let dy = Math.abs(y - b.y);
        if (dx > this.width / 2) {
            dx = this.width - dx;
        }
        if (dy > this.height / 2) {
            dy = this.height - dy;
        }
        return Math.sqrt(dx * dx + dy * dy);
    }
    distancesTo2Nearest(x, y, points) {
        let min1 = Infinity;
        let min2 = Infinity;
        for (const p of points) {
            let d = this.wrappedDistance(x, y, p);
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
    flatten(x, y) {
        return this.width * y + x;
    }
    generate() {
        let tex = new PreRenderedImage(this.width, this.height);
        let points = [];
        let pointCount = this.width * this.height / this.density;
        if (pointCount < 2) {
            pointCount = 2;
        }
        for (let i = 0; i < pointCount; ++i) {
            points[i] = new Coords(Math.random() * this.width, Math.random() * this.height);
        }
        let distances = [];
        let min = Infinity;
        let max = 0;
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                let i = this.flatten(x, y);
                let { min1, min2 } = this.distancesTo2Nearest(x, y, points);
                switch (this.type) {
                    case CellularTextureType.Net:
                        distances[i] = min2 - min1;
                        break;
                    case CellularTextureType.Balls:
                        distances[i] = min2 * min1;
                        break;
                    default: // Lava
                        distances[i] = min1 * min1;
                        break;
                }
                min = Math.min(min, distances[i]);
                max = Math.max(max, distances[i]);
            }
        }
        let range = max - min;
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                let i = this.flatten(x, y);
                let coef = (distances[i] - min) / range;
                tex.ctx.fillStyle = ColorRgb.Mix(this.color1, this.color2, coef).toCss();
                tex.ctx.fillRect(x, y, 1, 1);
            }
        }
        return tex.image;
    }
}
/// <reference path='Game.ts'/>
class GameItem {
    constructor(game) {
        this.game = game;
    }
    step(time) { }
    render(ctx, preRender) { }
}
/// <reference path='Angles.ts'/>
class Particle {
    step(time) { }
    render(ctx) { }
    isDead() {
        return true;
    }
}
class SmokeParticle extends Particle {
    constructor(x, y, startSize) {
        super();
        this.x = x;
        this.y = y;
        this.life = 0;
        let lightness = Math.floor(Math.random() * 64 + 112);
        this.rgb = lightness + ',' + lightness + ',' + lightness;
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
        ctx.fillStyle = `rgba(${this.rgb},${1 - this.life})`;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, r, r, 0, 0, Angles.deg360);
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
/// <reference path='Coords.ts'/>
/// <reference path='Tile.ts'/>
/// <reference path='Angles.ts'/>
/// <reference path='PreRenderedImage.ts'/>
/// <reference path='GameItem.ts'/>
/// <reference path='ColorRgb.ts'/>
/// <reference path="CellularTexture.ts"/>
/// <reference path="ParticleSystem.ts"/>
var TurretType;
/// <reference path='Coords.ts'/>
/// <reference path='Tile.ts'/>
/// <reference path='Angles.ts'/>
/// <reference path='PreRenderedImage.ts'/>
/// <reference path='GameItem.ts'/>
/// <reference path='ColorRgb.ts'/>
/// <reference path="CellularTexture.ts"/>
/// <reference path="ParticleSystem.ts"/>
(function (TurretType) {
    TurretType[TurretType["Air"] = 0] = "Air";
    TurretType[TurretType["Earth"] = 1] = "Earth";
    TurretType[TurretType["Fire"] = 2] = "Fire";
    TurretType[TurretType["Water"] = 3] = "Water";
})(TurretType || (TurretType = {}));
class Turret extends GameItem {
    constructor(tile) {
        super(tile.game);
        this.tile = tile;
        this.center = new Coords(tile.pos.x + 32, tile.pos.y + 32);
        this.hp = 100;
    }
    step(time) {
        if (this.cooldown > 0) {
            this.cooldown -= time;
        }
    }
    render(ctx, preRender) { }
    isUpgraded() { return this.upgraded; }
    getType() { return []; }
}
class IceTurret extends Turret {
    constructor(tile) {
        super(tile);
        this.angle = Math.random() * Angles.deg360;
    }
    step(time) {
        super.step(time);
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        if (this.upgraded) {
            ctx.translate(this.center.x, this.center.y);
            ctx.rotate(this.angle);
            ctx.drawImage(IceTurret.image, -32, -32);
            ctx.resetTransform();
            ctx.fillStyle = "#404040";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.font = "bold 10px serif";
            ctx.fillText('*', this.tile.pos.x + 2, this.tile.pos.y + 2);
        }
        else {
            ctx.translate(this.center.x, this.center.y);
            ctx.rotate(this.angle);
            ctx.drawImage(IceTurret.image, -24, -24, 48, 48);
            ctx.resetTransform();
        }
    }
    getType() { return [TurretType.Air, TurretType.Water]; }
    static init() {
        let c = new PreRenderedImage(64, 64);
        let tex = new CellularTexture(64, 64, 64, new ColorRgb(209, 239, 255), new ColorRgb(112, 190, 204), CellularTextureType.Lava);
        let renderable = new RenderablePathSet();
        let fill = c.ctx.createPattern(tex.generate(), "no-repeat");
        let mkBranch = (x, y, angle, size) => {
            if (size >= 2.5) {
                c.ctx.beginPath();
                c.ctx.moveTo(x, y);
                let x2 = x + 8 * Math.cos(angle);
                let y2 = y - 8 * Math.sin(angle);
                c.ctx.lineTo(x2, y2);
                c.ctx.lineWidth = 3;
                c.ctx.stroke();
                mkBranch((x + x2) / 2, (y + y2) / 2, angle - Angles.deg60, 2);
                mkBranch((x + x2) / 2, (y + y2) / 2, angle + Angles.deg60, 2);
                mkBranch(x2, y2, angle, 2);
            }
            else if (size >= 1.5) {
                c.ctx.beginPath();
                c.ctx.moveTo(x, y);
                let x2 = x + 6 * Math.cos(angle);
                let y2 = y - 6 * Math.sin(angle);
                c.ctx.lineTo(x2, y2);
                c.ctx.lineWidth = 2;
                c.ctx.stroke();
                mkBranch((x + x2) / 2, (y + y2) / 2, angle - Angles.deg45, 1);
                mkBranch((x + x2) / 2, (y + y2) / 2, angle + Angles.deg45, 1);
                mkBranch(x2, y2, angle, 1);
            }
            else if (size >= 0.5) {
                c.ctx.beginPath();
                c.ctx.moveTo(x, y);
                let x2 = x + 4 * Math.cos(angle);
                let y2 = y - 4 * Math.sin(angle);
                c.ctx.lineTo(x2, y2);
                c.ctx.lineWidth = 1;
                c.ctx.stroke();
            }
        };
        c.ctx.save();
        c.ctx.strokeStyle = fill;
        c.ctx.lineCap = "round";
        let centerPath = new Path2D();
        for (let k = 0; k < 6; ++k) {
            let a = k * Angles.deg60;
            if (k === 0) {
                centerPath.moveTo(32 + 8 * Math.cos(a), 32 - 8 * Math.sin(a));
            }
            else {
                centerPath.lineTo(32 + 8 * Math.cos(a), 32 - 8 * Math.sin(a));
            }
            mkBranch(32 + 8 * Math.cos(a), 32 - 8 * Math.sin(a), a, 3);
        }
        centerPath.closePath();
        c.ctx.restore();
        renderable.pushNew(centerPath, fill);
        let grad = c.ctx.createRadialGradient(32, 32, 0, 32, 32, 6);
        grad.addColorStop(0, "#ffffffff");
        grad.addColorStop(1, "#d1efff00");
        renderable.pushNew(centerPath, grad);
        renderable.render(c.ctx);
        IceTurret.image = c.image;
    }
}
class FireTurret extends Turret {
    constructor(tile) {
        super(tile);
        this.angle = Math.random() * Angles.deg360;
        this.smokeTimer = Math.random() * 3.5 + 0.5;
    }
    spawnSmoke() {
        let x;
        let y;
        if (this.upgraded) {
            do {
                x = Math.random() * 18 - 9;
                y = Math.random() * 18 - 9;
            } while (x * x + y * y > 100);
            this.smokeTimer = Math.random() * 2.5 + 0.5;
        }
        else {
            do {
                x = Math.random() * 14 - 7;
                y = Math.random() * 14 - 7;
            } while (x * x + y * y > 100);
            this.smokeTimer = Math.random() * 4.5 + 0.5;
        }
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
        if (this.upgraded) {
            ctx.translate(this.center.x, this.center.y);
            ctx.rotate(this.angle);
            ctx.drawImage(FireTurret.image, -32, -32);
            ctx.resetTransform();
            ctx.fillStyle = "#404040";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.font = "bold 10px serif";
            ctx.fillText('*', this.tile.pos.x + 2, this.tile.pos.y + 2);
        }
        else {
            ctx.translate(this.center.x, this.center.y);
            ctx.rotate(this.angle);
            ctx.drawImage(FireTurret.image, -24, -24, 48, 48);
            ctx.resetTransform();
        }
    }
    getType() { return [TurretType.Fire]; }
    static init() {
        let c = new PreRenderedImage(64, 64);
        let texLava = new CellularTexture(64, 64, 36, new ColorRgb(255, 80, 32), new ColorRgb(192, 0, 0), CellularTextureType.Balls);
        let texRock = new CellularTexture(64, 64, 144, new ColorRgb(102, 45, 34), new ColorRgb(102, 45, 34), CellularTextureType.Balls);
        let renderable = new RenderablePathSet();
        let path = new Path2D();
        for (let k = 0; k < 36; ++k) {
            let radius = 20 + 4 * Math.random();
            let a = k * Angles.deg10;
            if (k === 0) {
                path.moveTo(32 + radius * Math.cos(a), 32 - radius * Math.sin(a));
            }
            else {
                path.lineTo(32 + radius * Math.cos(a), 32 - radius * Math.sin(a));
            }
        }
        path.closePath();
        renderable.pushNew(path, c.ctx.createPattern(texRock.generate(), "no-repeat"));
        let grad = c.ctx.createRadialGradient(32, 32, 24, 32, 32, 10);
        grad.addColorStop(0, "#300000ff");
        grad.addColorStop(1, "#30000000");
        renderable.pushNew(path, grad);
        path = new Path2D();
        for (let k = 0; k < 18; ++k) {
            let radius = 9 + 2 * Math.random();
            let a = k * Angles.deg20;
            if (k === 0) {
                path.moveTo(32 + radius * Math.cos(a), 32 - radius * Math.sin(a));
            }
            else {
                path.lineTo(32 + radius * Math.cos(a), 32 - radius * Math.sin(a));
            }
        }
        path.closePath();
        renderable.pushNew(path, c.ctx.createPattern(texLava.generate(), "no-repeat"));
        renderable.render(c.ctx);
        FireTurret.image = c.image;
    }
}
class EarthTurret extends Turret {
    constructor(tile) {
        super(tile);
    }
    step(time) {
        super.step(time);
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        if (this.upgraded) {
            ctx.drawImage(EarthTurret.image2, this.tile.pos.x, this.tile.pos.y);
            ctx.fillStyle = "#404040";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.font = "bold 10px serif";
            ctx.fillText('*', this.tile.pos.x + 2, this.tile.pos.y + 2);
        }
        else {
            ctx.drawImage(EarthTurret.image1, this.tile.pos.x, this.tile.pos.y);
        }
    }
    getType() { return [TurretType.Earth]; }
    static init() {
        EarthTurret.preRender1();
        EarthTurret.preRender2();
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
            path.arc(corner.x, corner.y, 10, 0, Angles.deg360);
            grad = c.ctx.createRadialGradient(corner.x, corner.y, 5, corner.x, corner.y, 10);
            grad.addColorStop(0, "#90D173");
            grad.addColorStop(1, "#6BA370");
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
        renderable.pushNew(path, "#90D173");
        path = new Path2D();
        path.arc(32, 32, 6, 0, Angles.deg360);
        grad = c.ctx.createRadialGradient(32, 32, 2, 32, 32, 6);
        grad.addColorStop(0, "#BEEFA7");
        grad.addColorStop(1, "#90D173");
        renderable.pushNew(path, grad);
        renderable.render(c.ctx);
        EarthTurret.image1 = c.image;
    }
    static preRender2() {
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
            path.arc(corner.x, corner.y, 11, 0, Angles.deg360);
            grad = c.ctx.createRadialGradient(corner.x, corner.y, 5, corner.x, corner.y, 10);
            grad.addColorStop(0, "#4ED314");
            grad.addColorStop(1, "#3DA547");
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
        renderable.pushNew(path, "#4ED314");
        path = new Path2D();
        path.arc(32, 32, 8, 0, Angles.deg360);
        grad = c.ctx.createRadialGradient(32, 32, 3, 32, 32, 8);
        grad.addColorStop(0, "#8EF260");
        grad.addColorStop(1, "#4ED314");
        renderable.pushNew(path, grad);
        renderable.render(c.ctx);
        EarthTurret.image2 = c.image;
    }
}
class AirTurret extends Turret {
    constructor(tile) {
        super(tile);
        this.angle = 0;
    }
    static init() {
        let c = new PreRenderedImage(64, 64);
        let renderable = new RenderablePathSet();
        let path = new Path2D();
        path.ellipse(44, 32, 12, 8, 0, 0, Angles.deg180);
        let grad = c.ctx.createLinearGradient(32, 32, 32, 40);
        renderable.pushNew(path, grad);
        path = new Path2D();
        path.ellipse(20, 32, 12, 8, 0, Angles.deg180, 0);
        grad = c.ctx.createLinearGradient(32, 32, 32, 24);
        renderable.pushNew(path, grad);
        path = new Path2D();
        path.ellipse(32, 44, 8, 12, 0, Angles.deg90, Angles.deg270);
        grad = c.ctx.createLinearGradient(32, 32, 24, 32);
        renderable.pushNew(path, grad);
        path = new Path2D();
        path.ellipse(32, 20, 8, 12, 0, Angles.deg270, Angles.deg90);
        grad = c.ctx.createLinearGradient(32, 32, 40, 32);
        renderable.pushNew(path, grad);
        path = new Path2D();
        path.arc(32, 32, 8, 0, Angles.deg360);
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
    step(time) {
        super.step(time);
        this.angle = (this.angle + Angles.deg360 - time * Angles.deg120) % Angles.deg360;
    }
    render(ctx, preRender) {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.drawImage(AirTurret.image, -32, -32);
        ctx.resetTransform();
        if (this.upgraded) {
            ctx.translate(this.center.x, this.center.y);
            ctx.rotate(this.angle + Angles.deg45);
            ctx.drawImage(AirTurret.image, -32, -32);
            ctx.resetTransform();
            ctx.fillStyle = "#404040";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.font = "bold 10px serif";
            ctx.fillText('*', this.tile.pos.x + 2, this.tile.pos.y + 2);
        }
    }
    getType() { return [TurretType.Air]; }
}
/// <reference path='turrets.ts'/>
/// <reference path='GameItem.ts'/>
var TileType;
/// <reference path='turrets.ts'/>
/// <reference path='GameItem.ts'/>
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
        this._decor = new RenderablePathSet();
        switch (type) {
            case TileType.Empty:
                this._groundFill = "#5BA346";
                break;
            case TileType.Path:
                this._groundFill = "#B5947E";
                break;
            case TileType.Spawn:
                let spawnGradient = ctx.createLinearGradient(x, y + 32, x + 64, y + 32);
                spawnGradient.addColorStop(0, "#E77B65");
                spawnGradient.addColorStop(1, "#B5947E");
                this._groundFill = spawnGradient;
                break;
            case TileType.HQ:
                this._groundFill = "#B5947E";
                break;
            case TileType.Tower:
                this._groundFill = "#808080";
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
                            let a = -Angles.deg45 + Angles.deg90 * (k + 0.25 + 0.5 * Math.random());
                            if (k === 0) {
                                path.moveTo(_x + radius * Math.cos(a), _y - radius * Math.sin(a));
                            }
                            else {
                                path.lineTo(_x + radius * Math.cos(a), _y - radius * Math.sin(a));
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
                this._decor.pushNew(path, gradient);
            }
            else {
                this._decor.pushNew(path, "#997761");
            }
        }
        else if (this.type === TileType.Empty) {
            let path1 = new Path2D();
            let path2 = new Path2D();
            for (let i = 0; i < 3; ++i) {
                for (let j = 0; j < 3; ++j) {
                    if (Math.random() < 0.25) {
                        let path = Math.random() < 0.5 ? path1 : path2;
                        path.arc(x + 6 + 21 * i + Math.random() * 10, y + 6 + 21 * j + Math.random() * 10, 4 + 2 * Math.random(), 0, Angles.deg360);
                        path.closePath();
                    }
                }
            }
            this._decor.pushNew(path1, "#337F1C");
            this._decor.pushNew(path2, "#479131");
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
            this._decor.pushNew(path1, "#A0A0A0");
            let path2 = new Path2D();
            path2.moveTo(x + 62, y + 2);
            path2.lineTo(x + 64, y + 2);
            path2.lineTo(x + 64, y + 64);
            path2.lineTo(x + 2, y + 64);
            path2.lineTo(x + 2, y + 62);
            path2.lineTo(x + 62, y + 62);
            path2.closePath();
            this._decor.pushNew(path2, "#606060");
            let path3 = new Path2D();
            path3.moveTo(x + 56, y + 8);
            path3.lineTo(x + 58, y + 8);
            path3.lineTo(x + 58, y + 58);
            path3.lineTo(x + 8, y + 58);
            path3.lineTo(x + 8, y + 56);
            path3.lineTo(x + 56, y + 56);
            path3.closePath();
            this._decor.pushNew(path3, "#909090");
            let path4 = new Path2D();
            path4.moveTo(x + 6, y + 6);
            path4.lineTo(x + 56, y + 6);
            path4.lineTo(x + 56, y + 8);
            path4.lineTo(x + 8, y + 8);
            path4.lineTo(x + 8, y + 56);
            path4.lineTo(x + 6, y + 56);
            path4.closePath();
            this._decor.pushNew(path4, "#707070");
        }
    }
    step(time) {
        if (this.type === TileType.Tower && this.turret != null) {
            this.turret.step(time);
        }
    }
    render(ctx, preRender) {
        if (preRender) {
            ctx.fillStyle = this._groundFill;
            ctx.fillRect(this.pos.x, this.pos.y, 64, 64);
            this._decor.render(ctx);
        }
        else if (this.type === TileType.Tower && this.turret != null) {
            this.turret.render(ctx, preRender);
        }
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
/// <reference path="RenderablePath.ts"/>
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
/// <reference path="Coords.ts"/>
class DijkstraNode {
    constructor(x, y, previous) {
        this.previous = previous;
        this.distance = previous == null ? 0 : previous.distance + 1;
        this.pos = new Coords(x, y);
    }
}
/// <reference path='Tile.ts'/>
/// <reference path='turrets.ts'/>
/// <reference path='Rect.ts'/>
/// <reference path='GameItem.ts'/>
/// <reference path='RenderablePathSet.ts'/>
/// <reference path='PerformanceMeter.ts'/>
/// <reference path='DijkstraNode.ts'/>
/// <reference path='PreRenderedImage.ts'/>
/// <reference path="ParticleSystem.ts"/>
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.turrets = [];
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
                    let t = null;
                    if (r < 0.2) {
                        t = new EarthTurret(this.map[x][y]);
                    }
                    else if (r < 0.4) {
                        t = new FireTurret(this.map[x][y]);
                    }
                    else if (r < 0.5) {
                        t = new IceTurret(this.map[x][y]);
                    }
                    else if (r < 0.7) {
                        t = new AirTurret(this.map[x][y]);
                    }
                    if (t !== null) {
                        this.map[x][y].turret = t;
                        t.upgraded = Math.random() < 0.5;
                        this.turrets.push(t);
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
        this.castle.pushNew(path1, "#82614F");
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
        c.ctx.fillStyle = "#C0C0C0";
        c.ctx.fillRect(0, 0, this.width, this.height);
        for (let x = 0; x < this.mapWidth; ++x) {
            for (let y = 0; y < this.mapHeight; ++y) {
                this.map[x][y].render(c.ctx, true);
            }
        }
        c.ctx.fillStyle = "#B5947E";
        c.ctx.fillRect(this.guiPanel.x, this.height - 192, 192, 192);
        c.ctx.fillStyle = "#606060";
        c.ctx.fillRect(this.guiPanel.x, this.guiPanel.y, 2, this.guiPanel.h);
        c.ctx.fillRect(this.guiPanel.x, this.guiPanel.y + this.guiPanel.h - 2, this.guiPanel.w, 2);
        this.castle.render(c.ctx);
        this.preRendered = c.image;
    }
    render() {
        this.ctx.drawImage(this.preRendered, 0, 0);
        for (const t of this.turrets) {
            t.render(this.ctx, false);
        }
        this.particles.render(this.ctx, false);
        let fps = this.performanceMeter.getFps();
        if (!isNaN(fps)) {
            this.ctx.fillStyle = "#000000";
            this.ctx.textAlign = "right";
            this.ctx.textBaseline = "top";
            this.ctx.font = "bold 16px serif";
            this.ctx.fillText(Math.floor(fps).toString(), this.guiPanel.x + this.guiPanel.w - 16, this.guiPanel.y + 16);
        }
    }
}
/// <reference path='Game.ts'/>
let game = null;
function gameLoop() {
    window.requestAnimationFrame(gameLoop);
    game.run();
}
window.onload = () => {
    Angles.init();
    AirTurret.init();
    EarthTurret.init();
    FireTurret.init();
    IceTurret.init();
    game = new Game($("#game-canvas").get(0));
    game.init();
    gameLoop();
};
//# sourceMappingURL=game.js.map