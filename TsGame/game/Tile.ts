﻿/// <reference path="game.d.ts"/>

enum TileType {
    Unknown,
    Empty,
    WallGen,
    Tower,
    Path,
    Spawn,
    HQ
}

class Tile {

    private static tiles: CanvasImageSource;

    private decor: RenderablePathSet;

    game: Game;
    pos: Vec2;
    type: TileType;
    turret: Turret | null;

    constructor(game: Game, x: number, y: number, type: TileType, ctx: CanvasRenderingContext2D) {
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

    step(time: number): void {
        if (this.type === TileType.Tower && this.turret != null) {
            this.turret.step(time);
        }
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean): void {
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

    onClick(button: MouseButton, x: number, y: number): void {
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

    static init(): Promise<void> {
        return Utils.getImageFromCache("td_tiles").then(tex => { Tile.tiles = tex; }, () => new Promise<void>(resolve => {
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

    static drawPathGround(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.drawImage(Tile.tiles, 0, 64, 64, 64, x, y, 64, 64);
    }

}
