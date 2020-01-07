enum MouseButton {
    Left,
    Middle,
    Right,
    Back,
    Forward
}

enum InitializationStatus {
    Uninitialized,
    Initializing,
    Initialized
}

class Game {

    private static castleImage: CanvasImageSource

    static saveImages = true // for debug purposes

    private status: InitializationStatus
    private preRendered: CanvasImageSource
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private guiPanel: Rect
    private map: Tile[][]
    private enemies: EnemySet
    private wavePlanner: EnemyWavePlanner
    private projectiles: ProjectileSet
    private particles: ParticleSystem
    private prevTime: number
    private time: number
    private performanceMeter: PerformanceMeter
    private mousePosition: Vec2
    private selectedTilePos: Vec2 | null
    private mouseButton: MouseButton | null
    private arcaneTowerCount: number

    private get selectedTile(): Tile | null {
        return this.selectedTilePos !== null ? this.map[this.selectedTilePos.x][this.selectedTilePos.y] : null
    }

    mapWidth: number
    mapHeight: number
    width: number
    height: number
    selectedTurretElement: TurretElement | null

    get towerDamageMultiplier(): number { return this.arcaneTowerCount * 0.25 + 1 }

    private constructor(container: HTMLElement) {
        let canvasWidth = 1152
        let canvasHeight = 576
        let canvas = document.createElement("canvas")
        canvas.id = "game-canvas"
        container.appendChild(canvas)
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D
        this.canvas = canvas
        this.prevTime = new Date().getTime()
        this.time = 0
        this.mousePosition = Vec2.zero
        this.performanceMeter = new PerformanceMeter()
        this.projectiles = new ProjectileSet()
        this.particles = new ParticleSystem()
        this.enemies = new EnemySet()
        this.selectedTurretElement = null
        this.selectedTilePos = null
        this.mouseButton = null
        this.status = InitializationStatus.Uninitialized
        this.arcaneTowerCount = 0
        this.wavePlanner = new EnemyWavePlanner(this)

        canvas.width = canvasWidth
        let mapWidth = Math.floor(canvasWidth / 64) - 3
        mapWidth = mapWidth % 2 === 0 ? mapWidth - 1 : mapWidth
        this.mapWidth = mapWidth < 3 ? 3 : mapWidth
        this.width = (mapWidth + 3) * 64

        canvas.height = canvasHeight
        let mapHeight = Math.floor(canvasHeight / 64)
        mapHeight = mapHeight % 2 === 0 ? mapHeight - 1 : mapHeight
        this.mapHeight = mapHeight < 3 ? 3 : mapHeight
        this.height = mapHeight * 64

        this.guiPanel = new Rect(this.width - 192, 0, 192, this.height - 192)
    }

    init(): Promise<void> {
        return RgbaColor.init()
            .then(() => Angle.init())
            .then(() => Tile.init())
            .then(() => Turret.initAll())
            .then(() => this.generateMap())
            .then(() => this.generateCastle())
            .then(() => this.preRender())
            .then(() => new Promise<void>(resolve => {
                this.canvas.setAttribute("tabindex", "0")
                this.canvas.focus()
                this.canvas.addEventListener("contextmenu", (e: MouseEvent) => {
                    e.preventDefault()
                    return false
                }, false)
                let g = this
                this.canvas.addEventListener("mousemove", (e: MouseEvent) => g.onMouseMove(e))
                this.canvas.addEventListener("mousedown", (e: MouseEvent) => g.onMouseDown(e))
                this.canvas.addEventListener("mouseup", (e: MouseEvent) => g.onMouseUp(e))
                this.canvas.addEventListener("keydown", (e: KeyboardEvent) => g.onKeyDown(e))
                this.canvas.addEventListener("keyup", (e: KeyboardEvent) => g.onKeyUp(e))
                resolve()
            }))
    }

