var MouseButton;
(function (MouseButton) {
    MouseButton[MouseButton["Left"] = 0] = "Left";
    MouseButton[MouseButton["Middle"] = 1] = "Middle";
    MouseButton[MouseButton["Right"] = 2] = "Right";
    MouseButton[MouseButton["Back"] = 3] = "Back";
    MouseButton[MouseButton["Forward"] = 4] = "Forward";
})(MouseButton || (MouseButton = {}));
class Game {
    constructor(container) {
        this.width = 1152;
        this.height = 704;
        this.mapWidth = 15;
        this.mapHeight = 9;
        let canvas = document.createElement("canvas");
        canvas.id = "game-canvas";
        canvas.width = this.width;
        canvas.height = this.height;
        canvas.style.border = "2px solid #606060";
        canvas.style.outline = "none";
        container.appendChild(canvas);
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.prevTime = new Date().getTime();
        this.time = 0;
        this.mousePosition = Vec2.zero;
        this.performanceMeter = new PerformanceMeter();
        this.projectiles = new ProjectileSet();
        this.particles = new ParticleSystem();
        this.enemies = new EnemySet();
        this.hoveredTilePos = null;
        this.selectedTile = null;
        this.mouseButton = null;
        this.arcaneTowerCount = 0;
        this.wavePlanner = new EnemyWavePlanner(this);
        this.guiPanels = [new GuiPanel(this, 0, 0, this.width, this.height)];
        this.rangeMarkerRotation = 0;
        this.hoveredElement = null;
        this.paused = false;
    }
    get hoveredTile() {
        return this.hoveredTilePos !== null ? this.map[this.hoveredTilePos.x][this.hoveredTilePos.y] : null;
    }
    get towerDamageMultiplier() { return this.arcaneTowerCount * 0.25 + 1; }
    init() {
        return RgbaColor.init()
            .then(() => Angle.init())
            .then(() => Tile.init())
            .then(() => Turret.initAll())
            .then(() => this.generateMap())
            .then(() => this.generateCastle())
            .then(() => new Promise(resolve => {
            let panel1 = new GuiPanel(this, 960, 0, 192, 384);
            this.guiPanels.push(panel1);
            this.guiPanels[0].addItem(panel1);
            let pauseButton = new PauseButton(this, this.width - 24, 8, 16, 16);
            pauseButton.onclick = () => this.paused = !this.paused;
            panel1.addItem(pauseButton);
            let panel2 = new GuiPanel(this, 0, 576, 1152, 704);
            this.guiPanels.push(panel2);
            this.guiPanels[0].addItem(panel2);
            this.upgradeButtons = [];
            for (let e = TurretElement.Air, x = 4; e <= TurretElement.Water; ++e, x += 287) {
                let button = new TurretUpgradeButton(this, x, 582, 283, 118, e);
                this.upgradeButtons.push(button);
                panel2.addItem(button);
            }
            this.canvas.setAttribute("tabindex", "0");
            this.canvas.focus();
            this.canvas.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                return false;
            }, false);
            let g = this;
            this.canvas.addEventListener("mousemove", (e) => g.onMouseMove(e));
            this.canvas.addEventListener("mousedown", (e) => g.onMouseDown(e));
            this.canvas.addEventListener("mouseup", (e) => g.onMouseUp(e));
            this.canvas.addEventListener("keydown", (e) => g.onKeyDown(e));
            this.canvas.addEventListener("keyup", (e) => g.onKeyUp(e));
            this.prevTime = new Date().getTime();
            resolve();
        }))
            .then(() => this.preRender());
    }
    generateMap() {
        return new Promise(resolve => {
            let mapGen = [];
            let map = [];
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
                let wg = Vec2.zero;
                let i = Rand.r(wallGens.size);
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
                switch (Rand.i(4)) {
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
            let startY = 1 + 2 * Math.floor(Rand.r(this.mapHeight - 1) / 2);
            let endY = this.mapHeight - 2;
            let startNode = new DijkstraNode(1, startY);
            dijkstraMap[1][0] = startNode;
            let queue = [dijkstraMap[1][0]];
            let path = null;
            while (queue.length > 0) {
                let dn = queue.shift();
                let x = dn.pos.x;
                let y = dn.pos.y;
                if (x === this.mapWidth - 2 && y === endY) {
                    path = dn;
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
            if (path === null) {
                throw new Error("Map generation not successful!");
            }
            mapGen[0][startY] = TileType.Spawn;
            mapGen[this.mapWidth - 1][endY] = TileType.HQ;
            for (let x = 0; x < this.mapWidth; ++x) {
                for (let y = 0; y < this.mapHeight; ++y) {
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
            this.wavePlanner.spawnTile = map[0][startY];
            this.map = map;
            while (true) {
                if (path.previous !== null) {
                    let a = path.previous.pos, b = path.pos;
                    this.map[a.x][a.y].next = this.map[b.x][b.y];
                    path = path.previous;
                }
                else
                    break;
            }
            this.map[0][startY].next = this.map[1][startY];
            resolve();
        });
    }
    generateCastle() {
        return Utils.getImageFromCache("td_castle").then(tex => { Game.castleImage = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(192, 192);
            let castle = new RenderablePathSet();
            let path = new Path2D();
            path.rect(36, 36, 120, 120);
            let tex = new FrostedGlassTextureGenerator(192, 192, "#82614F", "#997663", 0.5);
            castle.pushNew(path, this.ctx.createPattern(tex.generateImage(), "repeat"));
            let walls = [
                [6, 6, 60, 60], [126, 6, 60, 60], [6, 126, 60, 60], [126, 126, 60, 60],
                [30, 66, 12, 60], [66, 30, 60, 12], [150, 66, 12, 60], [66, 150, 60, 12]
            ];
            path = new Path2D();
            for (let w of walls) {
                path.rect(w[0], w[1], w[2], w[3]);
            }
            castle.pushNew(path, "#505050");
            path = new Path2D();
            path.rect(18, 18, 36, 36);
            path.rect(138, 18, 36, 36);
            path.rect(18, 138, 36, 36);
            path.rect(138, 138, 36, 36);
            castle.pushNew(path, "#404040");
            let pts = [
                6, 6, 30, 6, 54, 6, 126, 6, 150, 6, 174, 6,
                6, 30, 54, 30, 78, 30, 102, 30, 126, 30, 174, 30,
                6, 54, 30, 54, 54, 54, 126, 54, 150, 54, 174, 54,
                30, 78, 150, 78, 30, 102, 150, 102,
                6, 126, 30, 126, 54, 126, 126, 126, 150, 126, 174, 126,
                6, 150, 54, 150, 78, 150, 102, 150, 126, 150, 174, 150,
                6, 174, 30, 174, 54, 174, 126, 174, 150, 174, 174, 174
            ];
            path = new Path2D();
            for (let i = 0; i < pts.length; i += 2) {
                path.rect(pts[i], pts[i + 1], 12, 12);
            }
            castle.pushNew(path, "#606060");
            castle.render(c.ctx);
            c.cacheImage("td_castle");
            Game.castleImage = c.image;
            resolve();
        }));
    }
    start() {
        let g = this;
        function gameLoop() {
            window.requestAnimationFrame(gameLoop);
            g.step();
            g.render();
            return undefined;
        }
        g.init().then(gameLoop);
    }
    step() {
        let time = new Date().getTime();
        let timeDiff = (time - this.prevTime) / 1000;
        this.performanceMeter.add(1 / timeDiff);
        this.guiPanels[0].step(timeDiff);
        if (!this.paused) {
            let arcaneTowerCount = 0;
            for (let x = 0; x < this.mapWidth; ++x) {
                for (let y = 0; y < this.mapHeight; ++y) {
                    let t = this.map[x][y];
                    t.step(timeDiff);
                    if (t.type == TileType.Tower) {
                        if (this.selectedTile == t) {
                            this.markTile(t);
                        }
                        if (t.turret instanceof ArcaneTurret) {
                            ++arcaneTowerCount;
                        }
                    }
                }
            }
            this.arcaneTowerCount = arcaneTowerCount;
            this.wavePlanner.step(timeDiff);
            this.enemies.step(timeDiff);
            this.particles.step(timeDiff);
            this.projectiles.step(timeDiff);
            this.rangeMarkerRotation += timeDiff * Angle.deg60;
        }
        this.prevTime = time;
        this.time += timeDiff;
    }
    markTile(tile) {
        this.spawnParticle(new TileMarkParticle(tile.pos.x + 4, tile.pos.y + 4, new Vec2(1, 0)));
        this.spawnParticle(new TileMarkParticle(tile.pos.x + 4, tile.pos.y + 4, new Vec2(0, 1)));
        this.spawnParticle(new TileMarkParticle(tile.pos.x + 60, tile.pos.y + 4, new Vec2(-1, 0)));
        this.spawnParticle(new TileMarkParticle(tile.pos.x + 60, tile.pos.y + 4, new Vec2(0, 1)));
        this.spawnParticle(new TileMarkParticle(tile.pos.x + 4, tile.pos.y + 60, new Vec2(1, 0)));
        this.spawnParticle(new TileMarkParticle(tile.pos.x + 4, tile.pos.y + 60, new Vec2(0, -1)));
        this.spawnParticle(new TileMarkParticle(tile.pos.x + 60, tile.pos.y + 60, new Vec2(-1, 0)));
        this.spawnParticle(new TileMarkParticle(tile.pos.x + 60, tile.pos.y + 60, new Vec2(0, -1)));
    }
    getMousePosition() { return this.mousePosition.copy(); }
    setMousePosition(e) {
        var rect = this.canvas.getBoundingClientRect();
        this.mousePosition = new Vec2(Utils.clamp(Math.floor(e.clientX - rect.left), 0, this.width - 1), Utils.clamp(Math.floor(e.clientY - rect.top), 0, this.width - 1));
    }
    onMouseMove(e) {
        this.setMousePosition(e);
        this.hoveredElement = null;
        this.guiPanels[0].onMouseMove();
        if (this.hoveredTilePos === null) {
            return;
        }
        let tp = new Vec2(Math.floor(this.mousePosition.x / 64), Math.floor(this.mousePosition.y / 64));
        if (!tp.equals(this.hoveredTilePos)) {
            this.hoveredTilePos = null;
        }
    }
    onMouseDown(e) {
        this.setMousePosition(e);
        this.guiPanels[0].onMouseDown(e.button);
        let tp = new Vec2(Math.floor(this.mousePosition.x / 64), Math.floor(this.mousePosition.y / 64));
        if (tp.x < this.mapWidth && tp.y < this.mapHeight) {
            this.hoveredTilePos = tp;
            this.mouseButton = e.button;
        }
    }
    onMouseUp(e) {
        var _a;
        this.setMousePosition(e);
        this.guiPanels[0].onMouseUp(e.button);
        if (this.hoveredTilePos) {
            this.selectedTile = this.hoveredTile;
            for (const b of this.upgradeButtons) {
                b.targetTile = this.selectedTile;
            }
            (_a = this.selectedTile) === null || _a === void 0 ? void 0 : _a.onClick(this.mouseButton, this.mousePosition.x % 64, this.mousePosition.y % 64);
            this.hoveredTilePos = null;
        }
        this.mouseButton = null;
    }
    onKeyDown(e) {
        switch (e.key.toUpperCase()) {
            case 'C':
                if (e.altKey) {
                    localStorage.clear();
                    alert("Cache cleared.");
                }
                break;
            case 'G':
                gen();
                break;
            case 'P':
                this.paused = !this.paused;
                break;
        }
    }
    onKeyUp(e) { }
    preRender() {
        return new Promise(resolve => {
            let c = new PreRenderedImage(this.width, this.height);
            let ctx = c.ctx;
            ctx.fillStyle = "#C0C0C0";
            ctx.fillRect(0, 0, this.width, this.height);
            for (let x = 0; x < this.mapWidth; ++x) {
                for (let y = 0; y < this.mapHeight; ++y) {
                    this.map[x][y].render(ctx, true);
                }
            }
            ctx.fillStyle = "#B5947E";
            let x = this.guiPanels[1].x, y = this.guiPanels[1].bottom;
            for (let i = 0; i < 9; ++i) {
                Tile.drawPathGround(ctx, x + i % 3 * 64, y + Math.floor(i / 3) * 64);
            }
            ctx.fillStyle = "#606060";
            ctx.fillRect(this.guiPanels[1].x, this.guiPanels[1].y, 2, this.guiPanels[1].h);
            ctx.fillRect(this.guiPanels[1].x, this.guiPanels[1].bottom - 2, this.guiPanels[1].w, 2);
            ctx.fillRect(this.guiPanels[2].x, this.guiPanels[2].y, this.guiPanels[2].w, 2);
            this.preRendered = c.image;
            resolve();
        });
    }
    render() {
        let ctx = this.ctx;
        ctx.drawImage(this.preRendered, 0, 0);
        for (let x = 0; x < this.mapWidth; ++x) {
            for (let y = 0; y < this.mapHeight; ++y) {
                this.map[x][y].render(ctx, false);
            }
        }
        this.guiPanels[0].render(ctx);
        this.enemies.render(ctx);
        ctx.drawImage(Game.castleImage, this.guiPanels[1].x, this.guiPanels[1].bottom);
        this.particles.render(ctx);
        this.projectiles.render(ctx);
        for (let x = 0; x < this.mapWidth; ++x) {
            for (let y = 0; y < this.mapHeight; ++y) {
                this.map[x][y].renderOverlay(ctx);
            }
        }
        if (this.selectedTile && this.selectedTile.turret) {
            let range = this.selectedTile.turret.range;
            let { x, y } = this.selectedTile.pos.addu(32, 32);
            this.renderRangeMarker(ctx, x, y, range, "#00000060");
            if (this.hoveredElement !== null) {
                let info = this.selectedTile.turret.getInfoAfterUpgrade(this.hoveredElement);
                if (info) {
                    this.renderRangeMarker(ctx, x, y, info.range, "#40404040");
                }
            }
        }
        let fps = this.performanceMeter.getFps();
        ctx.fillStyle = "#000000";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.font = "bold 12px monospace";
        if (!isNaN(fps)) {
            ctx.fillText(`FPS:         ${Math.floor(fps)}`, this.guiPanels[1].x + 8, this.guiPanels[1].y + 6);
        }
        ctx.fillText(`Enemies:     ${this.enemies.count}`, this.guiPanels[1].x + 8, this.guiPanels[1].y + 20);
        ctx.fillText(`Particles:   ${this.particles.count}`, this.guiPanels[1].x + 8, this.guiPanels[1].y + 34);
        ctx.fillText(`Projectiles: ${this.projectiles.count}`, this.guiPanels[1].x + 8, this.guiPanels[1].y + 48);
        ctx.fillText(`WAVE:        ${this.wavePlanner.waveNumber}`, this.guiPanels[1].x + 8, this.guiPanels[1].y + 62);
        if (this.paused) {
            ctx.fillStyle = "#20202080";
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.fillStyle = "#E0E0E0";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "bold 24px monospace";
            ctx.fillText("Paused", this.width / 2, this.height / 2);
        }
    }
    renderRangeMarker(ctx, x, y, range, color) {
        let rot = this.rangeMarkerRotation;
        ctx.beginPath();
        ctx.arc(x, y, range, 0, Angle.deg360);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        for (let k = 0; k < 2; ++k) {
            ctx.moveTo(Vec2.ldx(range, rot, x), Vec2.ldy(range, rot, y));
            for (let i = 1; i <= 8; ++i) {
                let a = rot + i * Angle.deg45;
                ctx.lineTo(Vec2.ldx(range, a, x), Vec2.ldy(range, a, y));
            }
            rot += Angle.deg(22.5);
        }
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    spawnEnemy(e) { this.enemies.add(e); }
    spawnParticle(p) { this.particles.add(p); }
    spawnProjectile(p) { this.projectiles.add(p); }
    findEnemy(point, maxDistance) {
        return this.enemies.findAny(point, maxDistance);
    }
    findNearestEnemy(point, maxDistance) {
        return this.enemies.findNearest(point, maxDistance);
    }
    findEnemiesInRange(point, maxDistance) {
        return this.enemies.findInRange(point, maxDistance);
    }
    takeLife() {
    }
    playerCanAffordUpgrade(upgradeCostMultiplier) {
        return upgradeCostMultiplier >= 0;
    }
    buyUpgrade(upgradeCostMultiplier) {
        return upgradeCostMultiplier >= 0;
    }
    hoverElement(type) {
        this.hoveredElement = type;
    }
    static initializeAndRun() {
        let container = document.getElementById("zptd-game-container");
        if (container == null) {
            throw new Error('Html element with id "zptd-game-container" not found');
        }
        else {
            new Game(container).start();
        }
    }
}
Game.saveImages = false;
function gen() {
    let W = 6, H = 5;
    let w = 258, h = 286;
    let c = new PreRenderedImage(w * W, h * H);
    let ctx = c.ctx, i = 0, c1 = "#A01713", c2 = "#FFE2A8", ch = "#CF7C5D";
    ctx.fillStyle = "#404040";
    ctx.fillRect(0, 0, w * W, h * H);
    function label(line1, line2) {
        let x = i % W * w + 1;
        let y = Math.floor(i / W) * h + 257;
        ctx.fillStyle = "#C0C0C0";
        ctx.fillRect(x, y, 256, 28);
        ctx.fillStyle = "#000000";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = "bold 16px serif";
        ctx.fillText(line1, x + 6, y + 14, 248);
        if (line2) {
            ctx.textAlign = "right";
            ctx.fillText(`(${line2})`, x + 250, y + 12, 248);
        }
    }
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Cells, CellularTextureDistanceMetric.Euclidean).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Cellular", "Cells, Euclidean");
    ++i;
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Cells, CellularTextureDistanceMetric.Manhattan).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Cellular", "Cells, Manhattan");
    ++i;
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Balls, CellularTextureDistanceMetric.Euclidean).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Cellular", "Balls, Euclidean");
    ++i;
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Balls, CellularTextureDistanceMetric.Manhattan).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Cellular", "Balls, Manhattan");
    ++i;
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Net, CellularTextureDistanceMetric.Euclidean).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Cellular", "Net, Euclidean");
    ++i;
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Net, CellularTextureDistanceMetric.Manhattan).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Cellular", "Net, Manhattan");
    ++i;
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Cells, CellularTextureDistanceMetric.Chebyshev).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Cellular", "Cells, Chebyshev");
    ++i;
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Cells, CellularTextureDistanceMetric.Minkowski).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Cellular", "Cells, Minkowski");
    ++i;
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Balls, CellularTextureDistanceMetric.Chebyshev).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Cellular", "Balls, Chebyshev");
    ++i;
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Balls, CellularTextureDistanceMetric.Minkowski).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Cellular", "Balls, Minkowski");
    ++i;
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Net, CellularTextureDistanceMetric.Chebyshev).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Cellular", "Net, Chebyshev");
    ++i;
    ctx.drawImage(new CellularTextureGenerator(256, 256, 1024, c1, c2, CellularTextureType.Net, CellularTextureDistanceMetric.Minkowski).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Cellular", "Net, Minkowski");
    ++i;
    ctx.drawImage(new NoiseTextureGenerator(256, 256, ch, 0.5, 0.5, 1).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Noise");
    ++i;
    ctx.drawImage(new PerlinNoiseTextureGenerator(256, 256, c1, c2, 1).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Perlin", "Noise");
    ++i;
    ctx.drawImage(new CloudsTextureGenerator(256, 256, c1, c2, 1).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Perlin", "Clouds");
    ++i;
    ctx.drawImage(new VelvetTextureGenerator(256, 256, c1, c2, 1).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Perlin", "Velvet");
    ++i;
    ctx.drawImage(new GlassTextureGenerator(256, 256, c1, c2, 1, 1).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Perlin", "Glass");
    ++i;
    ctx.drawImage(new FrostedGlassTextureGenerator(256, 256, c1, c2, 1).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Perlin", "Frosted glass");
    ++i;
    ctx.drawImage(new BarkTextureGenerator(256, 256, c1, c2, 1, 0.75).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Perlin", "Bark");
    ++i;
    ctx.drawImage(new CirclesTextureGenerator(256, 256, c1, c2, ch, 1, 4, 1).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Perlin", "Circles");
    ++i;
    ctx.drawImage(new CamouflageTextureGenerator(256, 256, c1, c2, 1).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Perlin", "Camouflage");
    ++i;
    let grads = [
        new RadialGradientSource(256, 256, 128, 128, 0, 128),
        new LinearGradientSource(256, 256, 0, 128, 256, 128)
    ];
    for (const g of grads) {
        g.addColorStop(0.000, "#FF0000");
        g.addColorStop(0.167, "#FFFF00");
        g.addColorStop(0.333, "#00FF00");
        g.addColorStop(0.500, "#00FFFF");
        g.addColorStop(0.667, "#0000FF");
        g.addColorStop(0.833, "#FF00FF");
        g.addColorStop(1.000, "#FF0000");
    }
    ctx.drawImage(grads[0].generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Gradient", "Radial");
    ++i;
    ctx.drawImage(new FisheyeSource(256, 256, grads[1], 0.5, 128, 128, 128).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Gradient", "Linear, Fisheye[+]");
    ++i;
    ctx.drawImage(new FisheyeSource(256, 256, grads[1], -0.5, 128, 128, 128).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Gradient", "Linear, Fisheye[-]");
    ++i;
    ctx.drawImage(new PolarSource(256, 256, new BarkTextureGenerator(512, 256, c1, c2, 0.5, 0.75), 512, 256).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Perlin + Polar", "Bark");
    ++i;
    ctx.drawImage(new AntialiasedSource(256, 256, new ScalingSource(256, 256, new FisheyeSource(256, 256, new CircleSource(256, 256, 128, 128, 127, new PolarSource(256, 256, new RoofTilesSource(256, 256, 12, 3, new NoiseTextureGenerator(256, 256, "#E0D2B3", 0.125, 0, 1), "#706859", RgbaColor.transparent)), RgbaColor.transparent), 0.5, 128, 128, 128), 0.1875, 0, 0)).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("");
    ++i;
    ctx.drawImage(new RoofTilesSource(256, 256, 8, 8, new NoiseTextureGenerator(256, 256, "#E0D2B3", 0.125, 0, 1), "#706859").generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Roof Tiles");
    ++i;
    ctx.drawImage(new CircleSource(256, 256, 128, 128, 127, new PolarSource(256, 256, new RoofTilesSource(256, 256, 16, 6, new NoiseTextureGenerator(256, 256, "#E0D2B3", 0.125, 0, 1), "#706859", RgbaColor.transparent)), RgbaColor.transparent).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Roof Tiles + Polar + Circle");
    ++i;
    ctx.drawImage(new FisheyeSource(256, 256, new CircleSource(256, 256, 128, 128, 127, new PolarSource(256, 256, new RoofTilesSource(256, 256, 16, 6, new NoiseTextureGenerator(256, 256, "#E0D2B3", 0.125, 0, 1), "#706859", RgbaColor.transparent)), RgbaColor.transparent), 0.5, 128, 128, 128).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Roof Tiles + Polar + Circle + Eye[+]");
    ++i;
    ctx.drawImage(new FisheyeSource(256, 256, new CircleSource(256, 256, 128, 128, 127, new PolarSource(256, 256, new RoofTilesSource(256, 256, 16, 8, new NoiseTextureGenerator(256, 256, "#E0D2B3", 0.125, 0, 1), "#706859", RgbaColor.transparent)), RgbaColor.transparent), -0.5, 128, 128, 128).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1);
    label("Roof Tiles + Polar + Circle + Eye[-]");
    c.saveImage("textures");
}
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
class Tile {
    constructor(game, x, y, type, ctx) {
        this.game = game;
        this.type = type;
        this.turret = null;
        this.pos = new Vec2(x, y);
        this.decor = new RenderablePathSet();
        this.next = null;
        if (type === TileType.Path || type === TileType.Spawn || type === TileType.HQ) {
            let path = new Path2D();
            for (let i = 0; i < 4; ++i) {
                for (let j = 0; j < 4; ++j) {
                    if (Rand.chance(0.25)) {
                        let _x = x + i * 16 + 4 + Rand.r(8);
                        let _y = y + j * 16 + 4 + Rand.r(8);
                        let radius = 2 + Rand.r(2);
                        for (let k = 0; k < 4; ++k) {
                            let a = -Angle.deg45 + Angle.deg90 * (k + 0.25 + Rand.r(0.5));
                            if (k === 0) {
                                path.moveTo(Vec2.ldx(radius, a, _x), Vec2.ldy(radius, a, _y));
                            }
                            else {
                                path.lineTo(Vec2.ldx(radius, a, _x), Vec2.ldy(radius, a, _y));
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
                    if (Rand.chance(0.25)) {
                        let path = Rand.chance(0.5) ? path1 : path2;
                        path.arc(x + 6 + 21 * i + Rand.r(10), y + 6 + 21 * j + Rand.r(10), 4 + Rand.r(2), 0, Angle.deg360);
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
    step(time) {
        if (this.type === TileType.Tower && this.turret != null) {
            this.turret.step(time);
        }
    }
    render(ctx, preRender) {
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
                    ctx.drawImage(Tile.tiles, 0, 192, 64, 64, this.pos.x, this.pos.y, 64, 64);
                    break;
            }
            this.decor.render(ctx);
        }
        else if (this.type === TileType.Tower && this.turret != null) {
            this.turret.render(ctx);
        }
    }
    renderOverlay(ctx) {
        if (this.type === TileType.Tower && this.turret != null) {
            let elems = this.turret.getType().toColorArray();
            let x = this.pos.x + 2;
            let y = this.pos.y + 2;
            for (const c of elems) {
                ctx.fillStyle = c;
                ctx.fillRect(x, y, 4, 4);
                x += 6;
            }
        }
    }
    onClick(button, x, y) {
        if (this.type == TileType.Tower && this.turret != null) {
            switch (button) {
                case MouseButton.Right:
                    this.turret = new Turret(this);
                    break;
            }
        }
    }
    static init() {
        return Utils.getImageFromCache("td_tiles").then(tex => { Tile.tiles = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(64, 256);
            let ctx = c.ctx;
            new NoiseTextureGenerator(64, 64, "#5BA346", 0.075, 0, 0.25).generateInto(ctx, 0, 0);
            new NoiseTextureGenerator(64, 128, "#B5947E", 0.04, 0, 0.2).generateInto(ctx, 0, 64);
            let grad = ctx.createLinearGradient(0, 160, 64, 160);
            grad.addColorStop(0, "#E77B65");
            grad.addColorStop(1, "#E77B6500");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 128, 64, 64);
            ctx.fillStyle = "#808080";
            ctx.fillRect(0, 192, 64, 64);
            let rps = new RenderablePathSet();
            rps.pushPolygon([0, 0, 62, 0, 62, 2, 2, 2, 2, 62, 0, 62], "#A0A0A0", 0, 192);
            rps.pushPolygon([62, 2, 64, 2, 64, 64, 2, 64, 2, 62, 62, 62], "#606060", 0, 192);
            rps.pushPolygon([56, 8, 58, 8, 58, 58, 8, 58, 8, 56, 56, 56], "#909090", 0, 192);
            rps.pushPolygon([6, 6, 56, 6, 56, 8, 8, 8, 8, 56, 6, 56], "#707070", 0, 192);
            rps.render(ctx);
            c.cacheImage("td_tiles");
            Tile.tiles = c.image;
            resolve();
        }));
    }
    static drawPathGround(ctx, x, y) {
        ctx.drawImage(Tile.tiles, 0, 64, 64, 64, x, y, 64, 64);
    }
    static drawTowerGround(ctx, x, y) {
        ctx.drawImage(Tile.tiles, 0, 192, 64, 64, x, y, 64, 64);
    }
}
class Expirable {
}
class Enemy extends Expirable {
    constructor(game, spawn, hp, armor) {
        super();
        this.targetTile = spawn.next;
        this.currTilePos = spawn.pos.addu(0, Rand.i(16, 48));
        this.nextTilePos = Enemy.positionInTile(spawn.next);
        this.relDist = this.currTilePos.distanceTo(this.nextTilePos);
        this.relPos = 0;
        this.speedMultiplier = 1;
        this.prevSpeedMultiplier = 1;
        this.pushTimeout = 0;
        this.position = this.currTilePos;
        this.startHp = hp;
        this._hp = this.startHp;
        this.armor = armor;
        this.effects = new EffectSet();
        this.game = game;
        this.baseColor = RgbaColor.fromHex("#303030");
        this.baseHpColor = RgbaColor.fromHex("#C08080");
        this.baseArmorColor = RgbaColor.fromHex("#8080C0");
    }
    get x() { return this.position.x; }
    get y() { return this.position.y; }
    get pos() { return this.position; }
    get hp() { return this._hp; }
    get expired() { return this._hp <= 0; }
    get armorProtection() { return 1 + Math.log10(1 + this.armor * 0.1); }
    step(time) {
        if (this.expired) {
            return;
        }
        this.effects.step(time);
        if (this.speedMultiplier > 0) {
            this.relPos += this.baseSpeed * 1.5 * this.speedMultiplier * time;
            while (this.relPos >= this.relDist) {
                this.relPos -= this.relDist;
                if (this.targetTile === null) {
                    this.game.takeLife();
                    this._hp = -1;
                    return;
                }
                else if (this.targetTile.next === null) {
                    this.currTilePos = this.nextTilePos;
                    this.nextTilePos = this.targetTile.pos.addu(112, Rand.i(16, 48));
                    this.relDist = this.currTilePos.distanceTo(this.nextTilePos);
                    this.targetTile = null;
                }
                else {
                    this.targetTile = this.targetTile.next;
                    this.currTilePos = this.nextTilePos;
                    this.nextTilePos = Enemy.positionInTile(this.targetTile);
                    this.relDist = this.currTilePos.distanceTo(this.nextTilePos);
                }
            }
            this.position = this.currTilePos.lerp(this.nextTilePos, this.relPos / this.relDist);
        }
        this.prevSpeedMultiplier = this.speedMultiplier;
        this.speedMultiplier = 1;
        if (this.pushTimeout > 0) {
            this.pushTimeout -= time;
        }
    }
    dealDamage(ammount) {
        this._hp = Math.max(this._hp - ammount * this.game.towerDamageMultiplier / this.armorProtection, 0);
    }
    corodeArmor(ammount) {
        this.armor = Math.max(this.armor - ammount, 0);
    }
    addEffect(effect) {
        effect.affectedEnemy = this;
        this.effects.add(effect);
    }
    getEffect(selector) {
        return this.effects.find(selector);
    }
    addSpeedMultiplier(mult) {
        this.speedMultiplier *= mult;
    }
    pushBack() {
        if (this.pushTimeout <= 0) {
            this.relPos = Math.max(this.relPos - Rand.r(4, 16), -8);
            this.pushTimeout = 2;
        }
    }
    posAhead(timeAhead) {
        let relPos = this.relPos + this.prevSpeedMultiplier * this.baseSpeed * 1.5 * timeAhead;
        return this.currTilePos.lerp(this.nextTilePos, relPos / this.relDist);
    }
    static positionInTile(tile) {
        return tile.pos.addu(Rand.i(16, 48), Rand.i(16, 48));
    }
}
class BasicEnemy extends Enemy {
    get baseSpeed() { return 48; }
    constructor(game, spawn, hp, armor) {
        super(game, spawn, hp, armor);
    }
    render(ctx) {
        let r;
        if (this.armor > 0) {
            ctx.fillStyle = this.effects.colorize(this.baseArmorColor).toCss();
            r = 7 + Utils.clamp(this.armor / 35, 0, 5);
            ctx.fillRect(this.x - r, this.y - r, r * 2, r * 2);
        }
        ctx.fillStyle = "#000000";
        ctx.fillRect(this.x - 7, this.y - 7, 14, 14);
        if (this._hp < this.startHp) {
            ctx.fillStyle = this.effects.colorize(this.baseColor).toCss();
            ctx.fillRect(this.x - 6, this.y - 6, 12, 12);
        }
        ctx.fillStyle = this.effects.colorize(this.baseHpColor).toCss();
        r = 6 * this._hp / this.startHp;
        ctx.fillRect(this.x - r, this.y - r, r * 2, r * 2);
    }
}
class BigEnemy extends Enemy {
    get baseSpeed() { return 24; }
    constructor(game, spawn, hp, armor) {
        super(game, spawn, hp * 4, armor * 1.5);
    }
    renderCircle(ctx, r) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Angle.deg360);
        ctx.fill();
    }
    render(ctx) {
        if (this.armor > 0) {
            ctx.fillStyle = this.effects.colorize(this.baseArmorColor).toCss();
            this.renderCircle(ctx, 10 + Utils.clamp(this.armor / 30, 0, 6));
        }
        ctx.fillStyle = "#000000";
        this.renderCircle(ctx, 10);
        if (this._hp < this.startHp) {
            ctx.fillStyle = this.effects.colorize(this.baseColor).toCss();
            this.renderCircle(ctx, 8);
        }
        ctx.fillStyle = this.effects.colorize(this.baseHpColor).toCss();
        this.renderCircle(ctx, 8 * this._hp / this.startHp);
    }
}
class ExpirableSet {
    constructor() {
        this.items = [];
    }
    get count() { return this.items.length; }
    add(item) {
        if (this.count === this.items.length) {
            this.items.push(item);
        }
        else {
            this.items[this.items.length] = item;
        }
    }
    step(time) {
        if (this.items.length === 0) {
            return;
        }
        for (let i = 0; i < this.count; ++i) {
            this.items[i].step(time);
        }
        this.clearWhere(item => item.expired);
    }
    clear() {
        if (this.items.length > 0) {
            this.items.splice(0, this.items.length);
        }
    }
    clearWhere(condition) {
        let j = this.count;
        for (let i = 0; i < j;) {
            let item = this.items[i];
            if (condition(item)) {
                --j;
                if (i < j) {
                    this.items[i] = this.items[j];
                }
                this.items.pop();
            }
            else
                ++i;
        }
    }
    find(selector) {
        for (const item of this.items) {
            if (selector(item)) {
                return item;
            }
        }
        return null;
    }
}
class EnemySet extends ExpirableSet {
    render(ctx) {
        for (const e of this.items) {
            e.render(ctx);
        }
    }
    findAny(point, maxDistance) {
        if (this.count == 0) {
            return null;
        }
        let t;
        maxDistance *= maxDistance;
        for (const e of this.items) {
            let dist = point.sqrDistanceTo(e.pos);
            if (dist <= maxDistance) {
                return e;
            }
        }
        return null;
    }
    findNearest(point, maxDistance) {
        if (this.count == 0) {
            return null;
        }
        let closestEnemy = null;
        let lowestDistance = Infinity;
        maxDistance *= maxDistance;
        for (const e of this.items) {
            let dist = point.sqrDistanceTo(e.pos);
            if (dist <= maxDistance && dist < lowestDistance) {
                lowestDistance = dist;
                closestEnemy = e;
            }
        }
        return closestEnemy;
    }
    findInRange(point, maxDistance) {
        if (this.count == 0) {
            return [];
        }
        let enemies = [];
        maxDistance *= maxDistance;
        for (const e of this.items) {
            if (point.sqrDistanceTo(e.pos) <= maxDistance) {
                enemies.push(e);
            }
        }
        return enemies;
    }
}
var EnemyType;
(function (EnemyType) {
    EnemyType[EnemyType["Basic"] = 0] = "Basic";
    EnemyType[EnemyType["Fast"] = 1] = "Fast";
    EnemyType[EnemyType["Regenerating"] = 2] = "Regenerating";
    EnemyType[EnemyType["Shielding"] = 3] = "Shielding";
    EnemyType[EnemyType["Big"] = 4] = "Big";
})(EnemyType || (EnemyType = {}));
class EnemyWavePlanner {
    constructor(game) {
        this.game = game;
        this.spawnTile = null;
        this.timer = 1;
        this.enemyHp = 10;
        this.enemyArmor = 0;
        this.wave = [];
        this.avgWaveSize = 5;
        this._waveNumber = 0;
    }
    get waveNumber() { return this._waveNumber; }
    step(time) {
        if (!this.spawnTile) {
            return;
        }
        this.timer -= time;
        if (this.timer > 0) {
            return;
        }
        if (this.wave.length == 0) {
            let waveSize = Math.floor(this.avgWaveSize) + Rand.i(-2, 3);
            let enemyType = this.chooseEnemyType();
            if (enemyType === EnemyType.Big) {
                waveSize = Math.max(Math.floor(waveSize / 5), 1);
            }
            for (let i = 0; i < waveSize; ++i) {
                this.wave.push(this.createEnemy(enemyType));
            }
            ++this._waveNumber;
            this.enemyArmor = Math.floor(this.enemyHp / 2);
            this.enemyHp = this.enemyHp + Utils.clamp(Math.floor(this.enemyHp / 10), 1, 10);
            this.updateWaveSize();
        }
        this.game.spawnEnemy(this.wave.pop());
        this.timer = this.wave.length > 0 ? 1 : 5;
    }
    updateWaveSize() {
        if (this.avgWaveSize < 10) {
            this.avgWaveSize += 0.25;
        }
        else if (this.avgWaveSize < 20) {
            this.avgWaveSize += 0.2;
        }
    }
    chooseEnemyType() {
        if (this._waveNumber % 8 === 7) {
            return EnemyType.Big;
        }
        if (this._waveNumber < 3) {
            return EnemyType.Basic;
        }
        else if (this._waveNumber < 7) {
            return Rand.chance(0.5) ? EnemyType.Basic : EnemyType.Fast;
        }
        else if (this._waveNumber < 15) {
            return Rand.item([EnemyType.Basic, EnemyType.Fast, EnemyType.Regenerating]);
        }
        else {
            return Rand.item([EnemyType.Basic, EnemyType.Fast, EnemyType.Regenerating, EnemyType.Shielding]);
        }
    }
    createEnemy(type) {
        switch (type) {
            case EnemyType.Fast:
                return new FastEnemy(this.game, this.spawnTile, this.enemyHp, this.enemyArmor);
            case EnemyType.Regenerating:
                return new RegeneratingEnemy(this.game, this.spawnTile, this.enemyHp, this.enemyArmor);
            case EnemyType.Shielding:
                return new ShieldingEnemy(this.game, this.spawnTile, this.enemyHp, this.enemyArmor);
            case EnemyType.Big:
                return new BigEnemy(this.game, this.spawnTile, this.enemyHp, this.enemyArmor);
            default:
                return new BasicEnemy(this.game, this.spawnTile, this.enemyHp, this.enemyArmor);
        }
    }
}
class FastEnemy extends Enemy {
    get baseSpeed() { return 160; }
    constructor(game, spawn, hp, armor) {
        super(game, spawn, hp * 0.35, armor * 0.25);
    }
    renderTriangle(ctx, a, b, c, r) {
        ctx.beginPath();
        ctx.moveTo(this.x + a.x * r, this.y + a.y * r);
        ctx.lineTo(this.x + b.x * r, this.y + b.y * r);
        ctx.lineTo(this.x + c.x * r, this.y + c.y * r);
        ctx.closePath();
        ctx.fill();
    }
    render(ctx) {
        let angle = this.currTilePos.angleTo(this.nextTilePos);
        let va = Vec2.ld(1, angle);
        let vb = Vec2.ld(1, angle + Angle.deg120);
        let vc = Vec2.ld(1, angle - Angle.deg120);
        if (this.armor > 0) {
            ctx.fillStyle = this.effects.colorize(this.baseArmorColor).toCss();
            this.renderTriangle(ctx, va, vb, vc, 8.5 + Utils.clamp(this.armor / 25, 0, 7));
        }
        ctx.fillStyle = "#000000";
        this.renderTriangle(ctx, va, vb, vc, 8.5);
        if (this._hp < this.startHp) {
            ctx.fillStyle = this.effects.colorize(this.baseColor).toCss();
            this.renderTriangle(ctx, va, vb, vc, 7);
        }
        ctx.fillStyle = this.effects.colorize(this.baseHpColor).toCss();
        this.renderTriangle(ctx, va, vb, vc, 7 * this._hp / this.startHp);
    }
}
class RegeneratingEnemy extends Enemy {
    constructor(game, spawn, hp, armor) {
        super(game, spawn, hp * 0.6, 0);
        this.healingSpeed = -0.1;
    }
    get baseSpeed() { return 64; }
    step(time) {
        super.step(time);
        if (this.healingSpeed > 0) {
            this._hp = Math.min(this.startHp, this._hp + this.healingSpeed);
        }
        this.healingSpeed = Math.min(this.healingSpeed + 0.5 * time, 0.5);
    }
    renderHeart(ctx, pts, r) {
        ctx.beginPath();
        ctx.moveTo(this.x + pts[0].x * r, this.y + pts[0].y * r);
        ctx.bezierCurveTo(this.x + pts[1].x * r, this.y + pts[1].y * r, this.x + pts[2].x * r, this.y + pts[2].y * r, this.x + pts[3].x * r, this.y + pts[3].y * r);
        ctx.bezierCurveTo(this.x + pts[4].x * r, this.y + pts[4].y * r, this.x + pts[5].x * r, this.y + pts[5].y * r, this.x + pts[6].x * r, this.y + pts[6].y * r);
        ctx.bezierCurveTo(this.x + pts[7].x * r, this.y + pts[7].y * r, this.x + pts[8].x * r, this.y + pts[8].y * r, this.x + pts[9].x * r, this.y + pts[9].y * r);
        ctx.fill();
    }
    render(ctx) {
        let angle = this.currTilePos.angleTo(this.nextTilePos);
        let va = Vec2.ld(1, angle);
        let vb = Vec2.ld(1, angle + Angle.deg90);
        let p1 = va.mul(-1.5);
        let p2 = va.mul(-0.5);
        let p3 = va.mul(0.5);
        let p4 = va.mul(1.5);
        let points = [
            p1,
            p2, p2.add(vb), p3.add(vb),
            p4.add(vb), p4.sub(vb), p3.sub(vb),
            p2.sub(vb), p2, p1
        ];
        if (this.armor > 0) {
            ctx.fillStyle = this.effects.colorize(this.baseArmorColor).toCss();
            this.renderHeart(ctx, points, 8.5 + Utils.clamp(this.armor / 25, 0, 7));
        }
        ctx.fillStyle = "#000000";
        this.renderHeart(ctx, points, 8.5);
        if (this._hp < this.startHp) {
            ctx.fillStyle = this.effects.colorize(this.baseColor).toCss();
            this.renderHeart(ctx, points, 7);
        }
        ctx.fillStyle = this.effects.colorize(this.baseHpColor).toCss();
        this.renderHeart(ctx, points, 7 * this._hp / this.startHp);
    }
    dealDamage(ammount) {
        super.dealDamage(ammount);
        this.healingSpeed = -0.1;
    }
}
class ShieldingEnemy extends Enemy {
    constructor(game, spawn, hp, armor) {
        super(game, spawn, hp * 0.6, 0);
        this.shieldCooldown = 0;
    }
    get baseSpeed() { return this.shield > 0 ? 48 : 64; }
    step(time) {
        super.step(time);
        if (this.shieldCooldown > 0) {
            this.shieldCooldown -= time;
        }
    }
    renderShield(ctx, pts, r) {
        ctx.beginPath();
        ctx.moveTo(this.x + pts[0].x * r, this.y + pts[0].y * r);
        ctx.bezierCurveTo(this.x + pts[1].x * r, this.y + pts[1].y * r, this.x + pts[2].x * r, this.y + pts[2].y * r, this.x + pts[3].x * r, this.y + pts[3].y * r);
        ctx.bezierCurveTo(this.x + pts[4].x * r, this.y + pts[4].y * r, this.x + pts[5].x * r, this.y + pts[5].y * r, this.x + pts[6].x * r, this.y + pts[6].y * r);
        ctx.bezierCurveTo(this.x + pts[7].x * r, this.y + pts[7].y * r, this.x + pts[8].x * r, this.y + pts[8].y * r, this.x + pts[9].x * r, this.y + pts[9].y * r);
        ctx.fill();
    }
    render(ctx) {
        let angle = this.currTilePos.angleTo(this.nextTilePos);
        let va = Vec2.ld(1, angle);
        let vb = Vec2.ld(1, angle + Angle.deg90);
        let p1 = va.mul(1.5);
        let p2 = va.mul(-1);
        let p3 = va.mul(-1.5);
        let points = [
            p1,
            vb, vb, p3.add(vb),
            p2.add(vb), p2.sub(vb), p3.sub(vb),
            vb.negate(), vb.negate(), p1
        ];
        if (this.armor > 0) {
            ctx.fillStyle = this.effects.colorize(this.baseArmorColor).toCss();
            this.renderShield(ctx, points, 8.5 + Utils.clamp(this.armor / 25, 0, 7));
        }
        ctx.fillStyle = "#000000";
        this.renderShield(ctx, points, 8.5);
        if (this._hp < this.startHp) {
            ctx.fillStyle = this.effects.colorize(this.baseColor).toCss();
            this.renderShield(ctx, points, 7);
        }
        ctx.fillStyle = this.effects.colorize(this.baseHpColor).toCss();
        this.renderShield(ctx, points, 7 * this._hp / this.startHp);
        ctx.fillStyle = "#FFFF0080";
        this.renderShield(ctx, points, 70 * this.shield / this.startHp);
    }
    dealDamage(ammount) {
        if (this.shield > 0) {
            if (ammount < this.shield) {
                this.shield -= ammount;
            }
            else {
                let a = ammount - this.shield;
                super.dealDamage(a);
                this.shield = 0;
            }
        }
        else {
            super.dealDamage(ammount);
            if (this.shieldCooldown <= 0) {
                this.shield = this.startHp * 0.1;
                this.shieldCooldown = 5;
            }
        }
    }
}
class Effect extends Expirable {
    constructor(duration) {
        super();
        this._duration = duration;
        this.affectedEnemy = null;
    }
    get duration() { return this._duration; }
    get expired() { return this._duration <= 0; }
    step(time) {
        if (this._duration > 0) {
            this._duration -= time;
        }
    }
}
class LeveledEffect extends Effect {
    constructor(duration, strength) {
        super(duration);
        this._strength = Utils.clamp(strength, 1, 4);
    }
    get strength() { return this._strength; }
    get expired() { return this.duration <= 0; }
    colorize(color) {
        return this.duration > 0 ? color.lerp(this.effectColor, this._strength / 20 + 0.15) : color;
    }
    doMerge(effect) {
        if (effect._strength > this._strength) {
            if (this._duration < effect._duration) {
                this._duration = this._duration + (effect._duration - this._duration) * this._strength / effect._strength;
            }
            this._strength = effect._strength;
        }
        else if (effect._strength < this._strength) {
            this._duration += effect.duration * (1 + this._strength - effect._strength);
        }
        else {
            this._duration = Math.max(this._duration, effect.duration);
        }
    }
}
class AcidEffect extends LeveledEffect {
    get effectColor() { return RgbaColor.green; }
    constructor(duration, strength) {
        super(duration, Utils.clamp(strength, 1, 4));
    }
    step(time) {
        super.step(time);
        if (this.duration > 0 && this.affectedEnemy !== null) {
            this.affectedEnemy.corodeArmor(time * 20 * this._strength * this._strength);
            this.affectedEnemy.dealDamage(time * 2 * this._strength);
            if (Rand.chance(0.01)) {
                let v = Vec2.randUnit3d().mul(4);
                this.affectedEnemy.game.spawnParticle(new BubbleParticle(this.affectedEnemy.x + v.x, this.affectedEnemy.y + v.y, 0, "#80ff00"));
            }
        }
    }
    incompatibleWith(effect) {
        return effect instanceof AcidEffect;
    }
    merge(effect) {
        if (effect instanceof AcidEffect) {
            super.doMerge(effect);
            return true;
        }
        else {
            return false;
        }
    }
}
class BurningEffect extends Effect {
    constructor(duration) {
        super(duration);
    }
    step(time) {
        super.step(time);
        if (this.duration > 0 && this.affectedEnemy !== null) {
            this.affectedEnemy.dealDamage(5 * time);
            if (Rand.chance(0.01)) {
                let v = Vec2.randUnit3d().mul(4);
                this.affectedEnemy.game.spawnParticle(new SmokeParticle(this.affectedEnemy.x + v.x, this.affectedEnemy.y + v.y, 0));
            }
        }
    }
    colorize(color) {
        return this._duration > 0 ? color.lerp(RgbaColor.red, 0.25) : color;
    }
    incompatibleWith(effect) {
        return effect instanceof BurningEffect
            || effect instanceof WetEffect;
    }
    merge(effect) {
        if (effect instanceof BurningEffect) {
            this._duration = Math.max(this._duration, effect._duration);
            return true;
        }
        else {
            return false;
        }
    }
}
class EffectSet extends ExpirableSet {
    add(effect) {
        if (this.count > 0) {
            let j = this.count;
            for (let i = 0; i < j;) {
                let item = this.items[i];
                if (effect.merge(item) || effect.incompatibleWith(item)) {
                    --j;
                    if (i < j) {
                        this.items[i] = this.items[j];
                    }
                    this.items.pop();
                }
                else
                    ++i;
            }
        }
        super.add(effect);
    }
    colorize(color) {
        for (const e of this.items) {
            color = e.colorize(color);
        }
        return color;
    }
}
class FreezeEffect extends LeveledEffect {
    get effectColor() { return RgbaColor.cyan; }
    constructor(duration, strength) {
        super(duration, Utils.clamp(strength, 1, 3));
    }
    step(time) {
        var _a;
        super.step(time);
        if (this.duration > 0) {
            (_a = this.affectedEnemy) === null || _a === void 0 ? void 0 : _a.addSpeedMultiplier((10 - this._strength * 1.5) / 10);
        }
    }
    incompatibleWith(effect) {
        return effect instanceof FreezeEffect;
    }
    merge(effect) {
        if (effect instanceof FreezeEffect) {
            super.doMerge(effect);
            return true;
        }
        else {
            return false;
        }
    }
}
class StunEffect extends Effect {
    constructor(duration) {
        super(duration);
    }
    step(time) {
        var _a;
        super.step(time);
        if (this.duration > 0) {
            (_a = this.affectedEnemy) === null || _a === void 0 ? void 0 : _a.addSpeedMultiplier(0.1);
        }
    }
    colorize(color) {
        return this.duration > 0 ? color.lerp(RgbaColor.white, 0.5) : color;
    }
    incompatibleWith(effect) {
        return effect instanceof StunEffect;
    }
    merge(effect) {
        if (effect instanceof StunEffect) {
            this._duration = Math.max(this._duration, effect._duration);
            return true;
        }
        else {
            return false;
        }
    }
}
class WetEffect extends LeveledEffect {
    get effectColor() { return RgbaColor.blue; }
    constructor(duration, strength) {
        super(duration, Utils.clamp(strength, 1, 4));
    }
    step(time) {
        super.step(time);
        if (this.duration > 0 && this.affectedEnemy !== null) {
            if (this._strength > 2) {
                this.affectedEnemy.corodeArmor(time * 5 * (this._strength - 2));
            }
            this.affectedEnemy.addSpeedMultiplier(1 - this._strength * 0.15);
            if (Rand.chance(0.01)) {
                let v = Vec2.randUnit3d().mul(4);
                this.affectedEnemy.game.spawnParticle(new BubbleParticle(this.affectedEnemy.x + v.x, this.affectedEnemy.y + v.y, 0, "#0080ff"));
            }
        }
    }
    incompatibleWith(effect) {
        return effect instanceof WetEffect
            || effect instanceof BurningEffect;
    }
    merge(effect) {
        if (effect instanceof WetEffect) {
            this.doMerge(effect);
            return true;
        }
        else {
            return false;
        }
    }
}
class ColorSource {
    constructor(width, height) {
        this.width = Math.max(1, Math.floor(width));
        this.height = Math.max(1, Math.floor(height));
    }
    getColor(x, y) {
        return this._getColor(Utils.wrap(x, 0, this.width), Utils.wrap(y, 0, this.height));
    }
    generateInto(ctx, x, y) {
        for (let _x = 0; _x < this.width; ++_x) {
            for (let _y = 0; _y < this.height; ++_y) {
                ctx.fillStyle = this._getColor(_x, _y).toCss();
                ctx.fillRect(x + _x, y + _y, 1, 1);
            }
        }
    }
    generatePrImage() {
        let tex = new PreRenderedImage(this.width, this.height);
        this.generateInto(tex.ctx, 0, 0);
        return tex;
    }
    generateImage() { return this.generatePrImage().image; }
    static get(color) {
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
    }
}
class AntialiasedSource extends ColorSource {
    constructor(width, height, source) {
        super(width, height);
        this.source = source;
    }
    _getColor(x, y) {
        return this.source.getColor(x, y).lerp(this.source.getColor(x + 0.5, y), 0.5).lerp(this.source.getColor(x, y + 0.5).lerp(this.source.getColor(x + 0.5, y + 0.5), 0.5), 0.5);
    }
}
class BufferedColorSource extends ColorSource {
    constructor(width, height, source, scale = 1) {
        super(width, height);
        this.data = [];
        let inverseScale = 1 / scale;
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                this.data.push(source.getColor(x * inverseScale, y * inverseScale));
            }
        }
    }
    _getColor(x, y) {
        x = Math.floor(x);
        y = Math.floor(y);
        return this.data[Utils.flatten(this.width, x, y)];
    }
    generateInto(ctx, x, y) {
        for (let _y = 0; _y < this.height; ++_y) {
            for (let _x = 0; _x < this.width; ++_x) {
                ctx.fillStyle = this.data[Utils.flatten(this.width, _x, _y)].toCss();
                ctx.fillRect(x + _x, y + _y, 1, 1);
            }
        }
    }
}
class CanvasColorSource extends ColorSource {
    constructor(canvas, buffer = false) {
        super(canvas.width, canvas.height);
        this.ctx = canvas.getContext("2d");
        if (buffer) {
            let data = this.ctx.getImageData(0, 0, this.width, this.height).data;
            this.data = [];
            let c = this.width * this.height * 4;
            for (let i = 0; i < c; i += 4) {
                this.data.push(new RgbaColor(data[i], data[i + 1], data[i + 2], data[i + 3]));
            }
        }
        else {
            this.data = null;
        }
    }
    _getColor(x, y) {
        x = Math.floor(x);
        y = Math.floor(y);
        if (this.data) {
            return this.data[Utils.flatten(this.width, x, y)];
        }
        else {
            var data = this.ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
            return new RgbaColor(data[0], data[1], data[2], data[3]);
        }
    }
    generateInto(ctx, x, y) {
        ctx.drawImage(this.ctx.canvas, 0, 0);
    }
}
class GradientSource extends ColorSource {
    constructor(width, height) {
        super(width, height);
        this.colorStops = [];
    }
    addColorStop(pos, color) {
        this.colorStops.push({ pos: pos, color: ColorSource.get(color) });
        this.colorStops.sort((a, b) => a.pos - b.pos);
    }
    getColorAtPosition(x, y, position) {
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
            let i = 1;
            while (position > this.colorStops[i].pos) {
                ++i;
            }
            return this.colorStops[i - 1].color.getColor(x, y).lerp(this.colorStops[i].color.getColor(x, y), (position - this.colorStops[i - 1].pos) / (this.colorStops[i].pos - this.colorStops[i - 1].pos));
        }
    }
}
class LinearGradientSource extends GradientSource {
    constructor(width, height, x1, y1, x2, y2) {
        super(width, height);
        this.a = x2 - x1;
        this.b = y2 - y1;
        this.c = -this.a * x1 - this.b * y1;
        this.d = Math.sqrt(this.a * this.a + this.b * this.b);
        this.d *= this.d;
    }
    _getColor(x, y) {
        return this.getColorAtPosition(x, y, (this.a * x + this.b * y + this.c) / this.d);
    }
}
class PerlinGradient {
    constructor(width, height) {
        this.width = Math.ceil(width);
        this.height = Math.ceil(height);
        this.data = [];
        let c = this.width * this.height;
        for (let i = 0; i < c; ++i) {
            this.data.push(Vec2.randUnit());
        }
    }
    get(x, y) {
        return this.data[Utils.wrap(x, 0, this.width) +
            Utils.wrap(y, 0, this.height) * this.width];
    }
}
class RadialGradientSource extends GradientSource {
    constructor(width, height, x, y, r1, r2) {
        super(width, height);
        this.x = x;
        this.y = y;
        this.r1 = r1;
        this.dr = r2 - r1;
    }
    _getColor(x, y) {
        let dx = x - this.x, dy = y - this.y;
        return this.getColorAtPosition(x, y, (Math.sqrt(dx * dx + dy * dy) - this.r1) / this.dr);
    }
}
class RgbaColor {
    constructor(r, g, b, a = 255) {
        this.r = Math.floor(Utils.clamp(r, 0, 255));
        this.g = Math.floor(Utils.clamp(g, 0, 255));
        this.b = Math.floor(Utils.clamp(b, 0, 255));
        this.a = Math.floor(Utils.clamp(a, 0, 255));
    }
    static fromHex(color) {
        if (/^#[0-9a-f]{3}[0-9a-f]?$/i.test(color)) {
            let a = color.length > 4 ? parseInt(color[4], 16) * 17 : 255;
            return new RgbaColor(parseInt(color[1], 16) * 17, parseInt(color[2], 16) * 17, parseInt(color[3], 16) * 17, a);
        }
        else if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(color)) {
            let a = color.length > 7 ? parseInt(color.substr(7, 2), 16) : 255;
            return new RgbaColor(parseInt(color.substr(1, 2), 16), parseInt(color.substr(3, 2), 16), parseInt(color.substr(5, 2), 16), a);
        }
        else
            throw new Error("Invalid color format");
    }
    pr() { return this.r * this.a / 255; }
    pg() { return this.g * this.a / 255; }
    pb() { return this.b * this.a / 255; }
    pa() { return this.a * this.a / 255; }
    multiplyFloat(ammount, multiplyAlpha = false) {
        return new RgbaColor(this.r * ammount, this.g * ammount, this.b * ammount, multiplyAlpha ? this.a * ammount : this.a);
    }
    multiply(c) {
        return new RgbaColor(this.r * c.r, this.g * c.g, this.b * c.b, this.a * c.a);
    }
    add(c) {
        return new RgbaColor(this.r + c.pr(), this.g + c.pg(), this.b + c.pb(), this.a + c.pa());
    }
    blend(c) {
        if (this.a === 0) {
            return c.a === 0 ? this : c;
        }
        else if (c.a === 0) {
            return this;
        }
        else {
            let ra = (255 - c.a) / 255;
            return new RgbaColor(this.r * ra + c.pr(), this.g * ra + c.pg(), this.b * ra + c.pb(), this.a + c.a * (255 - this.a) / 255);
        }
    }
    withRed(r) { return new RgbaColor(r, this.g, this.b, this.a); }
    withGreen(g) { return new RgbaColor(this.r, g, this.b, this.a); }
    withBlue(b) { return new RgbaColor(this.r, this.g, b, this.a); }
    withAlpha(a) { return new RgbaColor(this.r, this.g, this.b, a); }
    lerp(c, ammount) {
        if (ammount >= 1) {
            return c;
        }
        else if (ammount <= 0) {
            return this;
        }
        else {
            let a2 = 1 - ammount;
            return new RgbaColor(this.r * a2 + c.r * ammount, this.g * a2 + c.g * ammount, this.b * a2 + c.b * ammount, this.a * a2 + c.a * ammount);
        }
    }
    addNoise(intensity, saturation, coverage) {
        if (Rand.chance(coverage)) {
            intensity *= 255;
            if (saturation <= 0) {
                let n = Rand.r(-intensity, intensity);
                return new RgbaColor(this.r + n, this.g + n, this.b + n, this.a);
            }
            else if (saturation >= 1) {
                return new RgbaColor(this.r + Rand.r(-intensity, intensity), this.g + Rand.r(-intensity, intensity), this.b + Rand.r(-intensity, intensity), this.a);
            }
            else {
                let s2 = 1 - saturation;
                let rn = Rand.r(-intensity, intensity);
                let gn = saturation * Rand.r(-intensity, intensity) + s2 * rn;
                let bn = saturation * Rand.r(-intensity, intensity) + s2 * rn;
                return new RgbaColor(this.r + rn, this.g + gn, this.b + bn, this.a);
            }
        }
        else {
            return this;
        }
    }
    source(width = 1, height = 1) {
        return new RgbaColorSource(this, width, height);
    }
    toCss() {
        return "#"
            + Utils.byteToHex(this.r)
            + Utils.byteToHex(this.g)
            + Utils.byteToHex(this.b)
            + Utils.byteToHex(this.a);
    }
    toString() {
        return `rgba(${this.r},${this.g},${this.b},${this.a / 255})`;
    }
    static init() {
        return new Promise(resolve => {
            RgbaColor.transparent = new RgbaColor(0, 0, 0, 0);
            RgbaColor.black = new RgbaColor(0, 0, 0);
            RgbaColor.red = new RgbaColor(255, 0, 0);
            RgbaColor.green = new RgbaColor(0, 255, 0);
            RgbaColor.blue = new RgbaColor(0, 0, 255);
            RgbaColor.yellow = new RgbaColor(255, 255, 0);
            RgbaColor.cyan = new RgbaColor(0, 255, 255);
            RgbaColor.magenta = new RgbaColor(255, 0, 255);
            RgbaColor.white = new RgbaColor(255, 255, 255);
            RgbaColor.gray = new RgbaColor(128, 128, 128);
            resolve();
        });
    }
}
class RgbaColorSource extends ColorSource {
    constructor(color, width = 1, height = 1) {
        super(width, height);
        this.color = color;
    }
    _getColor(x, y) { return this.color; }
    generateInto(ctx, x, y) {
        ctx.fillStyle = this.color.toCss();
        ctx.fillRect(x, y, this.width, this.height);
    }
}
class CombiningSource extends ColorSource {
    constructor(width, height, color1, color2) {
        super(width, height);
        this.color1 = ColorSource.get((color1 !== null && color1 !== void 0 ? color1 : RgbaColor.black));
        this.color2 = ColorSource.get((color2 !== null && color2 !== void 0 ? color2 : RgbaColor.white));
    }
    _getColor(x, y) {
        return this.combine(this.color1.getColor(x, y), this.color2.getColor(x, y));
    }
}
class AddingSource extends CombiningSource {
    constructor(width, height, color1, color2) {
        super(width, height, color1, color2);
    }
    combine(a, b) { return a.add(b); }
}
class BlendingSource extends CombiningSource {
    constructor(width, height, color1, color2) {
        super(width, height, color1, color2);
    }
    combine(a, b) { return a.blend(b); }
}
class LerpingSource extends CombiningSource {
    constructor(width, height, color1, color2, coeficient) {
        super(width, height, color1, color2);
        this.coeficient = coeficient;
    }
    combine(a, b) { return a.lerp(b, this.coeficient); }
}
class MultiplyingSource extends CombiningSource {
    constructor(width, height, color1, color2) {
        super(width, height, color1, color2);
    }
    combine(a, b) { return a.multiply(b); }
}
class ShapeSource extends ColorSource {
    constructor(width, height, color, background) {
        super(width, height);
        this.color = ColorSource.get((color !== null && color !== void 0 ? color : RgbaColor.white));
        this.background = ColorSource.get((background !== null && background !== void 0 ? background : RgbaColor.black));
    }
}
class CircleSource extends ShapeSource {
    constructor(width, height, x, y, r, color, background) {
        super(width, height, color, background);
        this.x = x;
        this.y = y;
        this.r1 = r;
        this.r2 = r + 1;
    }
    _getColor(x, y) {
        let _x = x - this.x, _y = y - this.y, d = Math.sqrt(_x * _x + _y * _y);
        if (d <= this.r1) {
            return this.color.getColor(x, y);
        }
        else if (d >= this.r2) {
            return this.background.getColor(x, y);
        }
        else {
            return this.color.getColor(x, y).lerp(this.background.getColor(x, y), d - this.r1);
        }
    }
}
class EllipseSource extends ShapeSource {
    constructor(width, height, x, y, r1, r2, color, background) {
        super(width, height, color, background);
        this.x = x;
        this.y = y;
        this.r1 = r1;
        this.r2 = r2;
    }
    _getColor(x, y) {
        let _x = (x - this.x) / this.r1, _y = (y - this.y) / this.r2;
        return _x * _x + _y * _y <= 1 ? this.color.getColor(x, y) : this.background.getColor(x, y);
    }
}
class PathSource extends ShapeSource {
    constructor(width, height, path, color, background, fillRule = "nonzero") {
        super(width, height, color, background);
        this.path = path;
        this.fillRule = fillRule;
        this.ctx = new PreRenderedImage(1, 1).ctx;
    }
    _getColor(x, y) {
        return this.ctx.isPointInPath(this.path, x, y, this.fillRule) ? this.color.getColor(x, y) : this.background.getColor(x, y);
    }
}
class RectangleSource extends ShapeSource {
    constructor(width, height, x, y, w, h, color, background) {
        super(width, height, color, background);
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    _getColor(x, y) {
        let _x = x - this.x, _y = y - this.y;
        return (_x >= 0 && _x < this.w && _y >= 0 && _y < this.h) ? this.color.getColor(x, y) : this.background.getColor(x, y);
    }
}
class RoofTilesSource extends ShapeSource {
    constructor(width, height, horizontalCount, verticalCount, color, background, empty) {
        super(width, height, color, background);
        this.empty = empty ? ColorSource.get(empty) : null;
        this.horizontalCount = horizontalCount;
        this.verticalCount = verticalCount;
    }
    _getColor(x, y) {
        let _x = x / this.width;
        let _y = y / this.height;
        let a = _x * this.horizontalCount * 2 % 2 - 1;
        _y += (1 - Math.sqrt(1 - a * a)) / (this.verticalCount * 2);
        if (_x * this.horizontalCount % 2 > 1) {
            _y += 0.5 / this.verticalCount;
        }
        if (this.empty && _y >= 1) {
            return this.empty.getColor(x, y);
        }
        else {
            return this.background.getColor(x, y).lerp(this.color.getColor(x, y), _y * this.verticalCount % 1);
        }
    }
}
class TextureGenerator extends ColorSource {
    constructor(width, height, color) {
        super(width, height);
        this.color = ColorSource.get((color !== null && color !== void 0 ? color : RgbaColor.black));
    }
}
class PerlinTextureGenerator extends TextureGenerator {
    constructor(width, height, color1, color2, scale = 1, curve) {
        super(width, height, color1);
        this.color2 = ColorSource.get((color2 !== null && color2 !== void 0 ? color2 : RgbaColor.white));
        this.scale = 1 / (scale * 32);
        this.curve = (curve !== null && curve !== void 0 ? curve : Curve.linear);
    }
    dotGridGradient(gradient, ix, iy, x, y) {
        return gradient.get(ix, iy).dotu(x - ix, y - iy);
    }
    perlin(gradient, x, y) {
        let x0 = Math.floor(x);
        let x1 = x0 + 1;
        let y0 = Math.floor(y);
        let y1 = y0 + 1;
        let sx = x - x0;
        let sy = y - y0;
        return Utils.interpolateSmooth(Utils.interpolateSmooth(this.dotGridGradient(gradient, x0, y0, x, y), this.dotGridGradient(gradient, x1, y0, x, y), sx), Utils.interpolateSmooth(this.dotGridGradient(gradient, x0, y1, x, y), this.dotGridGradient(gradient, x1, y1, x, y), sx), sy) * 1.428;
    }
}
class BarkTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, scale = 1, turbulence = 1, curve) {
        super(width, height, color1, color2, scale, curve);
        this.scales = [this.scale, this.scale * 2, this.scale * 4, this.scale * 6];
        this.coeficients = [0.5, 0.25, 0.25];
        this.turbulence = turbulence;
        this.gradients = [];
        for (let i = 0; i < 4; ++i) {
            this.gradients.push(new PerlinGradient(this.width * this.scales[i], this.height * this.scales[i]));
        }
    }
    _getColor(x, y) {
        let v = 0;
        for (let i = 0; i < 3; ++i) {
            v += this.perlin(this.gradients[i], x * this.scales[i], y * this.scales[i]) * this.coeficients[i] * this.turbulence;
        }
        v = Utils.granulate(Math.sin(2 * x * this.scale * Math.PI + 8 * v), 2);
        v += Utils.granulate(this.perlin(this.gradients[3], x * this.scales[3], y * this.scales[3]), 5);
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), this.curve(v / 4 + 0.5));
    }
}
class CamouflageTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, scale = 1, curve) {
        super(width, height, color1, color2, scale, curve);
        this.scales = [this.scale, this.scale * 2, this.scale * 4];
        this.coeficients = [1.5, 0.75, 0.75];
        this.gradients = [];
        for (let i = 0; i < 9; ++i) {
            this.gradients.push(new PerlinGradient(this.width * this.scales[i % 3], this.height * this.scales[i % 3]));
        }
    }
    _getColor(x, y) {
        let _x = x * this.scale, _y = y * this.scale;
        for (let i = 0; i < 3; ++i) {
            _x += this.perlin(this.gradients[i], x * this.scales[i], y * this.scales[i]) * this.coeficients[i];
            _y += this.perlin(this.gradients[i + 3], x * this.scales[i], y * this.scales[i]) * this.coeficients[i];
        }
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), this.curve((Utils.granulate(this.perlin(this.gradients[6], _x, _y), 4) * 0.7 +
            Utils.granulate(this.perlin(this.gradients[7], _x * 2, _y * 2), 5) * 0.2 +
            Utils.granulate(this.perlin(this.gradients[8], _x * 4, _y * 4), 6) * 0.1) / 2 + 0.5));
    }
}
var CellularTextureType;
(function (CellularTextureType) {
    CellularTextureType[CellularTextureType["Cells"] = 0] = "Cells";
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
class CellularTextureGenerator extends TextureGenerator {
    constructor(width, height, density, color1, color2, type = CellularTextureType.Cells, metric = CellularTextureDistanceMetric.Euclidean, curve) {
        super(width, height, color1);
        this.color2 = ColorSource.get((color2 !== null && color2 !== void 0 ? color2 : RgbaColor.white));
        this.type = type;
        let distance;
        switch (metric) {
            case CellularTextureDistanceMetric.Euclidean:
                distance = Metric.euclideanDistance;
                break;
            case CellularTextureDistanceMetric.Manhattan:
                distance = Metric.manhattanDistance;
                break;
            case CellularTextureDistanceMetric.Chebyshev:
                distance = Metric.chebyshevDistance;
                break;
            case CellularTextureDistanceMetric.Minkowski:
                distance = Metric.minkowskiDistance;
                break;
        }
        this.density = Math.max(1, density);
        this.curve = (curve !== null && curve !== void 0 ? curve : Curve.linear);
        let points = [];
        let pointCount = this.width * this.height / this.density;
        if (pointCount < 2) {
            pointCount = 2;
        }
        for (let i = 0; i < pointCount; ++i) {
            points[i] = new Vec2(Rand.r(this.width), Rand.r(this.height));
        }
        this.distances = [];
        this.min = Infinity;
        let max = 0, i, d;
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                let { min1, min2 } = CellularTextureGenerator.distancesTo2Nearest(x, y, this.width, this.height, points, distance);
                switch (this.type) {
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
                this.min = Math.min(this.min, d);
                max = Math.max(max, d);
                this.distances[Utils.flatten(this.width, x, y)] = d;
            }
        }
        this.range = max - this.min;
    }
    static wrappedDistance(x, y, width, height, b, distance) {
        let dx = Math.abs(x - b.x);
        let dy = Math.abs(y - b.y);
        if (dx > width / 2) {
            dx = width - dx;
        }
        if (dy > height / 2) {
            dy = height - dy;
        }
        return distance(dx, dy);
    }
    static distancesTo2Nearest(x, y, width, height, points, distance) {
        let min1 = Infinity;
        let min2 = Infinity;
        for (const p of points) {
            let d = CellularTextureGenerator.wrappedDistance(x, y, width, height, p, distance);
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
    _getColor(x, y) {
        x = Math.round(x);
        y = Math.round(y);
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), this.curve((this.distances[Utils.flatten(this.width, x, y)] - this.min) / this.range));
    }
}
class CirclesTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, background, scale = 1, ringCount = Infinity, turbulence = 1, curve) {
        super(width, height, color1, color2, scale, (curve !== null && curve !== void 0 ? curve : Curve.sin));
        this.ringCount = ringCount;
        this.ringCountL = this.ringCount - 0.25;
        this.turbulence = turbulence / 2;
        this.background = ColorSource.get((background !== null && background !== void 0 ? background : RgbaColor.transparent));
        this.gradients = [];
        this.scale2 = this.scale * 2;
        for (let i = 0; i < 2; ++i) {
            this.gradients.push(new PerlinGradient(this.width * this.scale2, this.height * this.scale2));
        }
        this.cx = this.width * this.scale / 2;
        this.cy = this.height * this.scale / 2;
    }
    _getColor(x, y) {
        let _x = x * this.scale + this.perlin(this.gradients[0], x * this.scale2, y * this.scale2) * this.turbulence - this.cx;
        let _y = y * this.scale + this.perlin(this.gradients[1], x * this.scale2, y * this.scale2) * this.turbulence - this.cy;
        let d = Math.sqrt(_x * _x + _y * _y);
        if (d > this.ringCount) {
            return this.background.getColor(x, y);
        }
        else {
            let c = this.color.getColor(x, y).lerp(this.color2.getColor(x, y), this.curve(1 - Math.abs(1 - d % 1 * 2)));
            if (d > this.ringCountL) {
                return c.lerp(this.background.getColor(x, y), this.curve((d - this.ringCountL) * 4));
            }
            else {
                return c;
            }
        }
    }
}
class CloudsTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, scale = 1, curve) {
        super(width, height, color1, color2, scale, curve);
        this.scales = [
            this.scale / 4,
            this.scale / 2,
            this.scale,
            this.scale * 2,
            this.scale * 4,
            this.scale * 8
        ];
        this.coeficients = [0.5, 0.25, 0.125, 0.0625, 0.03125, 0.03125];
        this.gradients = [];
        for (let i = 0; i < 6; ++i) {
            this.gradients.push(new PerlinGradient(this.width * this.scales[i], this.height * this.scales[i]));
        }
    }
    _getColor(x, y) {
        let v = 0;
        for (let i = 0; i < 6; ++i) {
            v += this.perlin(this.gradients[i], x * this.scales[i], y * this.scales[i]) * this.coeficients[i];
        }
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), this.curve(v / 2 + 0.5));
    }
}
class FrostedGlassTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, scale = 1, curve) {
        super(width, height, color1, color2, scale, curve);
        this.scales = [this.scale, this.scale * 2, this.scale * 4];
        this.coeficients = [0.5, 0.25, 0.25];
        this.gradients = [];
        for (let i = 0; i < 7; ++i) {
            this.gradients.push(new PerlinGradient(this.width * this.scales[i % 3], this.height * this.scales[i % 3]));
        }
    }
    _getColor(x, y) {
        let _x = x * this.scale, _y = y * this.scale;
        for (let i = 0; i < 3; ++i) {
            _x += this.perlin(this.gradients[i], x * this.scales[i], y * this.scales[i]) * this.coeficients[i];
            _y += this.perlin(this.gradients[i + 3], x * this.scales[i], y * this.scales[i]) * this.coeficients[i];
        }
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), this.curve(this.perlin(this.gradients[6], _x, _y) / 2 + 0.5));
    }
}
class GlassTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, scale = 1, turbulence = 1, curve) {
        super(width, height, color1, color2, scale, curve);
        this.turbulence = 0.125 * turbulence;
        this.gradients = [];
        let w = this.width * this.scale, h = this.height * this.scale;
        for (let i = 0; i < 3; ++i) {
            this.gradients.push(new PerlinGradient(w, h));
        }
    }
    _getColor(x, y) {
        let _x = Math.cos((this.perlin(this.gradients[1], x * this.scale, y * this.scale) * 128 + 128) * this.turbulence);
        let _y = Math.sin((this.perlin(this.gradients[2], x * this.scale, y * this.scale) * 128 + 128) * this.turbulence);
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), this.curve(this.perlin(this.gradients[0], x * this.scale + _x, y * this.scale + _y) / 2 + 0.5));
    }
}
class NoiseTextureGenerator extends TextureGenerator {
    constructor(width, height, color, intensity, saturation, coverage) {
        super(width, height, color);
        this.intensity = Utils.clamp(intensity, 0, 1);
        this.saturation = Utils.clamp(saturation, 0, 1);
        this.coverage = Utils.clamp(coverage, 0, 1);
        this.cache = [];
    }
    _getColor(x, y) {
        let i = Utils.flatten(this.width, Math.floor(x), Math.floor(y));
        if (this.cache[i] === undefined) {
            this.cache[i] = this.color.getColor(x, y).addNoise(this.intensity, this.saturation, this.coverage);
        }
        return this.cache[i];
    }
}
class PerlinNoiseTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, scale = 1, curve) {
        super(width, height, color1, color2, scale, curve);
        this.gradient = new PerlinGradient(this.width * this.scale, this.height * this.scale);
    }
    _getColor(x, y) {
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), this.curve(this.perlin(this.gradient, x * this.scale, y * this.scale) / 2 + 0.5));
    }
}
class VelvetTextureGenerator extends PerlinTextureGenerator {
    constructor(width, height, color1, color2, scale = 1, curve) {
        super(width, height, color1, color2, scale, curve);
        this.gradients = [];
        let w = this.width * this.scale, h = this.height * this.scale;
        for (let i = 0; i < 3; ++i) {
            this.gradients.push(new PerlinGradient(w, h));
        }
    }
    _getColor(x, y) {
        return this.color.getColor(x, y).lerp(this.color2.getColor(x, y), this.curve(this.perlin(this.gradients[0], x * this.scale + this.perlin(this.gradients[1], x * this.scale, y * this.scale), y * this.scale + this.perlin(this.gradients[2], x * this.scale, y * this.scale)) / 2 + 0.5));
    }
}
class TransformingSource extends ColorSource {
    constructor(width, height, source) {
        super(width, height);
        this.source = source;
    }
    _getColor(x, y) {
        let v = this.reverseTransform(x, y);
        return this.source.getColor(v.x, v.y);
    }
}
class FisheyeSource extends TransformingSource {
    constructor(width, height, source, scale, originX, originY, radius) {
        super(width, height, source);
        this.scale = Utils.clamp(scale, -1, 1);
        this.radius = radius;
        this.origin = new Vec2(originX, originY);
    }
    reverseTransform(x, y) {
        let v = new Vec2(x, y), dv = v.sub(this.origin);
        if (dv.isZero()) {
            return v;
        }
        let d = dv.length / this.radius;
        if (d >= 1) {
            return v;
        }
        if (this.scale < 0) {
            let coef = Utils.lerp(d, Curve.arc(d), -this.scale);
            return this.origin.add(dv.mul(coef / d));
        }
        else {
            let coef = Utils.lerp(d, Curve.invArc(d), this.scale);
            return this.origin.add(dv.mul(coef / d));
        }
    }
}
class PolarSource extends TransformingSource {
    constructor(width, height, source, sourceWidth, sourceHeight) {
        super(width, height, source);
        this.source = source;
        this.origin = new Vec2(this.width / 2, this.height / 2);
        this.coef = new Vec2(((sourceWidth !== null && sourceWidth !== void 0 ? sourceWidth : this.width)) / Angle.deg360, ((sourceHeight !== null && sourceHeight !== void 0 ? sourceHeight : this.height)) * 2 / Math.min(this.width, this.height));
    }
    reverseTransform(x, y) {
        let v = new Vec2(x, y);
        return new Vec2(this.origin.angleTo(v) * this.coef.x, v.sub(this.origin).length * this.coef.y);
    }
}
class RotatingSource extends TransformingSource {
    constructor(width, height, source, angle, originX, originY) {
        super(width, height, source);
        this.angle = angle;
        this.origin = new Vec2(originX, originY);
    }
    reverseTransform(x, y) {
        return new Vec2(x, y).rotateAround(this.origin, -this.angle);
    }
}
class ScalingSource extends TransformingSource {
    constructor(width, height, source, scale, originX, originY) {
        super(width, height, source);
        if (scale instanceof Vec2) {
            this.inverseScale = new Vec2(1 / scale.x, 1 / scale.y);
        }
        else {
            this.inverseScale = new Vec2(1 / scale, 1 / scale);
        }
        this.origin = new Vec2(originX, originY);
    }
    reverseTransform(x, y) {
        let v = new Vec2(x, y), dv = v.sub(this.origin);
        if (dv.isZero()) {
            return v;
        }
        return this.origin.addu(dv.x * this.inverseScale.x, dv.y * this.inverseScale.y);
    }
}
class TranslatingSource extends TransformingSource {
    constructor(width, height, source, xd, yd) {
        super(width, height, source);
        this.xd = xd;
        this.yd = yd;
    }
    reverseTransform(x, y) {
        return new Vec2(x - this.xd, y - this.yd);
    }
}
class Rect {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    get right() { return this.x + this.w; }
    get bottom() { return this.y + this.h; }
    pointIsInside(point) {
        let x = point.x - this.x;
        let y = point.y - this.y;
        return x >= 0 && x < this.w && y >= 0 && y < this.h;
    }
}
class Button extends Rect {
    constructor(game, x, y, w, h) {
        super(x, y, w, h);
        this.onclick = null;
        this.game = game;
        this.enabled = true;
        this._pressed = false;
    }
    get pressed() { return this._pressed && this.enabled; }
    onClick() {
        if (this.onclick) {
            this.onclick(this);
        }
    }
    step(time) { }
    render(ctx) {
        ctx.fillStyle = this.enabled ? "#606060" : "#808080";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = this.pressed ? "#A0A0A0" : "#C0C0C0";
        ctx.fillRect(this.x + 2, this.y + 2, this.w - 4, this.h - 4);
    }
    onMouseDown(button) {
        if (button == MouseButton.Left) {
            this._pressed = this.pointIsInside(this.game.getMousePosition());
        }
    }
    onMouseMove() {
        if (this._pressed && !this.pointIsInside(this.game.getMousePosition())) {
            this._pressed = false;
        }
    }
    onMouseUp(button) {
        if (button == MouseButton.Left) {
            if (this.pressed && this.pointIsInside(this.game.getMousePosition())) {
                this.onClick();
            }
            this._pressed = false;
        }
    }
}
class GuiPanel extends Rect {
    constructor(game, x, y, w, h) {
        super(x, y, w, h);
        this.items = [];
        this.game = game;
    }
    addItem(item) {
        this.items.push(item);
    }
    onMouseDown(button) {
        for (const item of this.items) {
            item.onMouseDown(button);
        }
    }
    onMouseMove() {
        for (const item of this.items) {
            item.onMouseMove();
        }
    }
    onMouseUp(button) {
        for (const item of this.items) {
            item.onMouseUp(button);
        }
    }
    step(time) {
        for (const item of this.items) {
            item.step(time);
        }
    }
    render(ctx) {
        for (const item of this.items) {
            item.render(ctx);
        }
    }
}
class PauseButton extends Button {
    get pressed() { return this._pressed && this.enabled; }
    constructor(game, x, y, w, h) {
        super(game, x, y, w, h);
    }
    render(ctx) {
        ctx.fillStyle = this._pressed ? "#606060" : "#808080";
        ctx.fillRect(this.x, this.y, this.w * 0.4, this.h);
        ctx.fillRect(this.x + this.w * 0.6, this.y, this.w * 0.4, this.h);
    }
}
class TurretUpgradeButton extends Button {
    constructor(game, x, y, w, h, type) {
        super(game, x, y, w, h);
        this.targetTile = null;
        this.type = type;
        let elementColor = RgbaColor.fromHex(TurretType.getColor(type));
        this.backColor = elementColor.lerp(RgbaColor.fromHex("#C0C0C0"), 0.5).toCss();
        this.pressedColor = elementColor.lerp(RgbaColor.fromHex("#A0A0A0"), 0.5).toCss();
    }
    onClick() {
        super.onClick();
        if (this.pressed && this.targetTile && this.targetTile.turret) {
            let turret = this.targetTile.turret;
            if (!this.game.buyUpgrade(turret.upgradeCostMultiplier(this.type))) {
                return;
            }
            turret.addType(this.type);
        }
    }
    onMouseMove() {
        if (this.pointIsInside(this.game.getMousePosition())) {
            this.game.hoverElement(this.type);
        }
        else if (this._pressed) {
            this._pressed = false;
        }
    }
    step(time) {
        super.step(time);
        if (!this.targetTile || !this.targetTile.turret) {
            return;
        }
        let upgradeCostMultiplier = this.targetTile.turret.upgradeCostMultiplier(this.type);
        this.enabled = this.game.playerCanAffordUpgrade(upgradeCostMultiplier);
    }
    render(ctx) {
        if (!this.targetTile || !this.targetTile.turret) {
            return;
        }
        let turret = this.targetTile.turret;
        let info = turret.getInfoAfterUpgrade(this.type);
        if (info === undefined) {
            return;
        }
        ctx.fillStyle = this.enabled ? "#606060" : "#808080";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = this.pressed ? this.pressedColor : this.backColor;
        ctx.fillRect(this.x + 2, this.y + 2, this.w - 4, this.h - 4);
        Tile.drawTowerGround(ctx, this.x + 4, this.y + 4);
        turret.renderPreviewAfterUpgrade(ctx, this.x + 4, this.y + 4, this.type);
        ctx.fillStyle = "#000000";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.font = "bold 14px serif";
        ctx.fillText(info.name, this.x + 74, this.y + 8);
        ctx.font = "12px monospace";
        ctx.fillText(`Range:   ${info.range}`, this.x + 74, this.y + 30);
        ctx.fillText(`Max DPS: ${info.dps}`, this.x + 74, this.y + 48);
        ctx.font = "13px serif";
        Utils.fillWrappedText(ctx, info.description, this.x + 6, this.y + 74, this.w - 12, 14);
    }
}
class Particle extends Expirable {
}
class BubbleParticle extends Particle {
    constructor(x, y, startSize, color) {
        super();
        this.x = x;
        this.y = y;
        this.life = 0;
        if (!/#[0-9a-f]{6}/i.test(color)) {
            throw new Error("Color format not supported");
        }
        this.rgb = color;
        this.startSize = startSize;
    }
    get expired() { return this.life >= 1; }
    step(time) {
        this.life += time;
    }
    render(ctx) {
        if (this.life >= 1) {
            return;
        }
        ctx.strokeStyle = this.rgb + Utils.byteToHex(255 * (1 - this.life));
        ctx.lineWidth = this.life * 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.startSize + this.life * 5, 0, Angle.deg360);
        ctx.stroke();
    }
}
class CannonSmokeParticle extends Particle {
    constructor(startPosition, direction) {
        super();
        startPosition = startPosition.addld(Rand.r(-3, 3), direction + Angle.deg90);
        this.x = startPosition.x;
        this.y = startPosition.y;
        let v = Vec2.ld(Rand.r(0, 12), direction);
        this.vx = v.x;
        this.vy = v.y;
        this.life = 0;
        let lightness = Rand.i(32, 112);
        let h = Utils.byteToHex(lightness);
        this.rgb = `#${h}${h}${h}`;
        this.size = Rand.r(1, 3);
    }
    get expired() { return this.life >= 1; }
    step(time) {
        if (this.life < 1) {
            time *= 2;
            this.life += time;
            this.x += this.vx * time;
            this.y += this.vy * time;
        }
    }
    render(ctx) {
        if (this.life >= 1) {
            return;
        }
        ctx.fillStyle = this.rgb + Utils.byteToHex(255 * (1 - this.life));
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Angle.deg360);
        ctx.fill();
    }
}
class ExplosionParticle extends Particle {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.life = 1;
        this.rgb = `#ff${Utils.byteToHex(Rand.i(64, 224))}00`;
    }
    get expired() { return this.life <= 0; }
    step(time) {
        if (this.life > 0) {
            this.life -= time * 1.5;
        }
    }
    render(ctx) {
        if (this.life <= 0) {
            return;
        }
        let r = (1 - this.life) * 10 + 4;
        ctx.fillStyle = this.rgb + Utils.byteToHex(255 * this.life);
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Angle.deg360);
        ctx.fill();
    }
}
class LineParticle extends Particle {
    constructor(x1, y1, x2, y2, life, color, width = 1) {
        super();
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.life = life;
        if (!/#[0-9a-f]{6}/i.test(color)) {
            throw new Error("Color format not supported");
        }
        this.rgb = color;
        this.width = Utils.clamp(width, 0.1, 100);
    }
    get expired() { return this.life <= 0; }
    step(time) {
        this.life -= time;
    }
    render(ctx) {
        if (this.life <= 0) {
            return;
        }
        ctx.strokeStyle = this.rgb + Utils.byteToHex(255 * this.life);
        ctx.lineWidth = this.width;
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
    }
}
class ParticleSystem extends ExpirableSet {
    render(ctx) {
        for (const p of this.items) {
            p.render(ctx);
        }
    }
    step(time) {
        if (this.items.length === 0) {
            return;
        }
        let j = this.count;
        for (let i = 0; i < j; ++i) {
            let item = this.items[i];
            item.step(time);
            if (item.expired) {
                --j;
                if (i < j) {
                    this.items[i] = this.items[j];
                }
                this.items.pop();
            }
        }
    }
}
class PlasmaBeamParticle extends Particle {
    constructor(x1, y1, x2, y2) {
        super();
        this.a = new Vec2(x1, y1);
        this.b = new Vec2(x2, y2);
        let v = this.b.sub(this.a);
        this.c1 = this.a.add(v.mul(1 / 3));
        this.c2 = this.a.add(v.mul(2 / 3));
        this.n = v.normalize().normal().mul(Rand.sign(v.length / 3));
        this.life = 0.75;
    }
    get expired() { return this.life <= 0; }
    step(time) {
        this.life -= time;
    }
    render(ctx) {
        if (this.life <= 0) {
            return;
        }
        ctx.beginPath();
        ctx.moveTo(this.a.x, this.a.y);
        let n = this.n.mul(1 - this.life), c1 = this.c1.add(n), c2 = this.c2.sub(n);
        ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, this.b.x, this.b.y);
        let rgb = `#${Utils.byteToHex(255 - 128 * this.life)}00ff`;
        ctx.strokeStyle = rgb + Utils.byteToHex(64 * this.life);
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.strokeStyle = rgb + Utils.byteToHex(128 * this.life);
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.strokeStyle = rgb + Utils.byteToHex(255 * this.life);
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}
class SmokeParticle extends Particle {
    constructor(x, y, startSize) {
        super();
        this.x = x;
        this.y = y;
        this.life = 0;
        let lightness = Rand.i(112, 176);
        let h = Utils.byteToHex(lightness);
        this.rgb = `#${h}${h}${h}`;
        this.startSize = startSize;
    }
    get expired() { return this.life >= 1; }
    step(time) {
        if (this.life < 1) {
            this.life += time;
        }
    }
    render(ctx) {
        if (this.life >= 1) {
            return;
        }
        let r = this.life * 8 + this.startSize;
        ctx.fillStyle = this.rgb + Utils.byteToHex(255 * (1 - this.life));
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Angle.deg360);
        ctx.fill();
    }
}
class SparkParticle extends Particle {
    constructor(x, y, color) {
        super();
        this.x = x;
        this.y = y;
        let v = Vec2.randUnit3d();
        this.vx = v.x;
        this.vy = v.y;
        this.life = 0;
        if (!/#[0-9a-f]{6}/i.test(color)) {
            throw new Error("Color format not supported");
        }
        this.color = color + "40";
    }
    get expired() { return this.life >= 1; }
    step(time) {
        this.life += time * 2;
        this.x += this.vx;
        this.y += this.vy;
    }
    render(ctx) {
        if (this.life >= 1) {
            return;
        }
        let r = 8 - this.life * 8;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Angle.deg360);
        ctx.fill();
    }
}
class TileMarkParticle extends Particle {
    constructor(x, y, direction) {
        super();
        this.startPosition = new Vec2(x - 2, y - 2);
        this.speed = Rand.r(1, 4);
        this.life = 0;
        this.direction = direction.normalize();
    }
    get expired() { return this.life >= 1; }
    step(time) {
        this.life += time * this.speed / 2;
    }
    render(ctx) {
        if (this.life >= 1) {
            return;
        }
        let pos = this.direction.mul(this.life * 28).add(this.startPosition);
        ctx.fillStyle = "#ffffff" + Utils.byteToHex((1 - this.life) * 64);
        ctx.fillRect(pos.x, pos.y, 4, 4);
    }
}
class TrailParticle extends Particle {
    constructor(x, y, color, scale = 1) {
        super();
        this.x = x;
        this.y = y;
        let v = Vec2.randUnit3d();
        this.vx = v.x * 4;
        this.vy = v.y * 4;
        this.life = 0;
        if (!/#[0-9a-f]{6}/i.test(color)) {
            throw new Error("Color format not supported");
        }
        this.color = color;
        this.size = scale * 3;
    }
    get expired() { return this.life >= 1; }
    step(time) {
        this.life += time * 4;
    }
    render(ctx) {
        if (this.life >= 1) {
            return;
        }
        ctx.fillStyle = this.color + Utils.byteToHex(255 * (1 - this.life));
        ctx.beginPath();
        ctx.arc(this.x + this.life * this.vx, this.y + this.life * this.vy, (1 - this.life) * this.size, 0, Angle.deg360);
        ctx.fill();
    }
}
class WindParticle extends Particle {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.life = 0;
    }
    get expired() { return this.life >= 1; }
    step(time) {
        this.life += time * 2.5;
    }
    render(ctx) {
        if (this.life >= 1) {
            return;
        }
        let alpha = this.life > 0.5 ? 2 - this.life * 2 : this.life * 2;
        ctx.strokeStyle = "#ffffff" + Utils.byteToHex(255 * alpha);
        ctx.beginPath();
        ctx.moveTo(this.x - 2, this.y);
        ctx.lineTo(this.x + 2, this.y);
        ctx.stroke();
    }
}
class Projectile extends Expirable {
    constructor(game) {
        super();
        this.game = game;
    }
}
class GuidedProjectile extends Projectile {
    constructor(game, position, target, speed, range) {
        super(game);
        this.relPos = 0;
        this._expired = false;
        this.startPosition = position;
        this.position = position;
        this.target = target.pos;
        this.targetEnemy = target;
        this.speed = speed;
        this.range = range;
    }
    get expired() { return this._expired; }
    adjustTargetPosition() {
        if (!this.targetEnemy.expired) {
            this.target = this.targetEnemy.pos;
        }
    }
    step(time) {
        if (this._expired) {
            return;
        }
        this.adjustTargetPosition();
        this.relPos += time * this.speed;
        let direction = this.target.sub(this.startPosition);
        let distance = direction.length;
        if (this.relPos >= distance) {
            if (this.onhit && !this.targetEnemy.expired) {
                this.onhit(this.targetEnemy);
            }
            this._expired = true;
            return;
        }
        this.position = this.target.sub(this.startPosition)
            .mul(this.relPos / distance)
            .add(this.startPosition);
        if (this.startPosition.distanceTo(this.position) > this.range) {
            this._expired = true;
        }
    }
}
class AcidProjectile extends GuidedProjectile {
    constructor(game, position, target, strength, range) {
        super(game, position, target, 250, range);
        this.onhit = enemy => {
            enemy.dealDamage(4);
            enemy.addEffect(new AcidEffect(2, strength));
        };
    }
    step(time) {
        if (this.expired) {
            return;
        }
        super.step(time);
        this.game.spawnParticle(new TrailParticle(this.position.x, this.position.y, "#d0ff00"));
    }
    render(ctx) { }
}
class ArrowProjectile extends GuidedProjectile {
    constructor(game, position, target, damage) {
        super(game, position, target, 640, Infinity);
        this.target = target.posAhead(position.distanceTo(target.pos) / 640);
        this.onhit = enemy => enemy.dealDamage(damage);
    }
    adjustTargetPosition() {
        if (!this.targetEnemy.expired) {
            this.target = this.targetEnemy.posAhead(this.position.distanceTo(this.targetEnemy.pos) / 640);
        }
    }
    render(ctx) {
        if (this._expired) {
            return;
        }
        let dv = this.target.sub(this.position).normalize();
        let a = dv.mul(-4).add(this.position);
        let b = dv.mul(4).add(this.position);
        ctx.strokeStyle = "#542F00";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
    }
}
class ThrownProjectile extends Projectile {
    constructor(game, position, target, speed) {
        super(game);
        this.relPos = 0;
        this._expired = false;
        this.startPosition = position;
        this.position = position;
        this.target = target;
        this.speed = speed;
    }
    get expired() { return this._expired; }
    step(time) {
        if (this._expired) {
            return;
        }
        this.relPos += time * this.speed;
        let direction = this.target.sub(this.startPosition);
        let distance = direction.length;
        if (this.relPos >= distance) {
            if (this.onhit) {
                this.onhit(this.target);
            }
            this._expired = true;
            return;
        }
        this.position = this.target.sub(this.startPosition)
            .mul(this.relPos / distance)
            .add(this.startPosition);
    }
}
class CannonballProjectile extends ThrownProjectile {
    constructor(game, position, target) {
        super(game, position, target, 640);
    }
    render(ctx) {
        if (this._expired) {
            return;
        }
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 3, 0, Angle.deg360);
        ctx.fill();
    }
}
class EarthProjectile extends ThrownProjectile {
    constructor(game, position, target, size) {
        super(game, position, target.posAhead(target.pos.distanceTo(position) / 300)
            .add(Vec2.randUnit3d().mul(5.5)), 300);
        this.r1 = size / 2 + 3;
        this.r2 = Rand.r(this.r1 * 0.5, this.r1 * 0.75);
        this.angle = Angle.rand();
        let damage = 15 + size * 5;
        this.onhit = pos => {
            let enemy = this.game.findEnemy(pos, 5);
            if (enemy) {
                enemy.dealDamage(damage);
                if (damage > 14 && Rand.chance((damage - 12.5) * 0.04)) {
                    enemy.addEffect(new StunEffect(0.5));
                }
            }
            else {
                this.game.spawnParticle(new SmokeParticle(pos.x, pos.y, 5));
            }
        };
    }
    step(time) {
        if (this.expired) {
            return;
        }
        super.step(time);
    }
    render(ctx) {
        ctx.fillStyle = "#C0C0C0";
        ctx.beginPath();
        ctx.ellipse(this.position.x, this.position.y, this.r1, this.r2, this.angle, 0, Angle.deg360);
        ctx.fill();
    }
}
class FireProjectile extends GuidedProjectile {
    constructor(game, position, target, damage, duration, range) {
        super(game, position, target, 250, range);
        this.onhit = enemy => {
            enemy.dealDamage(damage);
            enemy.addEffect(new BurningEffect(duration));
        };
    }
    step(time) {
        if (this.expired) {
            return;
        }
        super.step(time);
        let r = Rand.r();
        if (r < 0.27) {
            this.game.spawnParticle(new TrailParticle(this.position.x, this.position.y, "#ff5000"));
        }
        else if (r < 0.54) {
            this.game.spawnParticle(new TrailParticle(this.position.x, this.position.y, "#ff2000"));
        }
        else if (r < 0.81) {
            this.game.spawnParticle(new TrailParticle(this.position.x, this.position.y, "#d00000"));
        }
        else {
            this.game.spawnParticle(new SmokeParticle(this.position.x, this.position.y, 1));
        }
    }
    render(ctx) { }
}
class ProjectileSet extends ExpirableSet {
    render(ctx) {
        for (const p of this.items) {
            p.render(ctx);
        }
    }
}
class WaterProjectile extends GuidedProjectile {
    constructor(game, position, target, strength, range) {
        super(game, position, target, 350, range);
        this.onhit = enemy => {
            enemy.dealDamage(strength / 2 + 0.5);
            enemy.addEffect(new WetEffect(2, strength));
            if (strength > 1 && Rand.chance(strength * 0.2)) {
                enemy.pushBack();
            }
        };
    }
    step(time) {
        if (this.expired) {
            return;
        }
        super.step(time);
        let r = Rand.r();
        if (r < 0.25) {
            this.game.spawnParticle(new TrailParticle(this.position.x, this.position.y, "#3584CE", 0.75));
        }
        else if (r < 0.5) {
            this.game.spawnParticle(new TrailParticle(this.position.x, this.position.y, "#399CDE", 0.75));
        }
    }
    render(ctx) {
        if (this._expired) {
            return;
        }
        ctx.fillStyle = "#3584CE";
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 3, 0, Angle.deg360);
        ctx.fill();
    }
}
class Turret {
    constructor(tile, type) {
        this.game = tile.game;
        this.tile = tile;
        this.center = new Vec2(tile.pos.x + 32, tile.pos.y + 32);
        this.hp = 100;
        this.type = type === undefined ? new TurretType() : type;
        this.cooldown = 0;
    }
    get ready() { return this.cooldown <= 0; }
    get range() { return 0; }
    step(time) {
        if (this.cooldown > 0) {
            this.cooldown = Math.max(0, this.cooldown - time);
        }
    }
    render(ctx) { }
    static renderPreview(ctx, x, y, type) { }
    getType() { return this.type.copy(); }
    upgradeCostMultiplier(type) {
        switch (this.type.count) {
            case 0: return 1;
            case 1: return this.type.contains(type) ? 1 : 2;
            case 2: return this.type.contains(type) ? 2 : 4;
            case 3: return this.type.contains(type) ? 4 : 8;
            default: return -1;
        }
    }
    addType(type) {
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new AirTurret(this.tile, this.type.with(type));
                break;
            case TurretElement.Earth:
                this.tile.turret = new EarthTurret(this.tile, this.type.with(type));
                break;
            case TurretElement.Fire:
                this.tile.turret = new FireTurret(this.tile, this.type.with(type));
                break;
            case TurretElement.Water:
                this.tile.turret = new WaterTurret(this.tile, this.type.with(type));
                break;
        }
    }
    static getInfo(type) { return undefined; }
    getCurrentInfo() { return undefined; }
    getInfoAfterUpgrade(type) {
        switch (type) {
            case TurretElement.Air: return AirTurret.getInfo(this.type.with(type));
            case TurretElement.Earth: return EarthTurret.getInfo(this.type.with(type));
            case TurretElement.Fire: return FireTurret.getInfo(this.type.with(type));
            case TurretElement.Water: return WaterTurret.getInfo(this.type.with(type));
        }
    }
    renderPreviewAfterUpgrade(ctx, x, y, type) {
        switch (type) {
            case TurretElement.Air:
                AirTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Earth:
                EarthTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Fire:
                FireTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Water:
                WaterTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
        }
    }
    static initAll() {
        return Promise.all([
            AirTurret.init(),
            FireTurret.init(),
            EarthTurret.init(),
            WaterTurret.init(),
            IceTurret.init(),
            AcidTurret.init(),
            CannonTurret.init(),
            ArcherTurret.init(),
            LightningTurret.init(),
            FlamethrowerTurret.init(),
            SunTurret.init(),
            MoonTurret.init(),
            PlasmaTurret.init(),
            EarthquakeTurret.init(),
            ArcaneTurret.init()
        ]);
    }
}
class AcidTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.frame = 0;
    }
    get range() { return 80 + this.type.count * 16; }
    step(time) {
        super.step(time);
        this.frame = (this.frame + time * 25) % AcidTurret.frameCount;
        if (this.ready) {
            let enemies = this.game.findEnemiesInRange(this.center, this.range);
            let enemy = null;
            let bestDistance = Infinity;
            let bestStrength = Infinity;
            let bestDuration = Infinity;
            for (const e of enemies) {
                let effect = e.getEffect(eff => eff instanceof AcidEffect);
                let distance = this.center.distanceTo(e.pos);
                let strength = effect ? effect.strength : 0;
                let duration = effect ? effect.duration : 0;
                if (strength < bestStrength) {
                    enemy = e;
                    bestDistance = distance;
                    bestStrength = strength;
                    bestDuration = duration;
                }
                else if (strength == bestStrength) {
                    if (duration < bestDuration) {
                        enemy = e;
                        bestDistance = distance;
                        bestStrength = strength;
                        bestDuration = duration;
                    }
                    else if (duration == bestDuration && distance < bestDistance) {
                        enemy = e;
                        bestDistance = distance;
                        bestStrength = strength;
                        bestDuration = duration;
                    }
                }
            }
            if (enemy) {
                this.game.spawnProjectile(new AcidProjectile(this.game, this.center, enemy, this.type.count, this.range));
                this.cooldown = 1 / this.type.count;
            }
        }
    }
    render(ctx) {
        super.render(ctx);
        ctx.drawImage(AcidTurret.images, Math.floor(this.frame) * 48, (this.type.water + this.type.earth - 2) * 48, 48, 48, this.tile.pos.x + 8, this.tile.pos.y + 8, 48, 48);
    }
    static renderPreview(ctx, x, y, type) {
        ctx.drawImage(AcidTurret.images, 0, (type.water + type.earth - 2) * 48, 48, 48, x + 8, y + 8, 48, 48);
    }
    addType(type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new MoonTurret(this.tile, this.type.with(type));
                break;
            case TurretElement.Fire:
                this.tile.turret = new EarthquakeTurret(this.tile, this.type.with(type));
                break;
            case TurretElement.Earth:
            case TurretElement.Water:
                this.type.add(type);
                break;
        }
    }
    static getInfo(type) {
        return new TurretInfo(AcidTurret.turretName, AcidTurret.turretDescription, 80 + type.count * 16, `${type.count * 4} + acid`);
    }
    getCurrentInfo() { return AcidTurret.getInfo(this.type); }
    getInfoAfterUpgrade(type) {
        if (this.type.count >= 4) {
            return undefined;
        }
        switch (type) {
            case TurretElement.Air: return MoonTurret.getInfo(this.type.with(type));
            case TurretElement.Earth: return AcidTurret.getInfo(this.type.with(type));
            case TurretElement.Fire: return EarthquakeTurret.getInfo(this.type.with(type));
            case TurretElement.Water: return AcidTurret.getInfo(this.type.with(type));
        }
    }
    renderPreviewAfterUpgrade(ctx, x, y, type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                MoonTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Earth:
                AcidTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Fire:
                EarthquakeTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Water:
                AcidTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
        }
    }
    static init() {
        return Utils.getImageFromCache("td_tower_aEfW_acid_strip" + AcidTurret.frameCount).then(tex => { AcidTurret.images = tex; }, () => new Promise(resolve => {
            let acidTex = new CellularTextureGenerator(32, 32, 9, "#E0FF00", "#5B7F00", CellularTextureType.Balls).generateImage();
            let c = new PreRenderedImage(48 * AcidTurret.frameCount, 144);
            for (let i = 0; i < AcidTurret.frameCount; ++i) {
                AcidTurret.preRenderFrame(acidTex, c.ctx, i);
            }
            c.cacheImage("td_tower_aEfW_acid_strip" + AcidTurret.frameCount);
            AcidTurret.images = c.image;
            resolve();
        }));
    }
    static preRenderFrame(texture, targetCtx, frame) {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        let offset = frame / AcidTurret.frameCount * 32;
        let c0 = new PreRenderedImage(48, 48);
        let c1 = new PreRenderedImage(48, 48);
        let c2 = new PreRenderedImage(48, 48);
        let c = [c0, c1, c2];
        let ctx = c0.ctx;
        ctx.beginPath();
        ctx.moveTo(18, 12);
        ctx.arcTo(36, 12, 36, 18, 6);
        ctx.arcTo(36, 36, 30, 36, 6);
        ctx.arcTo(12, 36, 12, 30, 6);
        ctx.arcTo(12, 12, 18, 12, 6);
        ctx.closePath();
        ctx.fillStyle = "#B0B0B0";
        ctx.fill();
        ctx.strokeStyle = "#D0D0D0";
        ctx.lineWidth = 2;
        ctx.stroke();
        c1.ctx.drawImage(c0.image, 0, 0);
        c2.ctx.drawImage(c0.image, 0, 0);
        for (let i = 0; i < 3; ++i) {
            let w = 8 + 2 * i;
            let ca = new PreRenderedImage(w, w);
            ctx = ca.ctx;
            ctx.fillStyle = "#D0D0D060";
            ctx.fillRect(0, 0, w, w);
            ctx.fillStyle = "#D0D0D0";
            ctx.fillRect(0, 1, w, w - 2);
            ctx.fillRect(1, 0, w - 2, w);
            let pattern = ctx.createPattern(texture, "repeat");
            pattern.setTransform(svg.createSVGMatrix().translate(-offset, 0));
            ctx.fillStyle = pattern;
            ctx.fillRect(1, 1, w - 2, w - 2);
            ctx = c[i].ctx;
            ctx.translate(24, 24);
            ctx.drawImage(ca.image, 12, -4 - i);
            ctx.rotate(Angle.deg90);
            ctx.drawImage(ca.image, 12, -4 - i);
            ctx.rotate(Angle.deg90);
            ctx.drawImage(ca.image, 12, -4 - i);
            ctx.rotate(Angle.deg90);
            ctx.drawImage(ca.image, 12, -4 - i);
            ctx.resetTransform();
            ctx.fillStyle = ctx.createPattern(texture, "repeat");
            ctx.beginPath();
            ctx.arc(24, 24, 6 + i, 0, Angle.deg360);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#60606080";
            ctx.fill();
            let grad = ctx.createLinearGradient(17 - i / 2, 17 - i / 2, 30 + i / 2, 30 + i / 2);
            grad.addColorStop(0, "#808080");
            grad.addColorStop(1, "#404040");
            ctx.strokeStyle = grad;
            ctx.lineWidth = 2 + i;
            ctx.stroke();
        }
        targetCtx.drawImage(c0.image, frame * 48, 0);
        targetCtx.drawImage(c1.image, frame * 48, 48);
        targetCtx.drawImage(c2.image, frame * 48, 96);
    }
}
AcidTurret.frameCount = 50;
AcidTurret.turretName = "Acid Tower";
AcidTurret.turretDescription = "Covers enemies in armor dissolving acid";
class AirTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.angle = 0;
    }
    get range() { return 96 + this.type.air * 32; }
    step(time) {
        super.step(time);
        this.angle = (this.angle + Angle.deg360 - time * Angle.deg120) % Angle.deg360;
        for (const enemy of this.game.findEnemiesInRange(this.center, this.range)) {
            enemy.dealDamage((4 + this.type.air * 4) * time);
            if (Rand.chance(0.01 * this.type.air)) {
                this.game.spawnParticle(new WindParticle(enemy.x + Rand.i(-6, 7), enemy.y + Rand.i(-6, 7)));
            }
        }
    }
    static _render(ctx, centerX, centerY, type, angle = 0) {
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.drawImage(AirTurret.image, -24, -8);
        switch (type.air) {
            case 1:
                ctx.rotate(Angle.deg90);
                ctx.drawImage(AirTurret.image, -24, -8);
                break;
            case 2:
                for (let i = 0; i < 2; ++i) {
                    ctx.rotate(Angle.deg60);
                    ctx.drawImage(AirTurret.image, -24, -8);
                }
                break;
            case 3:
                for (let i = 0; i < 3; ++i) {
                    ctx.rotate(Angle.deg45);
                    ctx.drawImage(AirTurret.image, -24, -8);
                }
                break;
            case 4:
                for (let i = 0; i < 4; ++i) {
                    ctx.rotate(Angle.deg36);
                    ctx.drawImage(AirTurret.image, -24, -8);
                }
                break;
        }
        ctx.resetTransform();
    }
    render(ctx) {
        super.render(ctx);
        AirTurret._render(ctx, this.center.x, this.center.y, this.type, this.angle);
    }
    static renderPreview(ctx, x, y, type) {
        AirTurret._render(ctx, x + 32, y + 32, type);
    }
    addType(type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                this.type.add(type);
                break;
            case TurretElement.Earth:
                this.tile.turret = new ArcherTurret(this.tile, this.type.with(type));
                break;
            case TurretElement.Fire:
                this.tile.turret = new LightningTurret(this.tile, this.type.with(type));
                break;
            case TurretElement.Water:
                this.tile.turret = new IceTurret(this.tile, this.type.with(type));
                break;
        }
    }
    static getInfo(type) {
        return new TurretInfo(AirTurret.turretName, AirTurret.turretDescription, 96 + type.air * 32, `${4 + type.air * 4}`);
    }
    getCurrentInfo() { return AirTurret.getInfo(this.type); }
    getInfoAfterUpgrade(type) {
        if (this.type.count >= 4) {
            return undefined;
        }
        switch (type) {
            case TurretElement.Air: return AirTurret.getInfo(this.type.with(type));
            case TurretElement.Earth: return ArcherTurret.getInfo(this.type.with(type));
            case TurretElement.Fire: return LightningTurret.getInfo(this.type.with(type));
            case TurretElement.Water: return IceTurret.getInfo(this.type.with(type));
        }
    }
    renderPreviewAfterUpgrade(ctx, x, y, type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                AirTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Earth:
                ArcherTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Fire:
                LightningTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Water:
                IceTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
        }
    }
    static init() {
        return Utils.getImageFromCache("td_tower_Aefw_air").then(tex => { AirTurret.image = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(48, 16);
            let renderable = new RenderablePathSet();
            let path = new Path2D();
            path.ellipse(36, 8, 12, 8, 0, 0, Angle.deg180);
            let grad = c.ctx.createLinearGradient(24, 8, 24, 16);
            renderable.pushNew(path, grad);
            path = new Path2D();
            path.ellipse(12, 8, 12, 8, 0, Angle.deg180, 0);
            grad = c.ctx.createLinearGradient(24, 8, 24, 0);
            renderable.pushNew(path, grad);
            path = new Path2D();
            path.arc(24, 8, 8, 0, Angle.deg360);
            grad = c.ctx.createRadialGradient(24, 8, 8, 24, 8, 4);
            renderable.pushNew(path, grad);
            for (const rp of renderable.paths) {
                rp.path.closePath();
                const gr = rp.fill;
                gr.addColorStop(0, "#B2A5FF");
                gr.addColorStop(1, "#A0A0A0");
            }
            renderable.render(c.ctx);
            c.cacheImage("td_tower_Aefw_air");
            AirTurret.image = c.image;
            resolve();
        }));
    }
}
AirTurret.turretName = "Air Tower";
AirTurret.turretDescription = "Constantly deals damage to all enemies in range";
class ArcaneTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.frame = 0;
        this.orbits = [];
        for (let i = 0; i < ArcaneTurret.orbitCount; ++i) {
            this.orbits.push({
                r1: Rand.r(36, 64),
                r2: Rand.r(64, 92),
                angle: Angle.rand(),
                pos: Angle.rand(),
                speed: Rand.sign(Rand.r(Angle.deg120, Angle.deg240)),
                size: Rand.r(1.5, 2.5)
            });
        }
        this.cooldown = ArcaneTurret.maxCooldown;
    }
    get range() { return 96; }
    step(time) {
        super.step(time);
        this.frame = (this.frame + time * 25) % ArcaneTurret.frameCount;
        let orbitCount = (1 - this.cooldown / ArcaneTurret.maxCooldown) * ArcaneTurret.orbitCount;
        for (let i = 0; i < orbitCount; ++i) {
            let pt = this.orbits[i];
            pt.pos = Angle.wrap(pt.pos + time * pt.speed);
        }
        if (this.ready) {
            let enemy = this.game.findEnemy(this.center, this.range);
            if (enemy) {
                for (let i = 0; i < ArcaneTurret.orbitCount; ++i) {
                    let pt = this.orbits[i];
                    let v = Vec2.onEllipse(pt.r1, pt.r2, pt.pos).rotate(pt.angle).add(this.center);
                    this.game.spawnParticle(new LineParticle(v.x, v.y, enemy.x, enemy.y, pt.size / 2.5, ArcaneTurret.orbitColors[i % 4], pt.size - 0.5));
                    this.game.spawnParticle(new SparkParticle(enemy.x, enemy.y, ArcaneTurret.orbitColors[i % 4]));
                    this.game.spawnParticle(new SparkParticle(enemy.x, enemy.y, ArcaneTurret.orbitColors[i % 4]));
                    this.game.spawnParticle(new SparkParticle(enemy.x, enemy.y, ArcaneTurret.orbitColors[i % 4]));
                }
                enemy.dealDamage(Infinity);
                this.cooldown = ArcaneTurret.maxCooldown;
            }
        }
    }
    render(ctx) {
        super.render(ctx);
        ctx.drawImage(ArcaneTurret.images, Math.floor(this.frame) * 64, 0, 64, 64, this.tile.pos.x, this.tile.pos.y, 64, 64);
        let orbitCount = (1 - this.cooldown / ArcaneTurret.maxCooldown) * ArcaneTurret.orbitCount;
        for (let i = 0; i < orbitCount; ++i) {
            ctx.fillStyle = ArcaneTurret.orbitColors[i % 4];
            let pt = this.orbits[i];
            let v = Vec2.onEllipse(pt.r1, pt.r2, pt.pos).rotate(pt.angle).add(this.center);
            ctx.beginPath();
            ctx.arc(v.x, v.y, pt.size, 0, Angle.deg360);
            ctx.fill();
        }
    }
    static renderPreview(ctx, x, y, type) {
        ctx.drawImage(ArcaneTurret.images, 0, 0, 64, 64, x, y, 64, 64);
    }
    addType(type) { }
    static getInfo(type) {
        return new TurretInfo(ArcaneTurret.turretName, ArcaneTurret.turretDescription, 96, `-`);
    }
    getCurrentInfo() { return ArcaneTurret.getInfo(this.type); }
    getInfoAfterUpgrade(type) { return undefined; }
    renderPreviewAfterUpgrade(ctx, x, y, type) { }
    static init() {
        ArcaneTurret.orbitColors = new TurretType([1, 1, 1, 1]).toColorArray();
        return Utils.getImageFromCache("td_tower_AEFW_arcane").then(tex => { ArcaneTurret.images = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(ArcaneTurret.frameCount * 64, 64);
            let r = this.prepareGradient(RgbaColor.red);
            let g = new RotatingSource(64, 64, this.prepareGradient(RgbaColor.green), Angle.deg60, 32, 32);
            let b = new RotatingSource(64, 64, this.prepareGradient(RgbaColor.blue), Angle.deg120, 32, 32);
            let rgb = new BufferedColorSource(64, 64, new AddingSource(64, 64, r, new AddingSource(64, 64, g, b)));
            let v = new BufferedColorSource(64, 64, new VelvetTextureGenerator(64, 64, "#FFFFFF00", "#FFFFFF", 0.5));
            let i = 0;
            function curve(x) {
                return Math.cos(i * Angle.deg360 / ArcaneTurret.frameCount + x * Angle.deg360) / 2 + 0.5;
            }
            let glass = new GlassTextureGenerator(64, 64, "#707070", "#909090", 0.5, 0.5, curve);
            for (; i < ArcaneTurret.frameCount; ++i) {
                let ic = i * 64 / ArcaneTurret.frameCount;
                let s = new TranslatingSource(192, 64, v, 0, ic);
                s = new PolarSource(64, 64, s, 192, 64);
                s = new FisheyeSource(64, 64, s, 0.5, 32, 32, 24);
                s = new BlendingSource(64, 64, rgb, s);
                let grad = new RadialGradientSource(64, 64, 32, 32, 0, 4);
                grad.addColorStop(0, RgbaColor.white);
                grad.addColorStop(1, s);
                new CircleSource(64, 64, 32, 32, 24, grad, ArcaneTurret.prepareGround(glass)).generateInto(c.ctx, i * 64, 0);
            }
            c.cacheImage("td_tower_AEFW_arcane");
            ArcaneTurret.images = c.image;
            resolve();
        }));
    }
    static prepareGradient(color) {
        let grad = new LinearGradientSource(64, 64, 32, 16, 32, 48);
        grad.addColorStop(0, RgbaColor.black);
        grad.addColorStop(1, RgbaColor.black);
        for (let i = 0; i < 8; ++i) {
            let c = RgbaColor.black.lerp(color, Curve.sin(i / 8));
            grad.addColorStop(i / 16, c);
            grad.addColorStop(32 - i / 16, c);
        }
        grad.addColorStop(0.5, color);
        return grad;
    }
    static prepareGround(base) {
        let l1 = new BlendingSource(64, 64, base, "#FFFFFF40");
        let l2 = new BlendingSource(64, 64, base, "#FFFFFF20");
        let d1 = new BlendingSource(64, 64, base, "#00000040");
        let d2 = new BlendingSource(64, 64, base, "#00000020");
        let ground = new RectangleSource(64, 64, 0, 0, 62, 62, l1, base);
        ground = new RectangleSource(64, 64, 2, 2, 62, 62, d1, ground);
        ground = new RectangleSource(64, 64, 2, 2, 60, 60, base, ground);
        ground = new RectangleSource(64, 64, 6, 6, 50, 50, d2, ground);
        ground = new RectangleSource(64, 64, 8, 8, 50, 50, l2, ground);
        return new RectangleSource(64, 64, 8, 8, 48, 48, base, ground);
    }
}
ArcaneTurret.frameCount = 50;
ArcaneTurret.orbitCount = 16;
ArcaneTurret.maxCooldown = 16;
ArcaneTurret.turretName = "Arcane Tower";
ArcaneTurret.turretDescription = "Increases damage of all other towers by 25%, can instantly kill any enemy with a cooldown of 16 seconds";
class ArcherTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.angle = Angle.rand();
    }
    get range() { return 80 + this.type.air * 64 + this.type.earth * 16; }
    step(time) {
        super.step(time);
        if (this.ready) {
            let enemies = this.game.findEnemiesInRange(this.center, this.range);
            let enemy = null;
            let minHp = Infinity;
            for (const e of enemies) {
                if (e.hp < minHp) {
                    enemy = e;
                    minHp = e.hp;
                }
            }
            if (enemy) {
                this.game.spawnProjectile(new ArrowProjectile(this.game, enemy.pos.sub(this.center).toLength(28).add(this.center), enemy, this.type.air * 4 + this.type.earth * 6));
                this.cooldown = 0.5;
            }
        }
    }
    render(ctx) {
        super.render(ctx);
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.drawImage(ArcherTurret.images, 0, (this.type.count - 2) * 48, 48, 48, -24, -24, 48, 48);
        ctx.resetTransform();
    }
    static renderPreview(ctx, x, y, type) {
        ctx.drawImage(ArcherTurret.images, 0, (type.count - 2) * 48, 48, 48, x + 8, y + 8, 48, 48);
    }
    addType(type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
            case TurretElement.Earth:
                this.type.add(type);
                break;
            case TurretElement.Fire:
                this.tile.turret = new SunTurret(this.tile, this.type.with(type));
                break;
            case TurretElement.Water:
                this.tile.turret = new MoonTurret(this.tile, this.type.with(type));
                break;
        }
    }
    static getInfo(type) {
        let a = type.air - 1;
        let e = type.earth - 1;
        return new TurretInfo(ArcherTurret.turretName, ArcherTurret.turretDescription, 160 + a * 64 + e * 16, `${16 + a * 8 + e * 12}`);
    }
    getCurrentInfo() { return ArcherTurret.getInfo(this.type); }
    getInfoAfterUpgrade(type) {
        if (this.type.count >= 4) {
            return undefined;
        }
        switch (type) {
            case TurretElement.Air:
                return ArcherTurret.getInfo(this.type.with(type));
            case TurretElement.Earth:
                return ArcherTurret.getInfo(this.type.with(type));
            case TurretElement.Fire:
                return SunTurret.getInfo(this.type.with(type));
            case TurretElement.Water:
                return MoonTurret.getInfo(this.type.with(type));
        }
    }
    renderPreviewAfterUpgrade(ctx, x, y, type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                ArcherTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Earth:
                ArcherTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Fire:
                SunTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Water:
                MoonTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
        }
    }
    static init() {
        return Utils.getImageFromCache("td_tower_AEfw_archer")
            .then(tex => { ArcherTurret.images = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(48, 144);
            let argSets = [
                { h: 10, y: 0, s: 0.7 },
                { h: 11, y: 48, s: 0.85 },
                { h: 12, y: 96, s: 1 },
            ];
            let noise = new NoiseTextureGenerator(48, 48, "#E0D2B3", 0.125, 0, 1);
            for (const args of argSets) {
                let src = new RoofTilesSource(48, 48, args.h, 3, noise, "#706859", RgbaColor.transparent);
                src = new PolarSource(48, 48, src);
                if (args.s < 1) {
                    src = new ScalingSource(48, 48, src, args.s, 24, 24);
                }
                src = new CircleSource(48, 48, 24, 24, 23 * args.s, src, RgbaColor.transparent);
                src = new FisheyeSource(48, 48, src, 0.5, 24, 24, 24);
                src = new AntialiasedSource(48, 48, src);
                src.generateInto(c.ctx, 0, args.y);
            }
            c.cacheImage("td_tower_AEfw_archer");
            ArcherTurret.images = c.image;
            resolve();
        }));
    }
}
ArcherTurret.turretName = "Archer Tower";
ArcherTurret.turretDescription = "Precise tower with long range and decent damage";
class CannonTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.angle = Angle.rand();
    }
    get range() { return 96 + this.type.count * 16; }
    createExplosionAt(pos) {
        let r = 8 + this.type.count * 3;
        for (let i = 0, c = 9 + this.type.count; i < c; ++i) {
            let p = Vec2.randUnit3d().mul(r).add(pos);
            this.game.spawnParticle(new ExplosionParticle(p.x, p.y));
        }
        r = 16 + this.type.count * 4;
        for (let i = 0, c = 9 + this.type.count * 4; i < c; ++i) {
            let p = Vec2.randUnit3d().mul(r).add(pos);
            this.game.spawnParticle(new SmokeParticle(p.x, p.y, Rand.r(2)));
        }
        r = 24 + this.type.count * 4;
        for (const enemy of this.game.findEnemiesInRange(pos, r)) {
            enemy.dealDamage(20 * this.type.earth + 10 * this.type.fire - 10);
            if (Rand.chance(this.type.fire * 0.25 - 0.25)) {
                enemy.addEffect(new BurningEffect(this.type.fire));
            }
        }
    }
    step(time) {
        super.step(time);
        let enemies = this.game.findEnemiesInRange(this.center, this.range);
        let enemy = null;
        let closestAngle = Infinity;
        for (const e of enemies) {
            let a = this.center.angleTo(e.pos);
            let diff = Angle.toDegrees(Angle.absDifference(this.angle, a)) + this.center.distanceTo(e.pos);
            if (diff < closestAngle) {
                enemy = e;
                closestAngle = diff;
            }
        }
        if (enemy) {
            let a = this.center.angleTo(enemy.pos);
            this.angle = Angle.rotateTo(this.angle, a, Angle.deg120 * time);
            if (this.ready) {
                let d = this.center.distanceTo(enemy.pos);
                let t = Vec2.ld(d, this.angle, this.center.x, this.center.y);
                if (t.distanceTo(enemy.pos) < 16) {
                    let firingPos = this.center.addld(18 + this.type.count * 2, this.angle);
                    let cp = new CannonballProjectile(this.game, firingPos, t);
                    cp.onhit = pos => this.createExplosionAt(pos);
                    this.game.spawnProjectile(cp);
                    for (let i = 0; i < 8; ++i) {
                        this.game.spawnParticle(new CannonSmokeParticle(firingPos, this.angle));
                    }
                    this.cooldown = 2;
                }
            }
        }
    }
    render(ctx) {
        super.render(ctx);
        let r = 12 + this.type.count;
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.translate(-3 * this.cooldown, 0);
        ctx.drawImage(CannonTurret.image, -r * 2, -r, r * 4, r * 2);
        ctx.resetTransform();
    }
    static renderPreview(ctx, x, y, type) {
        let r = 12 + type.count;
        ctx.drawImage(CannonTurret.image, x + 32 - r * 2, y + 32 - r, r * 4, r * 2);
    }
    addType(type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new SunTurret(this.tile, this.type.with(type));
                break;
            case TurretElement.Earth:
            case TurretElement.Fire:
                this.type.add(type);
                break;
            case TurretElement.Water:
                this.tile.turret = new EarthquakeTurret(this.tile, this.type.with(type));
                break;
        }
    }
    static getInfo(type) {
        return new TurretInfo(CannonTurret.turretName, CannonTurret.turretDescription, 96 + type.count * 16, `${10 * type.earth + 5 * type.fire - 5}${type.fire > 1 ? " + burning" : ""}`);
    }
    getCurrentInfo() { return FireTurret.getInfo(this.type); }
    getInfoAfterUpgrade(type) {
        if (this.type.count >= 4) {
            return undefined;
        }
        switch (type) {
            case TurretElement.Air:
                return SunTurret.getInfo(this.type.with(type));
            case TurretElement.Earth:
                return CannonTurret.getInfo(this.type.with(type));
            case TurretElement.Fire:
                return CannonTurret.getInfo(this.type.with(type));
            case TurretElement.Water:
                return EarthquakeTurret.getInfo(this.type.with(type));
        }
    }
    renderPreviewAfterUpgrade(ctx, x, y, type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                SunTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Earth:
                CannonTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Fire:
                CannonTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Water:
                EarthquakeTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
        }
    }
    static init() {
        return Utils.getImageFromCache("td_tower_aEFw_cannon")
            .then(tex => { CannonTurret.image = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(64, 32);
            let ctx = c.ctx;
            let grad = ctx.createLinearGradient(20, 16, 40, 16);
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
            ctx.fillRect(20, 3, 20, 26);
            ctx.beginPath();
            ctx.arc(20, 16, 7, Angle.deg90, Angle.deg270);
            ctx.arcTo(42, 9, 52, 12, 50);
            ctx.arc(54, 12, 2, Angle.deg180, Angle.deg360);
            ctx.lineTo(56, 20);
            ctx.arc(54, 20, 2, 0, Angle.deg180);
            ctx.arcTo(45, 23, 38, 23, 50);
            ctx.closePath();
            ctx.strokeStyle = "#101010";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = "#303030";
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(52, 12);
            ctx.lineTo(52, 20);
            ctx.lineWidth = 1;
            ctx.stroke();
            c.cacheImage("td_tower_aEFw_cannon");
            CannonTurret.image = c.image;
            resolve();
        }));
    }
}
CannonTurret.turretName = "Cannon Tower";
CannonTurret.turretDescription = "Fires explosives, possibly hitting multiple enemies at once";
class EarthTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
    }
    get range() { return 128 + this.type.earth * 16; }
    step(time) {
        super.step(time);
        if (this.ready) {
            let enemy = this.game.findNearestEnemy(this.center, this.range);
            if (enemy) {
                this.game.spawnProjectile(new EarthProjectile(this.game, this.center, enemy, this.type.earth));
                this.cooldown = 0.5;
            }
        }
    }
    render(ctx) {
        super.render(ctx);
        ctx.drawImage(EarthTurret.images, 0, this.type.earth * 48 - 48, 48, 48, this.tile.pos.x + 8, this.tile.pos.y + 8, 48, 48);
    }
    static renderPreview(ctx, x, y, type) {
        ctx.drawImage(EarthTurret.images, 0, type.earth * 48 - 48, 48, 48, x + 8, y + 8, 48, 48);
    }
    addType(type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new ArcherTurret(this.tile, this.type.with(type));
                break;
            case TurretElement.Earth:
                this.type.add(type);
                break;
            case TurretElement.Fire:
                this.tile.turret = new CannonTurret(this.tile, this.type.with(type));
                break;
            case TurretElement.Water:
                this.tile.turret = new AcidTurret(this.tile, this.type.with(type));
                break;
        }
    }
    static getInfo(type) {
        return new TurretInfo(EarthTurret.turretName, type.earth > 2 ? EarthTurret.turretDescription2 : EarthTurret.turretDescription1, 112 + type.earth * 16, `${15 + type.earth * 5}`);
    }
    getCurrentInfo() { return EarthTurret.getInfo(this.type); }
    getInfoAfterUpgrade(type) {
        if (this.type.count >= 4) {
            return undefined;
        }
        switch (type) {
            case TurretElement.Air: return ArcherTurret.getInfo(this.type.with(type));
            case TurretElement.Earth: return EarthTurret.getInfo(this.type.with(type));
            case TurretElement.Fire: return CannonTurret.getInfo(this.type.with(type));
            case TurretElement.Water: return AcidTurret.getInfo(this.type.with(type));
        }
    }
    renderPreviewAfterUpgrade(ctx, x, y, type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                ArcherTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Earth:
                EarthTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Fire:
                CannonTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Water:
                AcidTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
        }
    }
    static init() {
        return Utils.getImageFromCache("td_tower_aEfw_earth").then(tex => { EarthTurret.images = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(48, 192);
            EarthTurret.preRender1(c.ctx, 0);
            EarthTurret.preRender2(c.ctx, 48);
            EarthTurret.preRender3(c.ctx, 96);
            EarthTurret.preRender4(c.ctx, 144);
            c.cacheImage("td_tower_aEfw_earth");
            EarthTurret.images = c.image;
            resolve();
        }));
    }
    static preRender1(ctx, y) {
        let renderable = new RenderablePathSet();
        let path;
        let grad;
        let corners = [{ x: 14, y: 14 }, { x: 34, y: 14 }, { x: 14, y: 34 }, { x: 34, y: 34 }];
        for (const corner of corners) {
            path = new Path2D();
            path.arc(corner.x, y + corner.y, 10, 0, Angle.deg360);
            grad = ctx.createRadialGradient(corner.x, y + corner.y, 5, corner.x, y + corner.y, 10);
            grad.addColorStop(0, "#90d173");
            grad.addColorStop(1, "#6ba370");
            renderable.pushNew(path, grad);
        }
        renderable.pushPolygon([12, 16, 16, 12, 36, 32, 32, 36], "#90d173", 0, y);
        renderable.pushPolygon([36, 16, 32, 12, 12, 32, 16, 36], "#90d173", 0, y);
        path = new Path2D();
        path.arc(24, y + 24, 6, 0, Angle.deg360);
        grad = ctx.createRadialGradient(24, y + 24, 2, 24, y + 24, 6);
        grad.addColorStop(0, "#beefa7");
        grad.addColorStop(1, "#90d173");
        renderable.pushNew(path, grad);
        renderable.render(ctx);
    }
    static preRender2(ctx, y) {
        let renderable = new RenderablePathSet();
        let path;
        let grad;
        let corners = [{ x: 13, y: 13 }, { x: 35, y: 13 }, { x: 13, y: 35 }, { x: 35, y: 35 }];
        for (const corner of corners) {
            path = new Path2D();
            path.arc(corner.x, y + corner.y, 10, 0, Angle.deg360);
            grad = ctx.createRadialGradient(corner.x, y + corner.y, 5, corner.x, y + corner.y, 10);
            grad.addColorStop(0, "#6fd243");
            grad.addColorStop(1, "#54a45b");
            renderable.pushNew(path, grad);
        }
        renderable.pushPolygon([12, 16, 16, 12, 36, 32, 32, 36], "#6fd243", 0, y);
        renderable.pushPolygon([36, 16, 32, 12, 12, 32, 16, 36], "#6fd243", 0, y);
        path = new Path2D();
        path.arc(24, y + 24, 6, 0, Angle.deg360);
        grad = ctx.createRadialGradient(24, y + 24, 2, 24, y + 24, 6);
        grad.addColorStop(0, "#a6f083");
        grad.addColorStop(1, "#6fd243");
        renderable.pushNew(path, grad);
        renderable.render(ctx);
    }
    static preRender3(ctx, y) {
        let renderable = new RenderablePathSet();
        let path;
        let grad;
        let corners = [{ x: 12, y: 12 }, { x: 36, y: 12 }, { x: 12, y: 36 }, { x: 36, y: 36 }];
        for (const corner of corners) {
            path = new Path2D();
            path.arc(corner.x, y + corner.y, 11, 0, Angle.deg360);
            grad = ctx.createRadialGradient(corner.x, y + corner.y, 5, corner.x, y + corner.y, 10);
            grad.addColorStop(0, "#4ed314");
            grad.addColorStop(1, "#3da547");
            renderable.pushNew(path, grad);
        }
        renderable.pushPolygon([11, 17, 17, 11, 37, 31, 31, 37], "#4ed314", 0, y);
        renderable.pushPolygon([37, 17, 31, 11, 11, 31, 17, 37], "#4ed314", 0, y);
        path = new Path2D();
        path.arc(24, y + 24, 8, 0, Angle.deg360);
        grad = ctx.createRadialGradient(24, y + 24, 3, 24, y + 24, 8);
        grad.addColorStop(0, "#8ef260");
        grad.addColorStop(1, "#4ed314");
        renderable.pushNew(path, grad);
        renderable.render(ctx);
    }
    static preRender4(ctx, y) {
        let grad;
        let tex1 = new CamouflageTextureGenerator(48, 48, "#825D30", "#308236", 0.5);
        let tex2 = new CamouflageTextureGenerator(48, 48, "#92A33C", "#4ED314", 0.5);
        let src = RgbaColor.transparent.source();
        let corners = [{ x: 12, y: 12 }, { x: 36, y: 12 }, { x: 12, y: 36 }, { x: 36, y: 36 }];
        for (const corner of corners) {
            grad = new RadialGradientSource(48, 48, corner.x, corner.y, 12, 6);
            grad.addColorStop(0, "#825D3000");
            grad.addColorStop(0.2, tex1);
            grad.addColorStop(1, tex2);
            src = new CircleSource(48, 48, corner.x, corner.y, 12.5, grad, src);
        }
        let path = new Path2D;
        path.moveTo(10, 18);
        path.lineTo(18, 10);
        path.lineTo(38, 30);
        path.lineTo(30, 38);
        path.closePath();
        path.moveTo(38, 18);
        path.lineTo(30, 10);
        path.lineTo(10, 30);
        path.lineTo(18, 38);
        path.closePath();
        src = new PathSource(48, 48, path, tex2, src);
        grad = new RadialGradientSource(48, 48, 24, 24, 10, 4);
        grad.addColorStop(0, tex2);
        grad.addColorStop(1, "#B6FF00");
        new CircleSource(48, 48, 24, 24, 10.5, grad, src).generateInto(ctx, 0, y);
    }
}
EarthTurret.turretName = "Earth Tower";
EarthTurret.turretDescription1 = "High damage but low accuracy";
EarthTurret.turretDescription2 = "High damage but low accuracy, can stun enemies";
class EarthquakeTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.frame = Rand.r(0, EarthquakeTurret.totalFrameCount);
    }
    get range() { return 88 + this.type.count * 24; }
    get ready() {
        if (!super.ready) {
            return false;
        }
        else if (this.type.count == 4) {
            return this.frame % EarthquakeTurret.baseFrameCount < 3;
        }
        else {
            return this.frame % EarthquakeTurret.halfFrameCount < 3;
        }
    }
    step(time) {
        super.step(time);
        this.frame = (this.frame + time * 25) % EarthquakeTurret.totalFrameCount;
        if (this.ready) {
            for (const enemy of this.game.findEnemiesInRange(this.center, this.range)) {
                enemy.dealDamage(Rand.r(this.type.count === 4 ? 15 : 20));
                enemy.addEffect(new StunEffect(0.2));
            }
            this.cooldown = 0.25;
        }
    }
    render(ctx) {
        super.render(ctx);
        let a, b;
        if (this.type.count == 3) {
            a = Math.floor(this.frame / EarthquakeTurret.halfFrameCount);
            b = Math.floor(this.frame % EarthquakeTurret.halfFrameCount);
        }
        else {
            a = Math.floor(this.frame / EarthquakeTurret.baseFrameCount);
            b = Math.floor(this.frame % EarthquakeTurret.baseFrameCount) * 2;
        }
        ctx.drawImage(EarthquakeTurret.images, a * 48, 0, 48, 48, this.tile.pos.x + 8, this.tile.pos.y + 8, 48, 48);
        ctx.drawImage(EarthquakeTurret.images, 192 + b * 48, 0, 48, 48, this.tile.pos.x + 8, this.tile.pos.y + 8, 48, 48);
    }
    static renderPreview(ctx, x, y, type) {
        ctx.drawImage(EarthquakeTurret.images, 0, 0, 48, 48, x + 8, y + 8, 48, 48);
        ctx.drawImage(EarthquakeTurret.images, 192, 0, 48, 48, x + 8, y + 8, 48, 48);
    }
    addType(type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new ArcaneTurret(this.tile, this.type.with(type));
                break;
            case TurretElement.Earth:
            case TurretElement.Fire:
            case TurretElement.Water:
                this.type.add(type);
                break;
        }
    }
    static getInfo(type) {
        return new TurretInfo(EarthquakeTurret.turretName, EarthquakeTurret.turretDescription, 88 + type.count * 24, `${type.count * 10 - 10}`);
    }
    getCurrentInfo() { return EarthquakeTurret.getInfo(this.type); }
    getInfoAfterUpgrade(type) {
        if (this.type.count >= 4) {
            return undefined;
        }
        switch (type) {
            case TurretElement.Air: return ArcaneTurret.getInfo(this.type.with(type));
            case TurretElement.Earth: return EarthquakeTurret.getInfo(this.type.with(type));
            case TurretElement.Fire: return EarthquakeTurret.getInfo(this.type.with(type));
            case TurretElement.Water: return EarthquakeTurret.getInfo(this.type.with(type));
        }
    }
    renderPreviewAfterUpgrade(ctx, x, y, type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                ArcaneTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Earth:
                EarthquakeTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Fire:
                EarthquakeTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Water:
                EarthquakeTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
        }
    }
    static init() {
        return Utils.getImageFromCache("td_tower_aEFW_earthquake_strip" + (EarthquakeTurret.halfFrameCount + 4)).then(tex => { EarthquakeTurret.images = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(192 + EarthquakeTurret.halfFrameCount * 48, 48);
            let ctx = c.ctx;
            for (let i = 0; i < 4; ++i) {
                let cel = new CellularTextureGenerator(48, 48, Rand.i(32, 128), "#808080", new PerlinNoiseTextureGenerator(48, 48, RgbaColor.black, "#808080", 0.75), CellularTextureType.Cells, CellularTextureDistanceMetric.Manhattan, Curve.sqr);
                cel = new CellularTextureGenerator(48, 48, Rand.i(32, 128), cel, new PerlinNoiseTextureGenerator(48, 48, RgbaColor.black, "#808080", 0.75), CellularTextureType.Cells, CellularTextureDistanceMetric.Chebyshev, Curve.sqr);
                cel.generateInto(ctx, i * 48, 0);
            }
            for (let i = 0; i < EarthquakeTurret.halfFrameCount; ++i) {
                ctx.fillStyle = "#808080" + Utils.byteToHex(Math.floor(i / EarthquakeTurret.halfFrameCount * 256));
                ctx.fillRect(192 + i * 48, 0, 48, 48);
                let grad = ctx.createRadialGradient(0, 0, 4, 0, 0, 12);
                let b = i / EarthquakeTurret.halfFrameCount;
                grad.addColorStop(0.4, RgbaColor.fromHex("#E8E144").lerp(RgbaColor.fromHex("#E86544").lerp(RgbaColor.fromHex("#808080"), b), Curve.arc(b)).toCss());
                grad.addColorStop(0.5, "#606060");
                grad.addColorStop(1, "#000000");
                ctx.fillStyle = grad;
                ctx.translate(216 + 48 * i, 24);
                ctx.rotate(b * Angle.deg90);
                EarthquakeTurret.path(ctx);
                ctx.fill();
                ctx.resetTransform();
            }
            c.cacheImage("td_tower_aEFW_earthquake_strip" + (EarthquakeTurret.halfFrameCount + 4));
            EarthquakeTurret.images = c.image;
            resolve();
        }));
    }
    static path(ctx) {
        ctx.beginPath();
        ctx.moveTo(12, -12);
        ctx.lineTo(Vec2.ldx(8, -Angle.deg30), Vec2.ldy(8, -Angle.deg30));
        ctx.arc(0, 0, 8, -Angle.deg30, Angle.deg30);
        ctx.lineTo(12, 12);
        ctx.lineTo(Vec2.ldx(8, Angle.deg60), Vec2.ldy(8, Angle.deg60));
        ctx.arc(0, 0, 8, Angle.deg60, Angle.deg120);
        ctx.lineTo(-12, 12);
        ctx.lineTo(Vec2.ldx(8, Angle.deg150), Vec2.ldy(8, Angle.deg150));
        ctx.arc(0, 0, 8, Angle.deg150, Angle.deg210);
        ctx.lineTo(-12, -12);
        ctx.lineTo(Vec2.ldx(8, Angle.deg240), Vec2.ldy(8, Angle.deg240));
        ctx.arc(0, 0, 8, Angle.deg240, Angle.deg300);
        ctx.closePath();
    }
}
EarthquakeTurret.baseFrameCount = 12;
EarthquakeTurret.halfFrameCount = 24;
EarthquakeTurret.totalFrameCount = 48;
EarthquakeTurret.turretName = "Earthquake Tower";
EarthquakeTurret.turretDescription = "Periodically damages and stuns all enemies in range";
class FireTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.angle = Angle.rand();
        this.smokeTimer = Rand.i(0.5, 4);
    }
    get range() { return 96 + this.type.fire * 16; }
    spawnSmoke() {
        let x;
        let y;
        let r = 5 + this.type.fire;
        do {
            x = Rand.r(r * 2) - r;
            y = Rand.r(r * 2) - r;
        } while (x * x + y * y > 100);
        this.smokeTimer = Rand.i(0.5, 6 - this.type.fire);
        this.game.spawnParticle(new SmokeParticle(this.center.x + x, this.center.y + y, 0));
    }
    step(time) {
        super.step(time);
        this.smokeTimer -= time;
        if (this.smokeTimer <= 0) {
            this.spawnSmoke();
        }
        if (this.ready) {
            let enemies = this.game.findEnemiesInRange(this.center, this.range);
            let enemy = null;
            let bestDistance = Infinity;
            let bestDuration = Infinity;
            for (const e of enemies) {
                let effect = e.getEffect(eff => eff instanceof BurningEffect);
                let distance = this.center.distanceTo(e.pos);
                let duration = effect ? effect.duration : 0;
                if (duration < bestDuration) {
                    enemy = e;
                    bestDistance = distance;
                    bestDuration = duration;
                }
                else if (duration == bestDuration && distance < bestDistance) {
                    enemy = e;
                    bestDistance = distance;
                    bestDuration = duration;
                }
            }
            if (enemy) {
                this.game.spawnProjectile(new FireProjectile(this.game, this.center, enemy, 9 / this.type.fire + 6, this.type.fire / 2 + 1, this.range));
                this.cooldown = 1.5 / this.type.count;
            }
        }
    }
    render(ctx) {
        super.render(ctx);
        let r = 16 + 2 * this.type.fire;
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.drawImage(FireTurret.image, -r, -r, r * 2, r * 2);
        ctx.resetTransform();
    }
    static renderPreview(ctx, x, y, type) {
        let r = 16 + 2 * type.fire;
        ctx.drawImage(FireTurret.image, x + 32 - r, y + 32 - r, r * 2, r * 2);
    }
    addType(type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new LightningTurret(this.tile, this.type.with(type));
                break;
            case TurretElement.Earth:
                this.tile.turret = new CannonTurret(this.tile, this.type.with(type));
                break;
            case TurretElement.Fire:
                this.type.add(type);
                break;
            case TurretElement.Water:
                this.tile.turret = new FlamethrowerTurret(this.tile, this.type.with(type));
                break;
        }
    }
    static getInfo(type) {
        return new TurretInfo(FireTurret.turretName, type.fire > 2 ? FireTurret.turretDescription2 : FireTurret.turretDescription1, 96 + type.fire * 16, `${6 + type.fire * 4} + burning`);
    }
    getCurrentInfo() { return FireTurret.getInfo(this.type); }
    getInfoAfterUpgrade(type) {
        if (this.type.count >= 4) {
            return undefined;
        }
        switch (type) {
            case TurretElement.Air: return LightningTurret.getInfo(this.type.with(type));
            case TurretElement.Earth: return CannonTurret.getInfo(this.type.with(type));
            case TurretElement.Fire: return FireTurret.getInfo(this.type.with(type));
            case TurretElement.Water: return FlamethrowerTurret.getInfo(this.type.with(type));
        }
    }
    renderPreviewAfterUpgrade(ctx, x, y, type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                LightningTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Earth:
                CannonTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Fire:
                FireTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Water:
                FlamethrowerTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
        }
    }
    static init() {
        return Utils.getImageFromCache("td_tower_aeFw_fire").then(tex => { FireTurret.image = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(48, 48);
            let texLava = new CellularTextureGenerator(48, 48, 36, "#FF5020", "#C00000", CellularTextureType.Balls);
            let texRock = new CellularTextureGenerator(48, 48, 144, "#662D22", "#44150D", CellularTextureType.Balls);
            let renderable = new RenderablePathSet();
            let path = new Path2D();
            for (let k = 0; k < 36; ++k) {
                let radius = 20 + Rand.r(4);
                let a = k * Angle.deg10;
                if (k === 0) {
                    path.moveTo(Vec2.ldx(radius, a, 24), Vec2.ldy(radius, a, 24));
                }
                else {
                    path.lineTo(Vec2.ldx(radius, a, 24), Vec2.ldy(radius, a, 24));
                }
            }
            path.closePath();
            renderable.pushNew(path, c.ctx.createPattern(texRock.generateImage(), "no-repeat"));
            let grad = c.ctx.createRadialGradient(24, 24, 24, 24, 24, 10);
            grad.addColorStop(0, "#300000");
            grad.addColorStop(1, "#30000000");
            renderable.pushNew(path, grad);
            path = new Path2D();
            for (let k = 0; k < 18; ++k) {
                let radius = 9 + Rand.r(2);
                let a = k * Angle.deg20;
                if (k === 0) {
                    path.moveTo(Vec2.ldx(radius, a, 24), Vec2.ldy(radius, a, 24));
                }
                else {
                    path.lineTo(Vec2.ldx(radius, a, 24), Vec2.ldy(radius, a, 24));
                }
            }
            path.closePath();
            renderable.pushNew(path, c.ctx.createPattern(texLava.generateImage(), "no-repeat"));
            renderable.render(c.ctx);
            c.cacheImage("td_tower_aeFw_fire");
            FireTurret.image = c.image;
            resolve();
        }));
    }
}
FireTurret.turretName = "Fire Tower";
FireTurret.turretDescription1 = "Can set enemies on fire";
FireTurret.turretDescription2 = "Sets enemies on fire";
class FlamethrowerTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
    }
    step(time) {
        super.step(time);
    }
    render(ctx) {
        super.render(ctx);
        ctx.drawImage(FlamethrowerTurret.image, this.tile.pos.x, this.tile.pos.y);
    }
    static renderPreview(ctx, x, y, type) {
        ctx.drawImage(FlamethrowerTurret.image, x, y);
    }
    addType(type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new PlasmaTurret(this.tile, this.type.with(type));
                break;
            case TurretElement.Earth:
                this.tile.turret = new EarthquakeTurret(this.tile, this.type.with(type));
                break;
            case TurretElement.Fire:
            case TurretElement.Water:
                this.type.add(type);
                break;
        }
    }
    static init() {
        return Utils.getImageFromCache("td_tower_aeFW_flamethrower").then(tex => { FlamethrowerTurret.image = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(64, 64);
            c.cacheImage("td_tower_aeFW_flamethrower");
            FlamethrowerTurret.image = c.image;
            resolve();
        }));
    }
}
class IceTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.angle = Angle.rand();
    }
    get range() { return 112 + this.type.air * 32 + this.type.water * 16; }
    step(time) {
        super.step(time);
        for (const enemy of this.game.findEnemiesInRange(this.center, this.range)) {
            enemy.dealDamage((4 + this.type.count * 3) * time);
            enemy.addEffect(new FreezeEffect(this.type.count / 4, this.type.air * 0.5 + this.type.water - 0.5));
        }
    }
    render(ctx) {
        super.render(ctx);
        let r = 24 + 2 * this.type.count;
        let i = Utils.sign(this.type.water - this.type.air) + 1;
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.drawImage(IceTurret.images, 0, i * 64, 64, 64, -r, -r, r * 2, r * 2);
        ctx.resetTransform();
    }
    static renderPreview(ctx, x, y, type) {
        let r = 24 + 2 * type.count;
        let i = Utils.sign(type.water - type.air) + 1;
        ctx.drawImage(IceTurret.images, 0, i * 64, 64, 64, x + 32 - r, y + 32 - r, r * 2, r * 2);
    }
    addType(type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Earth:
                this.tile.turret = new MoonTurret(this.tile, this.type.with(type));
                break;
            case TurretElement.Fire:
                this.tile.turret = new PlasmaTurret(this.tile, this.type.with(type));
                break;
            case TurretElement.Air:
            case TurretElement.Water:
                this.type.add(type);
                break;
        }
    }
    static getInfo(type) {
        return new TurretInfo(IceTurret.turretName, IceTurret.turretDescription, 112 + type.air * 32 + type.water * 16, `${4 + type.count * 3}`);
    }
    getCurrentInfo() { return IceTurret.getInfo(this.type); }
    getInfoAfterUpgrade(type) {
        if (this.type.count >= 4) {
            return undefined;
        }
        switch (type) {
            case TurretElement.Air: return IceTurret.getInfo(this.type.with(type));
            case TurretElement.Earth: return MoonTurret.getInfo(this.type.with(type));
            case TurretElement.Fire: return PlasmaTurret.getInfo(this.type.with(type));
            case TurretElement.Water: return IceTurret.getInfo(this.type.with(type));
        }
    }
    renderPreviewAfterUpgrade(ctx, x, y, type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                IceTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Earth:
                MoonTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Fire:
                PlasmaTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Water:
                IceTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
        }
    }
    static init() {
        return Utils.getImageFromCache("td_tower_AefW_ice").then(tex => { IceTurret.images = tex; }, () => new Promise(resolve => {
            let tex = new CellularTextureGenerator(64, 64, 64, "#D1EFFF", "#70BECC", CellularTextureType.Cells);
            let c = new PreRenderedImage(64, 192);
            let c2 = new PreRenderedImage(64, 64);
            let fill = c2.ctx.createPattern(tex.generateImage(), "repeat");
            IceTurret.preRender(c2.ctx, 0, fill, true);
            c.ctx.drawImage(c2.image, 0, 0);
            c.ctx.drawImage(c2.image, 0, 64);
            c.ctx.drawImage(c2.image, 0, 128);
            IceTurret.preRender(c.ctx, 0, "#FFFFFF80");
            IceTurret.preRender(c.ctx, 128, "#51AFCC60");
            c.cacheImage("td_tower_AefW_ice");
            IceTurret.images = c.image;
            resolve();
        }));
    }
    static mkBranch(ctx, x, y, angle, size) {
        if (size >= 2.5) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            let x2 = Vec2.ldx(8, angle, x);
            let y2 = Vec2.ldy(8, angle, y);
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
            let x2 = Vec2.ldx(6, angle, x);
            let y2 = Vec2.ldy(6, angle, y);
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
            let x2 = Vec2.ldx(4, angle, x);
            let y2 = Vec2.ldy(4, angle, y);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
    static preRender(ctx, baseY, fill, drawCenter = false) {
        ctx.save();
        ctx.lineCap = "round";
        ctx.strokeStyle = fill;
        let centerPath = new Path2D();
        for (let k = 0; k < 6; ++k) {
            let a = k * Angle.deg60;
            if (k === 0) {
                centerPath.moveTo(Vec2.ldx(8, a, 32), baseY + Vec2.ldy(8, a, 32));
            }
            else {
                centerPath.lineTo(Vec2.ldx(8, a, 32), baseY + Vec2.ldy(8, a, 32));
            }
            IceTurret.mkBranch(ctx, Vec2.ldx(8, a, 32), baseY + Vec2.ldy(8, a, 32), a, 3);
        }
        centerPath.closePath();
        ctx.restore();
        ctx.fillStyle = fill;
        ctx.fill(centerPath);
        if (drawCenter) {
            let grad = ctx.createRadialGradient(32, baseY + 32, 0, 32, baseY + 32, 6);
            grad.addColorStop(0, "#FFFFFF");
            grad.addColorStop(1, "#D1EFFF00");
            ctx.fillStyle = grad;
            ctx.fill(centerPath);
        }
    }
}
IceTurret.turretName = "Frost Tower";
IceTurret.turretDescription = "Freezes all enemies in range, causing them to take damage and slow down";
class LightningTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.angle = Angle.rand();
        this.animationTimer = 0;
    }
    get ready() { return this.animationTimer < 0.3 && this.cooldown <= 0; }
    get range() { return 96 + this.type.air * 24 + this.type.fire * 8; }
    castLightning(a, b, baseLife) {
        let v = b.sub(a);
        let vlength = v.length;
        v = v.normalize();
        let stepCount = Math.ceil(vlength / 8);
        let step = vlength / stepCount;
        let n = v.normal();
        let d = v.mul(step).add(n.mul(Rand.r(-6, 6))).add(a);
        this.game.spawnParticle(new LineParticle(a.x, a.y, d.x, d.y, baseLife, "#AFE8FF", 2));
        baseLife += 0.02;
        for (var i = 2; i < stepCount; ++i) {
            let nd = v.mul(step * i).add(n.mul(Rand.r(-6, 6))).add(a);
            this.game.spawnParticle(new LineParticle(d.x, d.y, nd.x, nd.y, baseLife, "#AFE8FF", 2));
            baseLife += 0.02;
            d = nd;
        }
        this.game.spawnParticle(new LineParticle(d.x, d.y, b.x, b.y, baseLife, "#AFE8FF", 2));
        return baseLife + 0.02;
    }
    step(time) {
        time *= (this.type.count - 1) * 0.5;
        if (this.cooldown > 0) {
            this.cooldown = Math.max(0, this.cooldown - time);
        }
        this.animationTimer = (this.animationTimer + time) % 1;
        if (this.ready) {
            let enemies = this.game.findEnemiesInRange(this.center, this.range);
            if (enemies.length == 0) {
                return;
            }
            let basePartLife = 0.5;
            let hitEnemies = [];
            let prev = this.center;
            let maxDist = this.range;
            let damage = (this.type.air * 6 + this.type.fire * 10) / ((this.type.count - 1) * 0.5);
            for (let i = 0;; ++i) {
                let e = Rand.item(enemies);
                if (hitEnemies.indexOf(e) >= 0 || e.pos.distanceTo(prev) > maxDist) {
                    break;
                }
                e.dealDamage(damage);
                basePartLife = this.castLightning(prev, e.pos, basePartLife);
                hitEnemies.push(e);
                prev = e.pos;
                maxDist *= 0.9;
                damage *= 0.9;
            }
            this.cooldown = 0.6;
        }
    }
    render(ctx) {
        super.render(ctx);
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle - Math.floor(this.animationTimer * 8) * Angle.deg45);
        ctx.drawImage(LightningTurret.image, -24, -24);
        ctx.resetTransform();
    }
    static renderPreview(ctx, x, y, type) {
        ctx.drawImage(LightningTurret.image, x + 8, y + 8);
    }
    addType(type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
            case TurretElement.Fire:
                this.type.add(type);
                break;
            case TurretElement.Earth:
                this.tile.turret = new SunTurret(this.tile, this.type.with(type));
                break;
            case TurretElement.Water:
                this.tile.turret = new PlasmaTurret(this.tile, this.type.with(type));
                break;
        }
    }
    static getInfo(type) {
        return new TurretInfo(LightningTurret.turretName, LightningTurret.turretDescription, 96 + type.air * 24 + type.fire * 8, `${type.air * 6 + type.fire * 10}`);
    }
    getCurrentInfo() { return LightningTurret.getInfo(this.type); }
    getInfoAfterUpgrade(type) {
        if (this.type.count >= 4) {
            return undefined;
        }
        switch (type) {
            case TurretElement.Air: return LightningTurret.getInfo(this.type.with(type));
            case TurretElement.Earth: return SunTurret.getInfo(this.type.with(type));
            case TurretElement.Fire: return LightningTurret.getInfo(this.type.with(type));
            case TurretElement.Water: return PlasmaTurret.getInfo(this.type.with(type));
        }
    }
    renderPreviewAfterUpgrade(ctx, x, y, type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                LightningTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Earth:
                SunTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Fire:
                LightningTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Water:
                PlasmaTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
        }
    }
    static init() {
        return Utils.getImageFromCache("td_tower_AeFw_lightning")
            .then(tex => { LightningTurret.image = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(48, 48);
            let ctx = c.ctx;
            let grad = ctx.createRadialGradient(24, 24, 0, 24, 24, 18);
            grad.addColorStop(0, "#FFFFFF");
            grad.addColorStop(0.33, "#A97FFF");
            grad.addColorStop(1, "#D6BFFF");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(42, 24);
            for (let i = 1; i < 16; ++i) {
                let r = i % 2 == 0 ? 21 : 7;
                let a = i * Angle.deg45 / 2;
                ctx.lineTo(Vec2.ldx(r, a, 24), Vec2.ldy(r, a, 24));
            }
            ctx.closePath();
            ctx.fill();
            grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 3);
            grad.addColorStop(0, "#F8F2FF");
            grad.addColorStop(1, "#C199FF");
            ctx.fillStyle = grad;
            let j = true;
            for (let i = 0; i < 8; ++i, j = !j) {
                let a = i * Angle.deg45;
                ctx.translate(Vec2.ldx(18, a, 24), Vec2.ldy(18, a, 24));
                if (j) {
                    ctx.rotate(Angle.deg45);
                }
                ctx.fillRect(-3, -3, 6, 6);
                ctx.resetTransform();
            }
            grad = ctx.createRadialGradient(42, 24, 0, 42, 24, 8);
            grad.addColorStop(0, "#FFFFFFC0");
            grad.addColorStop(1, "#F8F2FF00");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(42, 24, 8, 0, Angle.deg360);
            ctx.closePath();
            ctx.fill();
            c.cacheImage("td_tower_AeFw_lightning");
            LightningTurret.image = c.image;
            resolve();
        }));
    }
}
LightningTurret.turretName = "Lightning Tower";
LightningTurret.turretDescription = "Creates electric arcs that can jump between multiple enemies";
class MoonTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.frame = Rand.r(0, MoonTurret.frameCount);
        this.rays = [];
    }
    get range() { return this.type.count * 64 - 32; }
    step(time) {
        super.step(time);
        this.frame = (this.frame + time * 25) % MoonTurret.frameCount;
        this.rays.splice(0, this.rays.length);
        for (const e of this.game.findEnemiesInRange(this.center, this.range)) {
            let d = 1 - (this.center.distanceTo(e.pos) - 32) / (this.range - 32);
            e.dealDamage(time * (d * 20 + (this.type.count - 2) * 10));
            this.rays.push({ target: e.pos, color: "#FFFFFF" + Utils.byteToHex(d * 255) });
            e.addEffect(new FreezeEffect(0.2, 2));
        }
    }
    render(ctx) {
        super.render(ctx);
        ctx.lineWidth = 5;
        for (const r of this.rays) {
            ctx.strokeStyle = r.color;
            ctx.beginPath();
            ctx.moveTo(this.center.x, this.center.y);
            ctx.lineTo(r.target.x, r.target.y);
            ctx.stroke();
        }
        let r = 28 + 4 * (this.type.count - 3);
        ctx.drawImage(MoonTurret.images, Math.floor(this.frame) * 64, 0, 64, 64, this.center.x - r, this.center.y - r, r * 2, r * 2);
    }
    static renderPreview(ctx, x, y, type) {
        let r = 28 + 4 * (type.count - 3);
        ctx.drawImage(MoonTurret.images, 0, 0, 64, 64, x + 32 - r, y + 32 - r, r * 2, r * 2);
    }
    addType(type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
            case TurretElement.Earth:
            case TurretElement.Water:
                this.type.add(type);
                break;
            case TurretElement.Fire:
                this.tile.turret = new ArcaneTurret(this.tile, this.type.with(type));
                break;
        }
    }
    static getInfo(type) {
        return new TurretInfo(MoonTurret.turretName, MoonTurret.turretDescription, type.count * 64 - 32, type.count === 4 ? "20-40" : "10-30");
    }
    getCurrentInfo() { return MoonTurret.getInfo(this.type); }
    getInfoAfterUpgrade(type) {
        if (this.type.count >= 4) {
            return undefined;
        }
        switch (type) {
            case TurretElement.Air: return MoonTurret.getInfo(this.type.with(type));
            case TurretElement.Earth: return MoonTurret.getInfo(this.type.with(type));
            case TurretElement.Fire: return ArcaneTurret.getInfo(this.type.with(type));
            case TurretElement.Water: return MoonTurret.getInfo(this.type.with(type));
        }
    }
    renderPreviewAfterUpgrade(ctx, x, y, type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                MoonTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Earth:
                MoonTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Fire:
                ArcaneTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Water:
                MoonTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
        }
    }
    static init() {
        return Utils.getImageFromCache("td_tower_AEfW_moon_strip" + MoonTurret.frameCount).then(tex => { MoonTurret.images = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(MoonTurret.frameCount * 64, 64);
            let colorA = ColorSource.get("#E0E0E0");
            let colorB = ColorSource.get("#FFFFFF00");
            let s = new CellularTextureGenerator(64, 32, 49, "#A0A0A0", colorA, CellularTextureType.Balls);
            for (let i = 0; i < 3; ++i) {
                s = new CellularTextureGenerator(64, 32, 49, s, colorA, CellularTextureType.Cells);
            }
            s = new BufferedColorSource(64, 32, s);
            let p = new PerlinNoiseTextureGenerator(64, 64, "#FFFFFF00", "#FFFFFF80", 0.4);
            for (let i = 0; i < MoonTurret.frameCount; ++i) {
                let coef = i / MoonTurret.frameCount;
                let t1 = new TranslatingSource(64, 64, s, -64 * coef, 0);
                let ns = new ScalingSource(64, 64, t1, 0.5, 32, 32);
                let t2 = new TranslatingSource(64, 64, p, 64 * coef, 0);
                let grad = new RadialGradientSource(64, 64, 32, 32, 16, 32);
                grad.addColorStop(0, t2);
                grad.addColorStop(1, colorB);
                ns = new FisheyeSource(64, 64, ns, 0.5, 32, 32, 16);
                ns = new CircleSource(64, 64, 32, 32, 16, ns, grad);
                ns.generateInto(c.ctx, i * 64, 0);
            }
            c.cacheImage("td_tower_AEfW_moon_strip" + MoonTurret.frameCount);
            MoonTurret.images = c.image;
            resolve();
        }));
    }
}
MoonTurret.frameCount = 50;
MoonTurret.turretName = "Moon Tower";
MoonTurret.turretDescription = "Damages and slows down all enemies in range";
class PlasmaTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.frame = 0;
    }
    get range() { return 32 + this.type.air * 64 + this.type.water * 32 + this.type.fire * 32; }
    step(time) {
        super.step(time);
        this.frame = (this.frame + time * 25) % PlasmaTurret.frameCount;
        if (this.ready) {
            let enemies = this.game.findEnemiesInRange(this.center, this.range);
            if (enemies.length > 0) {
                let e = enemies[Rand.i(enemies.length)];
                e.dealDamage(this.type.count * 5 - 5 + Rand.r(10));
                if (Rand.chance(0.05 * this.type.water)) {
                    e.addEffect(new StunEffect(0.5));
                }
                if (Rand.chance(0.05 * this.type.fire)) {
                    e.addEffect(new BurningEffect(1));
                }
                this.game.spawnParticle(new PlasmaBeamParticle(this.center.x, this.center.y, e.x, e.y));
                this.cooldown = 0.2;
            }
        }
    }
    render(ctx) {
        super.render(ctx);
        ctx.drawImage(PlasmaTurret.images, Math.floor(this.frame) * 64, (this.type.count - 3) * 64, 64, 64, this.tile.pos.x, this.tile.pos.y, 64, 64);
    }
    static renderPreview(ctx, x, y, type) {
        ctx.drawImage(PlasmaTurret.images, 0, (type.count - 3) * 64, 64, 64, x, y, 64, 64);
    }
    addType(type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
            case TurretElement.Fire:
            case TurretElement.Water:
                this.type.add(type);
                break;
            case TurretElement.Earth:
                this.tile.turret = new ArcaneTurret(this.tile, this.type.with(type));
                break;
        }
    }
    static getInfo(type) {
        return new TurretInfo(PlasmaTurret.turretName, PlasmaTurret.turretDescription, 32 + type.air * 64 + type.water * 32 + type.fire * 32, `${type.count * 10}`);
    }
    getCurrentInfo() { return PlasmaTurret.getInfo(this.type); }
    getInfoAfterUpgrade(type) {
        if (this.type.count >= 4) {
            return undefined;
        }
        switch (type) {
            case TurretElement.Air: return PlasmaTurret.getInfo(this.type.with(type));
            case TurretElement.Earth: return ArcaneTurret.getInfo(this.type.with(type));
            case TurretElement.Fire: return PlasmaTurret.getInfo(this.type.with(type));
            case TurretElement.Water: return PlasmaTurret.getInfo(this.type.with(type));
        }
    }
    renderPreviewAfterUpgrade(ctx, x, y, type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                PlasmaTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Earth:
                ArcaneTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Fire:
                PlasmaTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Water:
                PlasmaTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
        }
    }
    static init() {
        return Utils.getImageFromCache("td_tower_AeFW_plasma_strip" + PlasmaTurret.frameCount).then(tex => { PlasmaTurret.images = tex; }, () => new Promise(resolve => {
            let background = "#552BA800";
            let color1 = new PerlinNoiseTextureGenerator(64, 64, "#4B007A00", "#FFFFFF", 0.5);
            let tex1a = new CirclesTextureGenerator(64, 64, "#A389FFC0", color1, background, 0.4, 2, 0.7);
            let tex1b = new CirclesTextureGenerator(64, 64, "#A389FFC0", color1, background, 0.28, 3, 0.7);
            let color2 = new PerlinNoiseTextureGenerator(64, 64, "#552BA840", "#AF84FF", 0.5);
            let back2 = new LerpingSource(64, 64, background, color2, 0.5);
            let tex2a = new CirclesTextureGenerator(64, 64, color2, back2, background, 0.4, 2, 0.1);
            let tex2b = new CirclesTextureGenerator(64, 64, color2, back2, background, 0.28, 3, 0.1);
            let c = new PreRenderedImage(64 * PlasmaTurret.frameCount, 128);
            PlasmaTurret.preRender(c.ctx, tex1a, tex2a, 0);
            PlasmaTurret.preRender(c.ctx, tex1b, tex2b, 64);
            c.cacheImage("td_tower_AeFW_plasma_strip" + PlasmaTurret.frameCount);
            PlasmaTurret.images = c.image;
            resolve();
        }));
    }
    static preRender(ctx, tex1, tex2, y) {
        let back = RgbaColor.transparent.source();
        for (let i = 0; i < PlasmaTurret.frameCount; ++i) {
            let a = i * Angle.deg360 / PlasmaTurret.frameCount;
            new CircleSource(64, 64, 32, 32, 32, new AddingSource(64, 64, new RotatingSource(64, 64, tex1, a, 32, 32), new RotatingSource(64, 64, tex2, -a, 32, 32)), back).generateInto(ctx, i * 64, y);
        }
    }
}
PlasmaTurret.frameCount = 65;
PlasmaTurret.turretName = "Plasma Tower";
PlasmaTurret.turretDescription = "Randomly hits enemies in range, occasionally burning or stunning them";
class SunTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.frame = Rand.r(0, SunTurret.frameCount);
        this.angle = Angle.rand();
        this.rays = [];
    }
    get range() { return this.type.count * 64 - 32; }
    step(time) {
        super.step(time);
        this.frame = (this.frame + time * 25) % SunTurret.frameCount;
        this.rays.splice(0, this.rays.length);
        for (const e of this.game.findEnemiesInRange(this.center, this.range)) {
            let d = 1 - (this.center.distanceTo(e.pos) - 32) / (this.range - 32);
            e.dealDamage(time * (d * 20 + (this.type.count - 2) * 10));
            this.rays.push({ target: e.pos, color: "#FFFF00" + Utils.byteToHex(d * 255) });
            e.addEffect(new BurningEffect(0.2));
        }
    }
    render(ctx) {
        super.render(ctx);
        ctx.lineWidth = 5;
        for (const r of this.rays) {
            ctx.strokeStyle = r.color;
            ctx.beginPath();
            ctx.moveTo(this.center.x, this.center.y);
            ctx.lineTo(r.target.x, r.target.y);
            ctx.stroke();
        }
        let r = 28 + 4 * (this.type.count - 3);
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.drawImage(SunTurret.image, -r, -r, r * 2, r * 2);
        ctx.rotate(this.frame / SunTurret.frameCount * Angle.deg30);
        ctx.drawImage(SunTurret.image, -r, -r, r * 2, r * 2);
        ctx.resetTransform();
    }
    static renderPreview(ctx, x, y, type) {
        let r = 28 + 4 * (type.count - 3);
        ctx.translate(x + 32, y + 32);
        ctx.drawImage(SunTurret.image, -r, -r, r * 2, r * 2);
        ctx.rotate(Angle.deg15);
        ctx.drawImage(SunTurret.image, -r, -r, r * 2, r * 2);
        ctx.resetTransform();
    }
    addType(type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
            case TurretElement.Earth:
            case TurretElement.Fire:
                this.type.add(type);
                break;
            case TurretElement.Water:
                this.tile.turret = new ArcaneTurret(this.tile, this.type.with(type));
                break;
        }
    }
    static getInfo(type) {
        return new TurretInfo(SunTurret.turretName, SunTurret.turretDescription, type.count * 64 - 32, type.count === 4 ? "20-40 + burning" : "10-30 + burning");
    }
    getCurrentInfo() { return SunTurret.getInfo(this.type); }
    getInfoAfterUpgrade(type) {
        if (this.type.count >= 4) {
            return undefined;
        }
        switch (type) {
            case TurretElement.Air: return SunTurret.getInfo(this.type.with(type));
            case TurretElement.Earth: return SunTurret.getInfo(this.type.with(type));
            case TurretElement.Fire: return SunTurret.getInfo(this.type.with(type));
            case TurretElement.Water: return ArcaneTurret.getInfo(this.type.with(type));
        }
    }
    renderPreviewAfterUpgrade(ctx, x, y, type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                SunTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Earth:
                SunTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Fire:
                SunTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Water:
                ArcaneTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
        }
    }
    static init() {
        return Utils.getImageFromCache("td_tower_AEFw_sun").then(tex => { SunTurret.image = tex; }, () => new Promise(resolve => {
            let c = new PreRenderedImage(64, 64);
            let ctx = c.ctx;
            let grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            grad.addColorStop(0.00000, "#FFFF40");
            grad.addColorStop(0.09375, "#FFFD3D");
            grad.addColorStop(0.18750, "#FFFA37");
            grad.addColorStop(0.28125, "#FFF42A");
            grad.addColorStop(0.37500, "#FFE000");
            grad.addColorStop(0.40625, "#FFFFC0");
            grad.addColorStop(1.00000, "#FFFFC000");
            ctx.fillStyle = grad;
            ctx.beginPath();
            for (let i = 0; i < 12; ++i) {
                let a0 = i * Angle.deg30;
                let a1 = a0 + Angle.deg10;
                let a2 = a0 + Angle.deg30;
                ctx.arc(32, 32, 32, a0, a1);
                ctx.lineTo(Vec2.ldx(12, a1, 32), Vec2.ldy(12, a1, 32));
                ctx.arc(32, 32, 12, a1, a2);
                ctx.lineTo(Vec2.ldx(32, a2, 32), Vec2.ldy(32, a2, 32));
            }
            ctx.fill();
            c.cacheImage("td_tower_AEFw_sun");
            SunTurret.image = c.image;
            resolve();
        }));
    }
}
SunTurret.frameCount = 90;
SunTurret.turretName = "Sun Tower";
SunTurret.turretDescription = "Damages and burns all enemies in range";
class TurretInfo {
    constructor(name, description, range, dps) {
        this.name = name;
        this.description = description;
        this.range = range;
        this.dps = dps;
    }
}
var TurretElement;
(function (TurretElement) {
    TurretElement[TurretElement["Air"] = 0] = "Air";
    TurretElement[TurretElement["Earth"] = 1] = "Earth";
    TurretElement[TurretElement["Fire"] = 2] = "Fire";
    TurretElement[TurretElement["Water"] = 3] = "Water";
})(TurretElement || (TurretElement = {}));
class TurretType {
    constructor(type) {
        this.type = type === undefined ? [0, 0, 0, 0] : type;
        this.c = 0;
        for (let i = 0; i < 4; ++i) {
            this.c += this.type[i];
        }
    }
    get air() { return this.type[TurretElement.Air]; }
    get earth() { return this.type[TurretElement.Earth]; }
    get fire() { return this.type[TurretElement.Fire]; }
    get water() { return this.type[TurretElement.Water]; }
    get count() { return this.c; }
    copy() { return new TurretType(this.type.slice()); }
    add(type) {
        ++this.type[type];
        ++this.c;
    }
    with(type) {
        let ntype = [];
        for (let e = TurretElement.Air; e <= TurretElement.Water; ++e) {
            ntype[e] = e === type ? this.type[e] + 1 : this.type[e];
        }
        return new TurretType(ntype);
    }
    contains(type) { return this.type[type] > 0; }
    toArray() {
        let arr = [];
        for (let i = 0; i < this.type[TurretElement.Air]; ++i) {
            arr.push(TurretElement.Air);
        }
        for (let i = 0; i < this.type[TurretElement.Earth]; ++i) {
            arr.push(TurretElement.Earth);
        }
        for (let i = 0; i < this.type[TurretElement.Fire]; ++i) {
            arr.push(TurretElement.Fire);
        }
        for (let i = 0; i < this.type[TurretElement.Water]; ++i) {
            arr.push(TurretElement.Water);
        }
        return arr;
    }
    toColorArray() {
        let arr = [];
        for (let e = TurretElement.Air; e <= TurretElement.Water; ++e) {
            for (let i = 0; i < this.type[e]; ++i) {
                arr.push(TurretType.getColor(e));
            }
        }
        return arr;
    }
    static getColor(type) {
        switch (type) {
            case TurretElement.Air:
                return "#d8d1ff";
            case TurretElement.Earth:
                return "#6dd13e";
            case TurretElement.Fire:
                return "#f7854c";
            case TurretElement.Water:
                return "#79b4f2";
            default:
                return "#000000";
        }
    }
}
class WaterTurret extends Turret {
    constructor(tile, type) {
        super(tile, type);
        this.angle = Angle.rand();
    }
    get range() { return 128 + this.type.water * 16; }
    step(time) {
        super.step(time);
        if (this.ready) {
            let enemy = Rand.item(this.game.findEnemiesInRange(this.center, this.range));
            if (enemy) {
                let pos = Vec2.randUnit3d().mul(this.type.water * 2 + 8).add(this.center);
                this.game.spawnProjectile(new WaterProjectile(this.game, pos, enemy, this.type.water, this.range));
                this.cooldown = 0.5 / this.type.count;
            }
        }
    }
    render(ctx) {
        super.render(ctx);
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle);
        ctx.drawImage(WaterTurret.images, 0, (this.type.count - 1) * 48, 48, 48, -24, -24, 48, 48);
        ctx.resetTransform();
    }
    static renderPreview(ctx, x, y, type) {
        ctx.drawImage(WaterTurret.images, 0, (type.count - 1) * 48, 48, 48, x + 8, y + 8, 48, 48);
    }
    addType(type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new IceTurret(this.tile, this.type.with(type));
                break;
            case TurretElement.Fire:
                this.tile.turret = new FlamethrowerTurret(this.tile, this.type.with(type));
                break;
            case TurretElement.Earth:
                this.tile.turret = new AcidTurret(this.tile, this.type.with(type));
                break;
            case TurretElement.Water:
                this.type.add(type);
                break;
        }
    }
    static getInfo(type) {
        return new TurretInfo(WaterTurret.turretName, WaterTurret.turretDescription[type.water > 1 ? 1 : 0], 112 + type.water * 16, `${4 + type.water * 4}`);
    }
    getCurrentInfo() { return WaterTurret.getInfo(this.type); }
    getInfoAfterUpgrade(type) {
        if (this.type.count >= 4) {
            return undefined;
        }
        switch (type) {
            case TurretElement.Air: return IceTurret.getInfo(this.type.with(type));
            case TurretElement.Earth: return AcidTurret.getInfo(this.type.with(type));
            case TurretElement.Fire: return FlamethrowerTurret.getInfo(this.type.with(type));
            case TurretElement.Water: return WaterTurret.getInfo(this.type.with(type));
        }
    }
    renderPreviewAfterUpgrade(ctx, x, y, type) {
        if (this.type.count >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                IceTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Earth:
                AcidTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Fire:
                FlamethrowerTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
            case TurretElement.Water:
                WaterTurret.renderPreview(ctx, x, y, this.type.with(type));
                break;
        }
    }
    static init() {
        return Utils.getImageFromCache("td_tower_aefW_water").then(tex => { WaterTurret.images = tex; }, () => new Promise(resolve => {
            let sandTex = new NoiseTextureGenerator(48, 48, "#F2EBC1", 0.08, 0, 1).generateImage();
            let groundTex = new NoiseTextureGenerator(48, 48, "#B9B5A0", 0.05, 0, 1).generateImage();
            let c = new PreRenderedImage(48, 192);
            c.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex), 1, 1, 46, 46);
            c.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex), -2, 46, 52, 52);
            c.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex), -5, 91, 58, 58);
            c.ctx.drawImage(WaterTurret.preRender(groundTex, sandTex), -8, 136);
            c.cacheImage("td_tower_aefW_water");
            WaterTurret.images = c.image;
            resolve();
        }));
    }
    static preRender(groundTex, sandTex) {
        let waterTex = new CellularTextureGenerator(64, 64, Rand.i(16, 36), "#3584CE", "#3EB4EF", CellularTextureType.Balls).generateImage();
        let textures = [groundTex, sandTex, waterTex];
        let pts = [[], [], []];
        for (let i = 0; i < 8; ++i) {
            let d2 = Rand.r(16, 20);
            let d1 = Rand.r(d2 + 2, 24);
            let d0 = Rand.r(d1, 24);
            let a = i * Angle.deg45;
            pts[0].push({ pt: Vec2.ld(d0, a, 32, 32), pt_b: Vec2.zero, pt_a: Vec2.zero });
            pts[1].push({ pt: Vec2.ld(d1, a, 32, 32), pt_b: Vec2.zero, pt_a: Vec2.zero });
            pts[2].push({ pt: Vec2.ld(d2, a, 32, 32), pt_b: Vec2.zero, pt_a: Vec2.zero });
        }
        for (let j = 0; j < 3; ++j) {
            let layer = pts[j];
            for (let i = 0; i < 8; ++i) {
                let ob = layer[(i + 7) % 8];
                let o = layer[i];
                let oa = layer[(i + 1) % 8];
                let angle = Angle.between(ob.pt.angleTo(o.pt), o.pt.angleTo(oa.pt));
                o.pt_a = Vec2.ld(5, angle, o.pt.x, o.pt.y);
                o.pt_b = Vec2.ld(5, angle + Angle.deg180, o.pt.x, o.pt.y);
            }
        }
        let c = new PreRenderedImage(64, 64);
        let ctx = c.ctx;
        for (let j = 0; j < 3; ++j) {
            let layer = pts[j];
            ctx.beginPath();
            ctx.moveTo(layer[0].pt.x, layer[0].pt.y);
            for (let i = 0; i < 8; ++i) {
                let o0 = layer[i];
                let o1 = layer[(i + 1) % 8];
                ctx.bezierCurveTo(o0.pt_a.x, o0.pt_a.y, o1.pt_b.x, o1.pt_b.y, o1.pt.x, o1.pt.y);
            }
            ctx.fillStyle = ctx.createPattern(textures[j], "repeat");
            ctx.fill();
        }
        return c.image;
    }
}
WaterTurret.turretName = "Water Tower";
WaterTurret.turretDescription = [
    "Slows down enemies",
    "Slows down enemies, can push them back"
];
class Angle {
    static deg(degrees) {
        return degrees * Angle.deg2rad;
    }
    static toDegrees(radians) {
        return radians * Angle.rad2deg;
    }
    static rand() {
        return Rand.r(Angle.deg360);
    }
    static wrap(angle) {
        return (angle < 0 ? (Angle.deg360 + angle % Angle.deg360) : angle) % Angle.deg360;
    }
    static difference(angle1, angle2) {
        angle1 = Angle.wrap(angle1);
        angle2 = Angle.wrap(angle2);
        let diff = Math.abs(angle2 - angle1);
        if (diff <= Angle.deg180) {
            return angle1 < angle2 ? diff : -diff;
        }
        else {
            diff = (Angle.deg360 - diff) % Angle.deg360;
            return angle1 < angle2 ? -diff : diff;
        }
    }
    static absDifference(angle1, angle2) {
        angle1 = Angle.wrap(angle1);
        angle2 = Angle.wrap(angle2);
        let diff = Math.abs(angle2 - angle1);
        if (diff <= Angle.deg180) {
            return diff;
        }
        else {
            return (Angle.deg360 - diff) % Angle.deg360;
        }
    }
    static rotateTo(currentAngle, targetAngle, maxRotation) {
        let diff = Angle.difference(currentAngle, targetAngle);
        if (Math.abs(diff) < maxRotation) {
            return targetAngle;
        }
        else
            return Angle.wrap(currentAngle + Math.sign(diff) * maxRotation);
    }
    static between(angle1, angle2) {
        angle1 = Angle.wrap(angle1);
        angle2 = Angle.wrap(angle2);
        let diff = Math.abs(angle2 - angle1);
        if (diff <= Angle.deg180) {
            return (angle1 + angle2) / 2;
        }
        else {
            return ((angle1 + angle2) / 2 + Angle.deg180) % Angle.deg360;
        }
    }
    static init() {
        return new Promise(resolve => {
            Angle.rad2deg = 180 / Math.PI;
            Angle.deg2rad = Math.PI / 180;
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
            resolve();
        });
    }
}
class Curve {
    static linear(x) { return x; }
    static arc(x) { return Math.sqrt(x * (2 - x)); }
    static invArc(x) { return 1 - Math.sqrt(1 - x * x); }
    static sqr(x) { return x * x; }
    static sqrt(x) { return Math.sqrt(x); }
    static sin(x) { return (1 - Math.cos(x * Math.PI)) * 0.5; }
}
class DijkstraNode {
    constructor(x, y, previous) {
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
}
class Metric {
    static euclideanDistance(dx, dy) {
        return Math.sqrt(dx * dx + dy * dy);
    }
    static manhattanDistance(dx, dy) {
        return Math.abs(dx) + Math.abs(dy);
    }
    static chebyshevDistance(dx, dy) {
        return Math.max(Math.abs(dx), Math.abs(dy));
    }
    static minkowskiDistance(dx, dy) {
        let d = Math.sqrt(Math.abs(dx)) + Math.sqrt(Math.abs(dy));
        return d * d;
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
class PreRenderedImage {
    constructor(width, height) {
        let canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        this.ctx = canvas.getContext("2d");
        this.image = canvas;
    }
    saveImage(fileName) {
        let a = document.createElement("a");
        a.setAttribute("download", fileName + ".png");
        a.setAttribute("href", this.image
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream"));
        a.setAttribute("target", "_blank");
        a.click();
    }
    cacheImage(id) {
        if (Game.saveImages) {
            this.saveImage(id);
            let element = document.createElement('a');
            element.setAttribute('download', id + ".txt");
            element.setAttribute('href', 'data:text/octet-stream;charset=utf-8,' + encodeURIComponent(this.toBase64()));
            element.click();
        }
        localStorage.setItem(id, this.toBase64());
    }
    toBase64() {
        return this.image
            .toDataURL("image/png")
            .replace(/^data:image\/png;base64,/, "");
    }
}
class Rand {
    static r(a, b) {
        if (a === undefined) {
            return Math.random();
        }
        else if (b === undefined) {
            return Math.random() * a;
        }
        else {
            if (b <= a) {
                return a;
            }
            return Math.random() * (b - a) + a;
        }
    }
    static i(a, b) {
        if (b === undefined) {
            return Math.floor(Math.random() * a);
        }
        else {
            if (b <= a) {
                return a;
            }
            return Math.floor(Math.random() * (b - a) + a);
        }
    }
    static item(items) {
        return items.length > 0 ? items[Math.floor(Math.random() * items.length)] : null;
    }
    static sign(num = 1) {
        return (Math.floor(Math.random() * 2) * 2 - 1) * num;
    }
    static chance(chance) {
        return Math.random() < chance;
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
class RenderablePathSet {
    constructor(paths) {
        this.paths = paths === undefined ? [] : paths;
    }
    push(path) {
        this.paths.push(path);
    }
    pushNew(path, fill) {
        if (fill === null) {
            return;
        }
        this.paths.push(new RenderablePath(path, fill));
    }
    pushPolygon(points, fill, originX = 0, originY = 0) {
        if (fill === null || points.length % 2 !== 0 || points.length < 6) {
            return;
        }
        let path = new Path2D();
        path.moveTo(originX + points[0], originY + points[1]);
        for (let i = 2; i < points.length; i += 2) {
            path.lineTo(originX + points[i], originY + points[i + 1]);
        }
        path.closePath();
        this.paths.push(new RenderablePath(path, fill));
    }
    render(ctx) {
        for (let i = 0; i < this.paths.length; ++i) {
            this.paths[i].render(ctx);
        }
    }
}
class Utils {
    static sign(value) {
        return value < 0 ? -1 : value > 0 ? 1 : 0;
    }
    static clamp(value, min, max) {
        return value > max ? max : value < min ? min : value;
    }
    static wrap(value, min, max) {
        value -= min;
        let range = max - min;
        if (value < 0) {
            value = range - (-value) % range;
        }
        return value % range + min;
    }
    static lerp(f1, f2, ammount) {
        if (ammount <= 0) {
            return f1;
        }
        else if (ammount >= 1) {
            return f2;
        }
        else {
            return f1 + ammount * (f2 - f1);
        }
    }
    static lerpInt(f1, f2, ammount) {
        if (ammount <= 0) {
            return Math.floor(f1);
        }
        else if (ammount >= 1) {
            return Math.floor(f2);
        }
        else {
            return Math.floor((1 - ammount) * Math.floor(f1) + ammount * (Math.floor(f2) + 0.9999));
        }
    }
    static interpolateSmooth(f1, f2, ammount) {
        if (ammount <= 0) {
            return f1;
        }
        else if (ammount >= 1) {
            return f2;
        }
        else {
            return f1 + (1 - Math.cos(ammount * Math.PI)) * 0.5 * (f2 - f1);
        }
    }
    static flatten(width, x, y) {
        return width * y + x;
    }
    static granulate(value, steps) {
        return Math.floor(value * steps) / steps + 1 / steps / 2;
    }
    static byteToHex(byte) {
        byte = Utils.clamp(byte, 0, 255);
        return Utils.hex[Math.floor(byte / 16)] + Utils.hex[Math.floor(byte % 16)];
    }
    static isString(obj) {
        return typeof obj === 'string' || obj instanceof String;
    }
    static getImageFromCache(id) {
        return new Promise((resolve, reject) => {
            let data = localStorage.getItem(id);
            if (data) {
                let img = new Image();
                img.onload = () => {
                    console.log(`Restored ${id} from cache`);
                    resolve(img);
                };
                img.src = "data:image/png;base64," + data;
            }
            else
                reject();
        });
    }
    static fillWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
        let words = text.split(/[ \t]+/);
        let lines = [];
        let currentLine = words[0];
        for (let i = 1; i < words.length; i++) {
            let word = words[i];
            let size = ctx.measureText(`${currentLine} ${word}`);
            if (size.width < maxWidth) {
                currentLine += " " + word;
            }
            else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        for (const line of lines) {
            ctx.fillText(line, x, y);
            y += lineHeight;
        }
    }
}
Utils.hex = "0123456789abcdef";
class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    get length() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    get sqrLength() { return this.x * this.x + this.y * this.y; }
    add(v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }
    addu(x, y) {
        return new Vec2(this.x + x, this.y + y);
    }
    addld(distance, direction) {
        return Vec2.ld(distance, direction, this.x, this.y);
    }
    sub(v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    }
    subu(x, y) {
        return new Vec2(this.x - x, this.y - y);
    }
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    dotu(x, y) {
        return this.x * x + this.y * y;
    }
    mul(f) {
        return new Vec2(this.x * f, this.y * f);
    }
    lerp(v, ammount) {
        if (ammount <= 0) {
            return this;
        }
        else if (ammount >= 1) {
            return v;
        }
        else {
            return new Vec2(this.x + (v.x - this.x) * ammount, this.y + (v.y - this.y) * ammount);
        }
    }
    angleTo(v) {
        return Math.atan2(v.y - this.y, v.x - this.x);
    }
    rotate(angle) {
        let c = Math.cos(angle), s = Math.sin(angle);
        return new Vec2(this.x * c - this.y * s, this.x * s + this.y * c);
    }
    rotateAround(origin, angle) {
        let x = this.x - origin.x;
        let y = this.y - origin.y;
        let c = Math.cos(angle), s = Math.sin(angle);
        return new Vec2(x * c - y * s, x * s + y * c).add(origin);
    }
    distanceTo(v) {
        return v.sub(this).length;
    }
    sqrDistanceTo(v) {
        return v.sub(this).sqrLength;
    }
    normalize() {
        let m = 1 / this.length;
        return new Vec2(this.x * m, this.y * m);
    }
    negate() {
        return new Vec2(-this.x, -this.y);
    }
    toLength(length) {
        let m = length / this.length;
        return new Vec2(this.x * m, this.y * m);
    }
    normal() {
        return new Vec2(this.y, -this.x);
    }
    isZero() {
        return this.x === 0 && this.y === 0;
    }
    equals(v) {
        return this.x === v.x && this.y === v.y;
    }
    copy() {
        return new Vec2(this.x, this.y);
    }
    toString() {
        return `${this.x};${this.y}`;
    }
    static ldx(distance, direction, startX = 0) {
        return startX + distance * Math.cos(direction);
    }
    static ldy(distance, direction, startY = 0) {
        return startY + distance * Math.sin(direction);
    }
    static ld(distance, direction, startX = 0, startY = 0) {
        return new Vec2(startX + distance * Math.cos(direction), startY + distance * Math.sin(direction));
    }
    static randUnit() {
        let a = Angle.rand();
        return new Vec2(Vec2.ldx(1, a), Vec2.ldy(1, a));
    }
    static randUnit3d() {
        let a = Angle.rand(), a2 = Angle.rand();
        let len = Vec2.ldx(1, a2);
        return new Vec2(Vec2.ldx(len, a), Vec2.ldy(len, a));
    }
    static onEllipse(r1, r2, angle, center) {
        if (center === undefined) {
            center = Vec2.zero;
        }
        return new Vec2(Vec2.ldx(r1, angle, center.x), Vec2.ldy(r2, angle, center.y));
    }
    static init() {
        Vec2.zero = new Vec2(0, 0);
    }
}
Vec2.init();
//# sourceMappingURL=game.js.map