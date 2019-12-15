/// <reference path='utils.ts'/>
/// <reference path='turrets.ts'/>
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
        if (this.type == TileType.Path || this.type == TileType.Spawn || this.type == TileType.HQ) {
            let path = new Path2D();
            for (let i = 0; i < 4; ++i) {
                for (let j = 0; j < 4; ++j) {
                    if (Math.random() < 0.25) {
                        let _x = x + i * 16 + 4 + Math.random() * 8;
                        let _y = y + j * 16 + 4 + Math.random() * 8;
                        let radius = 2 + 2 * Math.random();
                        for (let k = 0; k < 4; ++k) {
                            let a = -Angles.deg45 + Angles.deg90 * (k + 0.25 + 0.5 * Math.random());
                            if (k == 0) {
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
            if (this.type == TileType.Spawn) {
                let gradient = ctx.createLinearGradient(x, y + 32, x + 64, y + 32);
                gradient.addColorStop(0, "#CB5E48");
                gradient.addColorStop(1, "#997761");
                this._decor.pushNew(path, gradient);
            }
            else {
                this._decor.pushNew(path, "#997761");
            }
        }
        else if (this.type == TileType.Empty) {
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
        else if (this.type == TileType.Tower) {
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
        if (this.type == TileType.Tower && this.turret != null) {
            this.turret.step(time);
        }
    }
    render(ctx, preRender) {
        if (preRender) {
            ctx.fillStyle = this._groundFill;
            ctx.fillRect(this.pos.x, this.pos.y, 64, 64);
            this._decor.render(ctx);
        }
        else if (this.type == TileType.Tower && this.turret != null) {
            this.turret.render(ctx, preRender);
        }
    }
}
class Game {
    constructor(canvas) {
        this._canvas = canvas;
        this._ctx = canvas.getContext("2d");
        this._turrets = [];
        this._prevTime = new Date().getTime();
        this._time = 0;
        this._performanceMeter = new PerformanceMeter();
        let canvasWidth = canvas.width;
        let mapWidth = Math.floor(canvasWidth / 64) - 3;
        mapWidth = mapWidth % 2 == 0 ? mapWidth - 1 : mapWidth;
        this._mapWidth = mapWidth < 3 ? 3 : mapWidth;
        this.width = (mapWidth + 3) * 64;
        let canvasHeight = canvas.height;
        let mapHeight = Math.floor(canvasHeight / 64);
        mapHeight = mapHeight % 2 == 0 ? mapHeight - 1 : mapHeight;
        this._mapHeight = mapHeight < 3 ? 3 : mapHeight;
        this.height = mapHeight * 64;
        this._guiPanel = new Rect(this.width - 192, 0, 192, this.height - 192);
    }
    init() {
        this.generateMap();
        this.generateCastle();
        this.render(true);
    }
    generateMap() {
        let mapGen = [];
        this._map = [];
        let dijkstraMap = [];
        let wallGens = new Set();
        for (let x = 0; x < this._mapWidth; ++x) {
            var columnDijkstra = [];
            var columnGen = [];
            var column = [];
            for (let y = 0; y < this._mapHeight; ++y) {
                if (x == 0 || x == this._mapWidth - 1 || y == 0 || y == this._mapHeight - 1) {
                    columnGen.push(TileType.Empty);
                }
                else if (x % 2 == 0 && y % 2 == 0) {
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
            this._map.push(column);
        }
        while (wallGens.size > 0) {
            let wg;
            let i = Math.random() * wallGens.size;
            for (let _wg of wallGens.values()) {
                if (i < 1) {
                    wg = _wg;
                    break;
                }
                else {
                    i -= 1;
                }
            }
            wallGens.delete(wg);
            if (mapGen[wg.x][wg.y] != TileType.WallGen) {
                continue;
            }
            let x = wg.x;
            let y = wg.y;
            switch (Math.floor(Math.random() * 4)) {
                case 0:
                    for (; x < this._mapWidth && mapGen[x][y] != TileType.Empty; ++x) {
                        mapGen[x][y] = TileType.Empty;
                    }
                    break;
                case 1:
                    for (; y < this._mapHeight && mapGen[x][y] != TileType.Empty; ++y) {
                        mapGen[x][y] = TileType.Empty;
                    }
                    break;
                case 2:
                    for (; x >= 0 && mapGen[x][y] != TileType.Empty; --x) {
                        mapGen[x][y] = TileType.Empty;
                    }
                    break;
                case 3:
                    for (; y >= 0 && mapGen[x][y] != TileType.Empty; --y) {
                        mapGen[x][y] = TileType.Empty;
                    }
                    break;
            }
        }
        let startY = 1 + 2 * Math.floor((this._mapHeight - 1) / 2 * Math.random());
        let endY = this._mapHeight - 2;
        let startNode = new DijkstraNode(1, startY, null);
        dijkstraMap[1][0] = startNode;
        let queue = [dijkstraMap[1][0]];
        while (queue.length > 0) {
            let dn = queue.shift();
            let x = dn.pos.x;
            let y = dn.pos.y;
            if (x == this._mapWidth - 2 && y == endY) {
                do {
                    mapGen[dn.pos.x][dn.pos.y] = TileType.Path;
                    dn = dn.previous;
                } while (dn != null);
                break;
            }
            if (x > 1 && dijkstraMap[x - 1][y] == null && mapGen[x - 1][y] == TileType.Unknown) {
                let node = new DijkstraNode(x - 1, y, dn);
                dijkstraMap[x - 1][y] = node;
                queue.push(node);
            }
            if (y > 0 && dijkstraMap[x][y - 1] == null && mapGen[x][y - 1] == TileType.Unknown) {
                let node = new DijkstraNode(x, y - 1, dn);
                dijkstraMap[x][y - 1] = node;
                queue.push(node);
            }
            if (x < this._mapWidth - 2 && dijkstraMap[x + 1][y] == null && mapGen[x + 1][y] == TileType.Unknown) {
                let node = new DijkstraNode(x + 1, y, dn);
                dijkstraMap[x + 1][y] = node;
                queue.push(node);
            }
            if (y < this._mapHeight - 1 && dijkstraMap[x][y + 1] == null && mapGen[x][y + 1] == TileType.Unknown) {
                let node = new DijkstraNode(x, y + 1, dn);
                dijkstraMap[x][y + 1] = node;
                queue.push(node);
            }
        }
        mapGen[0][startY] = TileType.Spawn;
        mapGen[this._mapWidth - 1][endY] = TileType.HQ;
        for (let x = 0; x < this._mapWidth; ++x) {
            for (let y = 0; y < this._mapHeight; ++y) {
                if (mapGen[x][y] == TileType.Spawn) {
                    this._map[x][y] = new Tile(this, x * 64, y * 64, TileType.Spawn, this._ctx);
                }
                else if (mapGen[x][y] == TileType.HQ) {
                    this._map[x][y] = new Tile(this, x * 64, y * 64, TileType.HQ, this._ctx);
                }
                else if (mapGen[x][y] == TileType.Path) {
                    this._map[x][y] = new Tile(this, x * 64, y * 64, TileType.Path, this._ctx);
                }
                else if ((x > 0 && mapGen[x - 1][y] == TileType.Path) ||
                    (y > 0 && mapGen[x][y - 1] == TileType.Path) ||
                    (x < this._mapWidth - 1 && mapGen[x + 1][y] == TileType.Path) ||
                    (y < this._mapHeight - 1 && mapGen[x][y + 1] == TileType.Path) ||
                    (x > 0 && y > 0 && mapGen[x - 1][y - 1] == TileType.Path) ||
                    (x < this._mapWidth - 1 && y > 0 && mapGen[x + 1][y - 1] == TileType.Path) ||
                    (x > 0 && y < this._mapHeight - 1 && mapGen[x - 1][y + 1] == TileType.Path) ||
                    (x < this._mapWidth - 1 && y < this._mapHeight - 1 && mapGen[x + 1][y + 1] == TileType.Path)) {
                    this._map[x][y] = new Tile(this, x * 64, y * 64, TileType.Tower, this._ctx);
                    let r = Math.random();
                    if (r < 0.25) {
                        this._map[x][y].turret = new AirTurret(this._map[x][y]);
                    }
                    else {
                        this._map[x][y].turret = new EarthTurret(this._map[x][y]);
                    }
                    this._map[x][y].turret.upgraded = Math.random() < 0.5;
                    this._turrets.push(this._map[x][y].turret);
                }
                else {
                    this._map[x][y] = new Tile(this, x * 64, y * 64, TileType.Empty, this._ctx);
                }
            }
        }
    }
    generateCastle() {
        this._castle = new RenderablePathSet();
        let x = this._guiPanel.x;
        let y = this.height - 192;
        let path1 = new Path2D();
        path1.rect(x + 36, y + 36, 120, 120);
        this._castle.pushNew(path1, "#82614F");
        let path2 = new Path2D();
        path2.rect(x + 6, y + 6, 60, 60);
        path2.rect(x + 126, y + 6, 60, 60);
        path2.rect(x + 6, y + 126, 60, 60);
        path2.rect(x + 126, y + 126, 60, 60);
        path2.rect(x + 30, y + 66, 12, 60);
        path2.rect(x + 66, y + 30, 60, 12);
        path2.rect(x + 150, y + 66, 12, 60);
        path2.rect(x + 66, y + 150, 60, 12);
        this._castle.pushNew(path2, "#505050");
        let path3 = new Path2D();
        path3.rect(x + 18, y + 18, 36, 36);
        path3.rect(x + 138, y + 18, 36, 36);
        path3.rect(x + 18, y + 138, 36, 36);
        path3.rect(x + 138, y + 138, 36, 36);
        this._castle.pushNew(path3, "#404040");
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
        this._castle.pushNew(path4, "#606060");
    }
    run() {
        this.step();
        this.render(false);
    }
    step() {
        let time = new Date().getTime();
        let timeDiff = (time - this._prevTime) / 1000;
        this._performanceMeter.add(1 / timeDiff);
        for (let x = 0; x < this._mapWidth; ++x) {
            for (let y = 0; y < this._mapHeight; ++y) {
                this._map[x][y].step(timeDiff);
            }
        }
        this._prevTime = time;
        this._time += timeDiff;
    }
    render(preRender) {
        if (preRender) {
            this._ctx.fillStyle = "#C0C0C0";
            this._ctx.fillRect(0, 0, this.width, this.height);
            for (let x = 0; x < this._mapWidth; ++x) {
                for (let y = 0; y < this._mapHeight; ++y) {
                    this._map[x][y].render(this._ctx, true);
                }
            }
            this._ctx.fillStyle = "#B5947E";
            this._ctx.fillRect(this._guiPanel.x, this.height - 192, 192, 192);
            this._ctx.fillStyle = "#606060";
            this._ctx.fillRect(this._guiPanel.x, this._guiPanel.y, 2, this._guiPanel.h);
            this._ctx.fillRect(this._guiPanel.x, this._guiPanel.y + this._guiPanel.h - 2, this._guiPanel.w, 2);
            this._castle.render(this._ctx);
            this._preRendered = this._ctx.getImageData(0, 0, this.width, this.height);
        }
        else {
            this._ctx.putImageData(this._preRendered, 0, 0);
            for (let x = 0; x < this._mapWidth; ++x) {
                for (let y = 0; y < this._mapHeight; ++y) {
                    this._map[x][y].render(this._ctx, false);
                }
            }
            let fps = this._performanceMeter.getFps();
            if (!isNaN(fps)) {
                this._ctx.fillStyle = "#000000";
                this._ctx.textAlign = "right";
                this._ctx.textBaseline = "top";
                this._ctx.font = "bold 16px serif";
                this._ctx.fillText(Math.floor(fps).toString(), this._guiPanel.x + this._guiPanel.w - 16, this._guiPanel.y + 16);
            }
        }
    }
}
//# sourceMappingURL=game.js.map