    private generateMap(): Promise<void> {
        return new Promise<void>(resolve => {
            let mapGen: TileType[][] = []
            let map: (Tile | null)[][] = []
            let dijkstraMap: (DijkstraNode | null)[][] = []
            let wallGens = new Set<Vec2>()
            for (let x = 0; x < this.mapWidth; ++x) {
                var columnDijkstra: (DijkstraNode | null)[] = []
                var columnGen: TileType[] = []
                var column: (Tile | null)[] = []
                for (let y = 0; y < this.mapHeight; ++y) {
                    if (x === 0 || x === this.mapWidth - 1 || y === 0 || y === this.mapHeight - 1) {
                        columnGen.push(TileType.Empty)
                    } else if (x % 2 === 0 && y % 2 === 0) {
                        columnGen.push(TileType.WallGen)
                        wallGens.add(new Vec2(x, y))
                    } else {
                        columnGen.push(TileType.Unknown)
                    }
                    column.push(null)
                    columnDijkstra.push(null)
                }
                mapGen.push(columnGen)
                dijkstraMap.push(columnDijkstra)
                map.push(column)
            }
            while (wallGens.size > 0) {
                let wg: Vec2 = Vec2.zero
                let i = Math.random() * wallGens.size
                for (const _wg of wallGens.values()) {
                    if (i < 1) {
                        wg = _wg
                        break
                    } else {
                        i -= 1
                    }
                }
                wallGens.delete(wg)
                if (mapGen[wg.x][wg.y] !== TileType.WallGen) {
                    continue
                }
                let x = wg.x
                let y = wg.y
                switch (Math.floor(Math.random() * 4)) {
                    case 0:
                        for (; x < this.mapWidth && mapGen[x][y] !== TileType.Empty; ++x) {
                            mapGen[x][y] = TileType.Empty
                        }
                        break
                    case 1:
                        for (; y < this.mapHeight && mapGen[x][y] !== TileType.Empty; ++y) {
                            mapGen[x][y] = TileType.Empty
                        }
                        break
                    case 2:
                        for (; x >= 0 && mapGen[x][y] !== TileType.Empty; --x) {
                            mapGen[x][y] = TileType.Empty
                        }
                        break
                    case 3:
                        for (; y >= 0 && mapGen[x][y] !== TileType.Empty; --y) {
                            mapGen[x][y] = TileType.Empty
                        }
                        break
                }
            }
            let startY = 1 + 2 * Math.floor((this.mapHeight - 1) / 2 * Math.random())
            let endY = this.mapHeight - 2
            let startNode = new DijkstraNode(1, startY)
            dijkstraMap[1][0] = startNode
            let queue = [dijkstraMap[1][0]]
            let path: DijkstraNode | null = null
            while (queue.length > 0) {
                let dn: DijkstraNode | null = queue.shift() as DijkstraNode
                let x = dn.pos.x
                let y = dn.pos.y
                if (x === this.mapWidth - 2 && y === endY) {
                    path = dn
                    do {
                        mapGen[dn.pos.x][dn.pos.y] = TileType.Path
                        dn = dn.previous
                    } while (dn != null)
                    break
                }
                if (x > 1 && dijkstraMap[x - 1][y] === null && mapGen[x - 1][y] === TileType.Unknown) {
                    let node = new DijkstraNode(x - 1, y, dn)
                    dijkstraMap[x - 1][y] = node
                    queue.push(node)
                }
                if (y > 0 && dijkstraMap[x][y - 1] === null && mapGen[x][y - 1] === TileType.Unknown) {
                    let node = new DijkstraNode(x, y - 1, dn)
                    dijkstraMap[x][y - 1] = node
                    queue.push(node)
                }
                if (x < this.mapWidth - 2 && dijkstraMap[x + 1][y] === null && mapGen[x + 1][y] === TileType.Unknown) {
                    let node = new DijkstraNode(x + 1, y, dn)
                    dijkstraMap[x + 1][y] = node
                    queue.push(node)
                }
                if (y < this.mapHeight - 1 && dijkstraMap[x][y + 1] === null && mapGen[x][y + 1] === TileType.Unknown) {
                    let node = new DijkstraNode(x, y + 1, dn)
                    dijkstraMap[x][y + 1] = node
                    queue.push(node)
                }
            }
            if (path === null) {
                throw new Error("Map generation not successful!")
            }
            mapGen[0][startY] = TileType.Spawn
            mapGen[this.mapWidth - 1][endY] = TileType.HQ
            for (let x = 0; x < this.mapWidth; ++x) {
                for (let y = 0; y < this.mapHeight; ++y) {
                    if (mapGen[x][y] === TileType.Spawn) {
                        map[x][y] = new Tile(this, x * 64, y * 64, TileType.Spawn, this.ctx)
                    } else if (mapGen[x][y] === TileType.HQ) {
                        map[x][y] = new Tile(this, x * 64, y * 64, TileType.HQ, this.ctx)
                    } else if (mapGen[x][y] === TileType.Path) {
                        map[x][y] = new Tile(this, x * 64, y * 64, TileType.Path, this.ctx)
                    } else if (
                        (x > 0 && mapGen[x - 1][y] === TileType.Path) ||
                        (y > 0 && mapGen[x][y - 1] === TileType.Path) ||
                        (x < this.mapWidth - 1 && mapGen[x + 1][y] === TileType.Path) ||
                        (y < this.mapHeight - 1 && mapGen[x][y + 1] === TileType.Path) ||
                        (x > 0 && y > 0 && mapGen[x - 1][y - 1] === TileType.Path) ||
                        (x < this.mapWidth - 1 && y > 0 && mapGen[x + 1][y - 1] === TileType.Path) ||
                        (x > 0 && y < this.mapHeight - 1 && mapGen[x - 1][y + 1] === TileType.Path) ||
                        (x < this.mapWidth - 1 && y < this.mapHeight - 1 && mapGen[x + 1][y + 1] === TileType.Path)
                    ) {
                        map[x][y] = new Tile(this, x * 64, y * 64, TileType.Tower, this.ctx)
                    } else {
                        map[x][y] = new Tile(this, x * 64, y * 64, TileType.Empty, this.ctx)
                    }
                }
            }
            this.wavePlanner.spawnTile = map[0][startY] as Tile
            this.map = map as Tile[][] // all tiles are initialized by now
            while (true) {
                if (path.previous !== null) {
                    let a = path.previous.pos, b = path.pos
                    this.map[a.x][a.y].next = this.map[b.x][b.y]
                    path = path.previous
                } else break
            }
            resolve()
        })
    }

