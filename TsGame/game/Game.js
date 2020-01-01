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
        this.map = [];
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
                }
                else {
                    this.map[x][y] = new Tile(this, x * 64, y * 64, TileType.Empty, this.ctx);
                }
            }
        }
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
        for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
            var p = points_1[_i];
            path.rect(x + p[0], y + p[1], p[2], p[3]);
        }
        this.castle.pushNew(path, "#505050");
        points = [[18, 18, 36, 36], [138, 18, 36, 36], [18, 138, 36, 36], [138, 138, 36, 36]];
        path = new Path2D();
        for (var _a = 0, points_2 = points; _a < points_2.length; _a++) {
            var p = points_2[_a];
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
        for (var _b = 0, points_3 = points; _b < points_3.length; _b++) {
            var p = points_3[_b];
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
//# sourceMappingURL=Game.js.map