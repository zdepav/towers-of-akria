/// <reference path='Tile.ts'/>
/// <reference path='AirTurret.ts'/>
/// <reference path='EarthTurret.ts'/>
/// <reference path='Rect.ts'/>
/// <reference path='GameItem.ts'/>
/// <reference path='RenderablePathSet.ts'/>
/// <reference path='PerformanceMeter.ts'/>
/// <reference path='DijkstraNode.ts'/>
/// <reference path='PreRenderedImage.ts'/>
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.turrets = [];
        this.prevTime = new Date().getTime();
        this.time = 0;
        this.performanceMeter = new PerformanceMeter();
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
        EarthTurret.init();
        AirTurret.init();
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
                    if (r < 0.25) {
                        this.map[x][y].turret = new EarthTurret(this.map[x][y]);
                    }
                    else {
                        this.map[x][y].turret = new AirTurret(this.map[x][y]);
                    }
                    this.map[x][y].turret.upgraded = Math.random() < 0.5;
                    this.turrets.push(this.map[x][y].turret);
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
        for (let t of this.turrets) {
            t.render(this.ctx, false);
        }
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
//# sourceMappingURL=Game.js.map