    private generateCastle(): Promise<void> {
        return Utils.getImageFromCache("td_castle").then(tex => { Game.castleImage = tex; }, () => new Promise<void>(resolve => {
            let c = new PreRenderedImage(192, 192)
            let castle = new RenderablePathSet()
            let path = new Path2D()
            path.rect(36, 36, 120, 120)
            let tex = new FrostedGlassTextureGenerator(192, 192, "#82614F", "#997663", 0.5)
            castle.pushNew(path, this.ctx.createPattern(tex.generateImage(), "repeat"))
            let walls = [
                [6, 6, 60, 60], [126, 6, 60, 60], [6, 126, 60, 60], [126, 126, 60, 60],
                [30, 66, 12, 60], [66, 30, 60, 12], [150, 66, 12, 60], [66, 150, 60, 12]
            ]
            path = new Path2D()
            for (let w of walls) {
                path.rect(w[0], w[1], w[2], w[3])
            }
            castle.pushNew(path, "#505050")
            path = new Path2D()
            path.rect(18, 18, 36, 36)
            path.rect(138, 18, 36, 36)
            path.rect(18, 138, 36, 36)
            path.rect(138, 138, 36, 36)
            castle.pushNew(path, "#404040")
            let pts = [
                6, 6, 30, 6, 54, 6, 126, 6, 150, 6, 174, 6,
                6, 30, 54, 30, 78, 30, 102, 30, 126, 30, 174, 30,
                6, 54, 30, 54, 54, 54, 126, 54, 150, 54, 174, 54,
                30, 78, 150, 78, 30, 102, 150, 102,
                6, 126, 30, 126, 54, 126, 126, 126, 150, 126, 174, 126,
                6, 150, 54, 150, 78, 150, 102, 150, 126, 150, 174, 150,
                6, 174, 30, 174, 54, 174, 126, 174, 150, 174, 174, 174
            ]
            path = new Path2D()
            for (let i = 0; i < pts.length; i += 2) {
                path.rect(pts[i], pts[i + 1], 12, 12)
            }
            castle.pushNew(path, "#606060")
            castle.render(c.ctx)
            c.cacheImage("td_castle")
            Game.castleImage = c.image
            resolve()
        }))
    }

    private start() {
        let g = this
        this.render()
        function gameLoop() {
            window.requestAnimationFrame(gameLoop)
            g.step()
            g.render()
        }
        gameLoop()
    }

