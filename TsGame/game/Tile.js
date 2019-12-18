/// <reference path='Turret.ts'/>
/// <reference path='TileType.ts'/>
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
//# sourceMappingURL=Tile.js.map