    private step() {
        switch (this.status) {
            case InitializationStatus.Uninitialized: {
                this.status = InitializationStatus.Initializing
                this.init().then(() => { this.status = InitializationStatus.Initialized })
                return
            }
            case InitializationStatus.Initializing: {
                let time = new Date().getTime()
                let timeDiff = (time - this.prevTime) / 1000
                this.prevTime = time
                this.time += timeDiff
                return
            }
            case InitializationStatus.Initialized: {
                let time = new Date().getTime()
                let timeDiff = (time - this.prevTime) / 1000
                this.performanceMeter.add(1 / timeDiff)
                let arcaneTowerCount = 0
                for (let x = 0; x < this.mapWidth; ++x) {
                    for (let y = 0; y < this.mapHeight; ++y) {
                        let t = this.map[x][y]
                        t.step(timeDiff)
                        if (t.turret instanceof ArcaneTurret) {
                            ++arcaneTowerCount
                        }
                    }
                }
                this.arcaneTowerCount = arcaneTowerCount
                this.wavePlanner.step(timeDiff)
                this.enemies.step(timeDiff)
                this.particles.step(timeDiff)
                if (this.selectedTurretElement !== null) {
                    this.particles.add(new ElementSparkParticle(
                        this.mousePosition.x,
                        this.mousePosition.y,
                        this.selectedTurretElement
                    ))
                }
                this.prevTime = time
                this.time += timeDiff
                return
            }
        }
    }

    getMousePosition(): Vec2 { return this.mousePosition.copy() }

    private setMousePosition(e: MouseEvent) {
        var rect = this.canvas.getBoundingClientRect()
        this.mousePosition = new Vec2(
            Utils.clamp(Math.floor(e.clientX - rect.left), 0, this.width - 1),
            Utils.clamp(Math.floor(e.clientY - rect.top), 0, this.width - 1)
        )
    }

    private onMouseMove(e: MouseEvent) {
        if (this.status < InitializationStatus.Initialized) {
            return
        }
        this.setMousePosition(e)
        if (this.selectedTilePos === null) {
            return
        }
        let tp = new Vec2(Math.floor(this.mousePosition.x / 64), Math.floor(this.mousePosition.y / 64))
        if (!tp.equals(this.selectedTilePos)) {
            this.selectedTilePos = null
        }
    }

    private onMouseDown(e: MouseEvent) {
        if (this.status < InitializationStatus.Initialized) {
            return
        }
        this.setMousePosition(e)
        let tp = new Vec2(Math.floor(this.mousePosition.x / 64), Math.floor(this.mousePosition.y / 64))
        if (tp.x < this.mapWidth && tp.y < this.mapHeight) {
            this.selectedTilePos = tp
            this.mouseButton = e.button
        }
    }

    private onMouseUp(e: MouseEvent) {
        if (this.status < InitializationStatus.Initialized) {
            return
        }
        this.setMousePosition(e)
        if (this.selectedTilePos != null) {
            this.selectedTile?.onClick(
                this.mouseButton as MouseButton,
                this.mousePosition.x % 64,
                this.mousePosition.y % 64
            )
            this.selectedTilePos = null
        }
        this.mouseButton = null
    }

    private onKeyDown(e: KeyboardEvent) {
        if (this.status < InitializationStatus.Initialized) {
            return
        }
        switch (e.key.toUpperCase()) {
            case 'Q':
                this.selectedTurretElement = TurretElement.Air
                break
            case 'W':
                this.selectedTurretElement = TurretElement.Earth
                break
            case 'E':
                this.selectedTurretElement = TurretElement.Fire
                break
            case 'R':
                this.selectedTurretElement = TurretElement.Water
                break
            case 'T':
                this.selectedTurretElement = null
                break
            case 'C':
                if (e.altKey) {
                    localStorage.clear()
                    alert("Cache cleared.")
                }
                break
            case 'G':
                gen()
                break
        }
    }

    private onKeyUp(e: KeyboardEvent) { }

    private preRender(): Promise<void> {
        return new Promise<void>(resolve => {
            let c = new PreRenderedImage(this.width, this.height)
            let ctx = c.ctx
            ctx.fillStyle = "#C0C0C0"
            ctx.fillRect(0, 0, this.width, this.height)
            for (let x = 0; x < this.mapWidth; ++x) {
                for (let y = 0; y < this.mapHeight; ++y) {
                    this.map[x][y].render(ctx, true)
                }
            }
            ctx.fillStyle = "#B5947E"
            let x = this.guiPanel.x, y = this.height - 192
            for (let i = 0; i < 9; ++i) {
                Tile.drawPathGround(ctx, x + i % 3 * 64, y + Math.floor(i / 3) * 64)
            }
            ctx.fillStyle = "#606060"
            ctx.fillRect(this.guiPanel.x, this.guiPanel.y, 2, this.guiPanel.h)
            ctx.fillRect(this.guiPanel.x, this.guiPanel.y + this.guiPanel.h - 2, this.guiPanel.w, 2)
            this.preRendered = c.image
            resolve()
        })
    }

    private render() {
        let ctx = this.ctx
        switch (this.status) {
            case InitializationStatus.Uninitialized:
            case InitializationStatus.Initializing: {
                ctx.fillStyle = "#C0C0C0"
                ctx.fillRect(0, 0, this.width, this.height)
                ctx.fillStyle = "#000000"
                ctx.textAlign = "center"
                ctx.textBaseline = "middle"
                ctx.font = "bold 32px serif"
                ctx.fillText("Loading", this.width / 2, this.height / 2)
                return
            }
            case InitializationStatus.Initialized: {
                this.ctx.drawImage(this.preRendered, 0, 0)
                for (let x = 0; x < this.mapWidth; ++x) {
                    for (let y = 0; y < this.mapHeight; ++y) {
                        this.map[x][y].render(ctx, false)
                    }
                }
                this.enemies.render(ctx)
                ctx.drawImage(Game.castleImage, this.guiPanel.x, this.height - 192)
                this.particles.render(ctx)
                let fps = this.performanceMeter.getFps()
                ctx.fillStyle = "#000000"
                ctx.textAlign = "right"
                ctx.textBaseline = "top"
                ctx.font = "bold 16px serif"
                if (!isNaN(fps)) {
                    ctx.fillText(Math.floor(fps).toString(), this.guiPanel.x + this.guiPanel.w - 16, this.guiPanel.y + 16)
                }
                ctx.fillText(this.mousePosition.x.toString(), this.guiPanel.x + this.guiPanel.w - 16, this.guiPanel.y + 32)
                ctx.fillText(this.mousePosition.y.toString(), this.guiPanel.x + this.guiPanel.w - 16, this.guiPanel.y + 48)
                return
            }
        }
    }

    registerEnemy(enemy: Enemy) {
        let x = Utils.clamp(enemy.x / 64, 0, this.mapWidth - 1)
        let y = Utils.clamp(enemy.y / 64, 0, this.mapHeight - 1)
        this.map[x][y].enemies?.push(enemy)
    }

    findEnemy(point: Vec2, maxDistance: number): Enemy | null {
        if (this.enemies.count == 0) {
            return null
        }
        let x1 = Utils.clamp(point.x - maxDistance, 0, this.mapWidth - 1)
        let x2 = Utils.clamp(point.x + maxDistance, 0, this.mapWidth - 1)
        let y1 = Utils.clamp(point.y - maxDistance, 0, this.mapHeight - 1)
        let y2 = Utils.clamp(point.y + maxDistance, 0, this.mapHeight - 1)
        let t: Tile
        maxDistance *= maxDistance
        for (let x = x1; x <= x2; ++x) {
            for (let y = y1; y <= y2; ++y) {
                t = this.map[x][y]
                if (t.enemies === null || t.enemies.length === 0) {
                    continue
                }
                for (const e of t.enemies) {
                    let dist = point.sqrDistanceTo(e.pos)
                    if (dist <= maxDistance) {
                        return e
                    }
                }
            }
        }
        return null
    }

    findNearestEnemy(point: Vec2, maxDistance: number): Enemy | null {
        if (this.enemies.count == 0) {
            return null
        }
        let closestEnemy: Enemy | null = null
        let lowestDistance = Infinity
        let x1 = Utils.clamp(point.x - maxDistance, 0, this.mapWidth - 1)
        let x2 = Utils.clamp(point.x + maxDistance, 0, this.mapWidth - 1)
        let y1 = Utils.clamp(point.y - maxDistance, 0, this.mapHeight - 1)
        let y2 = Utils.clamp(point.y + maxDistance, 0, this.mapHeight - 1)
        let t: Tile
        maxDistance *= maxDistance
        for (let x = x1; x <= x2; ++x) {
            for (let y = y1; y <= y2; ++y) {
                t = this.map[x][y]
                if (t.enemies === null || t.enemies.length === 0) {
                    continue
                }
                for (const e of t.enemies) {
                    let dist = point.sqrDistanceTo(e.pos)
                    if (dist <= maxDistance && dist < lowestDistance) {
                        lowestDistance = dist
                        closestEnemy = e
                    }
                }
            }
        }
        return closestEnemy
    }

    findEnemiesInRange(point: Vec2, maxDistance: number): Enemy[] {
        if (this.enemies.count == 0) {
            return []
        }
        let enemies: Enemy[] = []
        let x1 = Utils.clamp(point.x - maxDistance, 0, this.mapWidth - 1)
        let x2 = Utils.clamp(point.x + maxDistance, 0, this.mapWidth - 1)
        let y1 = Utils.clamp(point.y - maxDistance, 0, this.mapHeight - 1)
        let y2 = Utils.clamp(point.y + maxDistance, 0, this.mapHeight - 1)
        let t: Tile
        maxDistance *= maxDistance
        for (let x = x1; x <= x2; ++x) {
            for (let y = y1; y <= y2; ++y) {
                t = this.map[x][y]
                if (t.enemies === null || t.enemies.length === 0) {
                    continue
                }
                for (const e of t.enemies) {
                    if (point.sqrDistanceTo(e.pos) <= maxDistance) {
                        enemies.push(e)
                    }
                }
            }
        }
        return enemies
    }

    spawnEnemy(e: Enemy) { this.enemies.add(e) }

    spawnParticle(p: Particle) { this.particles.add(p) }

    spawnProjectile(p: Projectile) { this.projectiles.add(p) }

    takeLife(): void {
        // TODO: implement
    }

    static initializeAndRun(): void {
        let container = document.getElementById("zptd-game-container")
        if (container == null) {
            throw new Error('Html element with id "zptd-game-container" not found')
        } else {
            //gen()
            new Game(container).start()
        }
    }

}

function gen() {
    let w = 258, h = 286
    let c = new PreRenderedImage(w * 6, h * 4)
    let ctx = c.ctx, i = 0, c1 = "#A01713", c2 = "#FFE2A8", ch = "#CF7C5D"
    ctx.fillStyle = "#404040"
    ctx.fillRect(0, 0, w * 6, h * 4)
    function label(line1: string, line2?: string) {
        let x = i % 6 * w + 1
        let y = Math.floor(i / 6) * h + 257
        ctx.fillStyle = "#C0C0C0"
        ctx.fillRect(x, y, 256, 28)
        ctx.fillStyle = "#000000"
        ctx.textAlign = "left"
        ctx.textBaseline = "middle"
        ctx.font = "bold 16px serif"
        ctx.fillText(line1, x + 6, y + 14, 248)
        if (line2) {
            ctx.textAlign = "right"
            ctx.fillText(`(${line2})`, x + 250, y + 12, 248)
        }
    }
    ctx.drawImage(new CellularTextureGenerator(
        256, 256, 1024, c1, c2, CellularTextureType.Cells, CellularTextureDistanceMetric.Euclidean
    ).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Cellular", "Cells, Euclidean")
    ++i
    ctx.drawImage(new CellularTextureGenerator(
        256, 256, 1024, c1, c2, CellularTextureType.Cells, CellularTextureDistanceMetric.Manhattan
    ).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Cellular", "Cells, Manhattan")
    ++i
    ctx.drawImage(new CellularTextureGenerator(
        256, 256, 1024, c1, c2, CellularTextureType.Balls, CellularTextureDistanceMetric.Euclidean
    ).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Cellular", "Balls, Euclidean")
    ++i
    ctx.drawImage(new CellularTextureGenerator(
        256, 256, 1024, c1, c2, CellularTextureType.Balls, CellularTextureDistanceMetric.Manhattan
    ).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Cellular", "Balls, Manhattan")
    ++i
    ctx.drawImage(new CellularTextureGenerator(
        256, 256, 1024, c1, c2, CellularTextureType.Net, CellularTextureDistanceMetric.Euclidean
    ).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Cellular", "Net, Euclidean")
    ++i
    ctx.drawImage(new CellularTextureGenerator(
        256, 256, 1024, c1, c2, CellularTextureType.Net, CellularTextureDistanceMetric.Manhattan
    ).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Cellular", "Net, Manhattan")
    ++i
    ctx.drawImage(new CellularTextureGenerator(
        256, 256, 1024, c1, c2, CellularTextureType.Cells, CellularTextureDistanceMetric.Chebyshev
    ).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Cellular", "Cells, Chebyshev")
    ++i
    ctx.drawImage(new CellularTextureGenerator(
        256, 256, 1024, c1, c2, CellularTextureType.Cells, CellularTextureDistanceMetric.Minkowski
    ).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Cellular", "Cells, Minkowski")
    ++i
    ctx.drawImage(new CellularTextureGenerator(
        256, 256, 1024, c1, c2, CellularTextureType.Balls, CellularTextureDistanceMetric.Chebyshev
    ).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Cellular", "Balls, Chebyshev")
    ++i
    ctx.drawImage(new CellularTextureGenerator(
        256, 256, 1024, c1, c2, CellularTextureType.Balls, CellularTextureDistanceMetric.Minkowski
    ).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Cellular", "Balls, Minkowski")
    ++i
    ctx.drawImage(new CellularTextureGenerator(
        256, 256, 1024, c1, c2, CellularTextureType.Net, CellularTextureDistanceMetric.Chebyshev
    ).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Cellular", "Net, Chebyshev")
    ++i
    ctx.drawImage(new CellularTextureGenerator(
        256, 256, 1024, c1, c2, CellularTextureType.Net, CellularTextureDistanceMetric.Minkowski
    ).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Cellular", "Net, Minkowski")
    ++i
    ctx.drawImage(new NoiseTextureGenerator(256, 256, ch, 0.5, 0.5, 1).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Noise")
    ++i
    ctx.drawImage(new PerlinNoiseTextureGenerator(256, 256, c1, c2, 1).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Perlin", "Noise")
    ++i
    ctx.drawImage(new CloudsTextureGenerator(256, 256, c1, c2, 1).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Perlin", "Clouds")
    ++i
    ctx.drawImage(new VelvetTextureGenerator(256, 256, c1, c2, 1).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Perlin", "Velvet")
    ++i
    ctx.drawImage(new GlassTextureGenerator(256, 256, c1, c2, 1, 1).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Perlin", "Glass")
    ++i
    ctx.drawImage(new FrostedGlassTextureGenerator(256, 256, c1, c2, 1).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Perlin", "Frosted glass")
    ++i
    ctx.drawImage(new BarkTextureGenerator(256, 256, c1, c2, 1, 0.75).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Perlin", "Bark")
    ++i
    ctx.drawImage(new CirclesTextureGenerator(256, 256, c1, c2, ch, 1, 4, 1).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Perlin", "Circles")
    ++i
    ctx.drawImage(new CamouflageTextureGenerator(256, 256, c1, c2, 1).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Perlin", "Camouflage")
    ++i
    let grads = [
        new RadialGradientSource(256, 256, 128, 128, 0, 128),
        new LinearGradientSource(256, 256, 0, 128, 256, 128)
    ]
    for (const g of grads) {
        g.addColorStop(0.000, "#FF0000")
        g.addColorStop(0.167, "#FFFF00")
        g.addColorStop(0.333, "#00FF00")
        g.addColorStop(0.500, "#00FFFF")
        g.addColorStop(0.667, "#0000FF")
        g.addColorStop(0.833, "#FF00FF")
        g.addColorStop(1.000, "#FF0000")
    }
    ctx.drawImage(grads[0].generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Gradient", "Radial")
    ++i
    ctx.drawImage(new FisheyeSource(256, 256, grads[1], 0.5, 128, 128, 128).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Gradient", "Linear, Fisheye[+]")
    ++i
    ctx.drawImage(new FisheyeSource(256, 256, grads[1], -0.5, 128, 128, 128).generateImage(), i % 6 * w + 1, Math.floor(i / 6) * h + 1)
    label("Gradient", "Linear, Fisheye[-]")
    c.saveImage("textures")
}
