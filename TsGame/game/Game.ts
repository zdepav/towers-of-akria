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

    static saveImages = false // for debug purposes

    private status: InitializationStatus
    private preRendered: CanvasImageSource
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private guiPanels: GuiPanel[]
    private map: Tile[][]
    private enemies: EnemySet
    private wavePlanner: EnemyWavePlanner
    private projectiles: ProjectileSet
    private particles: ParticleSystem
    private prevTime: number
    private performanceMeter: PerformanceMeter
    private mousePosition: Vec2
    private hoveredTilePos: Vec2 | null
    private selectedTile: Tile | null
    private mouseButton: MouseButton | null
    private arcaneTowerCount: number
    private time: number
    private upgradeButtons: TurretUpgradeButton[]
    private rangeMarkerRotation: number
    private hoveredElement: TurretElement | null

    private get hoveredTile(): Tile | null {
        return this.hoveredTilePos !== null ? this.map[this.hoveredTilePos.x][this.hoveredTilePos.y] : null
    }

    mapWidth: number
    mapHeight: number
    width: number
    height: number

    get towerDamageMultiplier(): number { return this.arcaneTowerCount * 0.25 + 1 }

    private constructor(container: HTMLElement) {
        this.width = 1152
        this.height = 704
        this.mapWidth = 15
        this.mapHeight = 9
        let canvas = document.createElement("canvas")
        canvas.id = "game-canvas"
        canvas.width = this.width
        canvas.height = this.height
        canvas.style.border = "2px solid #606060"
        canvas.style.outline = "none"
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
        this.hoveredTilePos = null
        this.selectedTile = null
        this.mouseButton = null
        this.status = InitializationStatus.Uninitialized
        this.arcaneTowerCount = 0
        this.wavePlanner = new EnemyWavePlanner(this)
        this.guiPanels = [
            new GuiPanel(this, 0, 0, this.width, this.height),
            new GuiPanel(this, 960, 0, 192, 384),
            new GuiPanel(this, 0, 576, 1152, 704)
        ]
        this.guiPanels[0].addItem(this.guiPanels[1])
        this.guiPanels[0].addItem(this.guiPanels[2])
        this.upgradeButtons = []
        for (let e = TurretElement.Air, x = 4; e <= TurretElement.Water; ++e, x += 287) {
            let button = new TurretUpgradeButton(this, x, 582, 283, 118, e)
            this.upgradeButtons.push(button)
            this.guiPanels[2].addItem(button)
        }
        this.rangeMarkerRotation = 0
        this.hoveredElement = null
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
            this.map[0][startY].next = this.map[1][startY]
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

    private start(): void {
        let g = this
        this.render()
        function gameLoop() {
            window.requestAnimationFrame(gameLoop)
            g.step()
            g.render()
        }
        gameLoop()
    }

    private step(): void {
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
                        if (t.type == TileType.Tower) {
                            if (this.selectedTile == t) {
                                this.markTile(t)
                            }
                            if (t.turret instanceof ArcaneTurret) {
                                ++arcaneTowerCount
                            }
                        }
                    }
                }
                this.arcaneTowerCount = arcaneTowerCount
                this.wavePlanner.step(timeDiff)
                this.enemies.step(timeDiff)
                this.particles.step(timeDiff)
                this.projectiles.step(timeDiff)
                this.rangeMarkerRotation += timeDiff * Angle.deg60
                this.prevTime = time
                this.time += timeDiff
                return
            }
        }
    }

    markTile(tile: Tile): void {
        this.spawnParticle(new TileMarkParticle(tile.pos.x + 4, tile.pos.y + 4, new Vec2(1, 0)))
        this.spawnParticle(new TileMarkParticle(tile.pos.x + 4, tile.pos.y + 4, new Vec2(0, 1)))
        this.spawnParticle(new TileMarkParticle(tile.pos.x + 60, tile.pos.y + 4, new Vec2(-1, 0)))
        this.spawnParticle(new TileMarkParticle(tile.pos.x + 60, tile.pos.y + 4, new Vec2(0, 1)))
        this.spawnParticle(new TileMarkParticle(tile.pos.x + 4, tile.pos.y + 60, new Vec2(1, 0)))
        this.spawnParticle(new TileMarkParticle(tile.pos.x + 4, tile.pos.y + 60, new Vec2(0, -1)))
        this.spawnParticle(new TileMarkParticle(tile.pos.x + 60, tile.pos.y + 60, new Vec2(-1, 0)))
        this.spawnParticle(new TileMarkParticle(tile.pos.x + 60, tile.pos.y + 60, new Vec2(0, -1)))
    }

    getMousePosition(): Vec2 { return this.mousePosition.copy() }

    private setMousePosition(e: MouseEvent): void {
        var rect = this.canvas.getBoundingClientRect()
        this.mousePosition = new Vec2(
            Utils.clamp(Math.floor(e.clientX - rect.left), 0, this.width - 1),
            Utils.clamp(Math.floor(e.clientY - rect.top), 0, this.width - 1)
        )
    }

    private onMouseMove(e: MouseEvent): void {
        if (this.status < InitializationStatus.Initialized) {
            return
        }
        this.setMousePosition(e)
        this.hoveredElement = null
        this.guiPanels[0].onMouseMove()
        if (this.hoveredTilePos === null) {
            return
        }
        let tp = new Vec2(Math.floor(this.mousePosition.x / 64), Math.floor(this.mousePosition.y / 64))
        if (!tp.equals(this.hoveredTilePos)) {
            this.hoveredTilePos = null
        }
    }

    private onMouseDown(e: MouseEvent): void {
        if (this.status < InitializationStatus.Initialized) {
            return
        }
        this.setMousePosition(e)
        this.guiPanels[0].onMouseDown(e.button)
        let tp = new Vec2(Math.floor(this.mousePosition.x / 64), Math.floor(this.mousePosition.y / 64))
        if (tp.x < this.mapWidth && tp.y < this.mapHeight) {
            this.hoveredTilePos = tp
            this.mouseButton = e.button
        }
    }

    private onMouseUp(e: MouseEvent): void {
        if (this.status < InitializationStatus.Initialized) {
            return
        }
        this.setMousePosition(e)
        this.guiPanels[0].onMouseUp(e.button)
        if (this.hoveredTilePos) {
            this.selectedTile = this.hoveredTile
            for (const b of this.upgradeButtons) {
                b.targetTile = this.selectedTile
            }
            this.selectedTile?.onClick(
                this.mouseButton as MouseButton,
                this.mousePosition.x % 64,
                this.mousePosition.y % 64
            )
            this.hoveredTilePos = null
        }
        this.mouseButton = null
    }

    private onKeyDown(e: KeyboardEvent): void {
        if (this.status < InitializationStatus.Initialized) {
            return
        }
        switch (e.key.toUpperCase()) {
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

    private onKeyUp(e: KeyboardEvent): void { }

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
            let x = this.guiPanels[1].x, y = this.guiPanels[1].bottom
            for (let i = 0; i < 9; ++i) {
                Tile.drawPathGround(ctx, x + i % 3 * 64, y + Math.floor(i / 3) * 64)
            }
            ctx.fillStyle = "#606060"
            ctx.fillRect(this.guiPanels[1].x, this.guiPanels[1].y, 2, this.guiPanels[1].h)
            ctx.fillRect(this.guiPanels[1].x, this.guiPanels[1].bottom - 2, this.guiPanels[1].w, 2)
            ctx.fillRect(this.guiPanels[2].x, this.guiPanels[2].y, this.guiPanels[2].w, 2)
            this.preRendered = c.image
            resolve()
        })
    }

    private render(): void {
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
                ctx.drawImage(this.preRendered, 0, 0)
                for (let x = 0; x < this.mapWidth; ++x) {
                    for (let y = 0; y < this.mapHeight; ++y) {
                        this.map[x][y].render(ctx, false)
                    }
                }
                this.guiPanels[0].render(ctx)
                this.enemies.render(ctx)
                ctx.drawImage(Game.castleImage, this.guiPanels[1].x, this.guiPanels[1].bottom)
                this.particles.render(ctx)
                this.projectiles.render(ctx)
                for (let x = 0; x < this.mapWidth; ++x) {
                    for (let y = 0; y < this.mapHeight; ++y) {
                        this.map[x][y].renderOverlay(ctx)
                    }
                }
                if (this.selectedTile && this.selectedTile.turret) {
                    let range = this.selectedTile.turret.range
                    let {x, y} = this.selectedTile.pos.addu(32, 32)
                    this.renderRangeMarker(ctx, x, y, range, "#00000060")
                    if (this.hoveredElement !== null) {
                        let info = this.selectedTile.turret.getInfoAfterUpgrade(this.hoveredElement)
                        if (info) {
                            this.renderRangeMarker(ctx, x, y, info.range, "#40404040")
                        }
                    }
                }
                let fps = this.performanceMeter.getFps()
                ctx.fillStyle = "#000000"
                ctx.textAlign = "left"
                ctx.textBaseline = "top"
                ctx.font = "bold 12px monospace"
                if (!isNaN(fps)) {
                    let f = Math.floor(fps * 10)
                    ctx.fillText(`FPS:         ${Math.floor(f / 10)}.${f % 10}`, this.guiPanels[1].x + 8, this.guiPanels[1].y + 6)
                }
                ctx.fillText(`Enemies:     ${this.enemies.count}`, this.guiPanels[1].x + 8, this.guiPanels[1].y + 20)
                ctx.fillText(`Particles:   ${this.particles.count}`, this.guiPanels[1].x + 8, this.guiPanels[1].y + 34)
                ctx.fillText(`Projectiles: ${this.projectiles.count}`, this.guiPanels[1].x + 8, this.guiPanels[1].y + 48)
                return
            }
        }
    }

    renderRangeMarker(ctx: CanvasRenderingContext2D, x: number, y: number, range: number, color: string): void {
        let rot = this.rangeMarkerRotation
        ctx.beginPath()
        ctx.arc(x, y, range, 0, Angle.deg360)
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.beginPath()
        for (let k = 0; k < 2; ++k) {
            ctx.moveTo(Vec2.ldx(range, rot, x), Vec2.ldy(range, rot, y))
            for (let i = 1; i <= 8; ++i) {
                let a = rot + i * Angle.deg45
                ctx.lineTo(Vec2.ldx(range, a, x), Vec2.ldy(range, a, y))
            }
            rot += Angle.deg(22.5)
        }
        ctx.lineWidth = 1
        ctx.stroke()
    }

    spawnEnemy(e: Enemy): void { this.enemies.add(e) }

    spawnParticle(p: Particle): void { this.particles.add(p) }

    spawnProjectile(p: Projectile): void { this.projectiles.add(p) }

    findEnemy(point: Vec2, maxDistance: number): Enemy | null {
        return this.enemies.findAny(point, maxDistance)
    }

    findNearestEnemy(point: Vec2, maxDistance: number): Enemy | null {
        return this.enemies.findNearest(point, maxDistance)
    }

    findEnemiesInRange(point: Vec2, maxDistance: number): Enemy[] {
        return this.enemies.findInRange(point, maxDistance)
    }

    takeLife(): void {
        // TODO: implement
    }

    playerCanAffordUpgrade(upgradeCostMultiplier: number): boolean {
        // TODO: implement
        return upgradeCostMultiplier >= 0
    }

    buyUpgrade(upgradeCostMultiplier: number): boolean {
        // TODO: implement
        return upgradeCostMultiplier >= 0
    }

    hoverElement(type: TurretElement): void {
        this.hoveredElement = type
    }

    static initializeAndRun(): void {
        let container = document.getElementById("zptd-game-container")
        if (container == null) {
            throw new Error('Html element with id "zptd-game-container" not found')
        } else {
            new Game(container).start()
        }
    }
}

function gen() {
    let W = 6, H = 5
    let w = 258, h = 286
    let c = new PreRenderedImage(w * W, h * H)
    let ctx = c.ctx, i = 0, c1 = "#A01713", c2 = "#FFE2A8", ch = "#CF7C5D"
    ctx.fillStyle = "#404040"
    ctx.fillRect(0, 0, w * W, h * H)
    function label(line1: string, line2?: string) {
        let x = i % W * w + 1
        let y = Math.floor(i / W) * h + 257
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
    ).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
    label("Cellular", "Cells, Euclidean")
    ++i
    ctx.drawImage(new CellularTextureGenerator(
        256, 256, 1024, c1, c2, CellularTextureType.Cells, CellularTextureDistanceMetric.Manhattan
    ).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
    label("Cellular", "Cells, Manhattan")
    ++i
    ctx.drawImage(new CellularTextureGenerator(
        256, 256, 1024, c1, c2, CellularTextureType.Balls, CellularTextureDistanceMetric.Euclidean
    ).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
    label("Cellular", "Balls, Euclidean")
    ++i
    ctx.drawImage(new CellularTextureGenerator(
        256, 256, 1024, c1, c2, CellularTextureType.Balls, CellularTextureDistanceMetric.Manhattan
    ).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
    label("Cellular", "Balls, Manhattan")
    ++i
    ctx.drawImage(new CellularTextureGenerator(
        256, 256, 1024, c1, c2, CellularTextureType.Net, CellularTextureDistanceMetric.Euclidean
    ).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
    label("Cellular", "Net, Euclidean")
    ++i
    ctx.drawImage(new CellularTextureGenerator(
        256, 256, 1024, c1, c2, CellularTextureType.Net, CellularTextureDistanceMetric.Manhattan
    ).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
    label("Cellular", "Net, Manhattan")
    ++i
    ctx.drawImage(new CellularTextureGenerator(
        256, 256, 1024, c1, c2, CellularTextureType.Cells, CellularTextureDistanceMetric.Chebyshev
    ).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
    label("Cellular", "Cells, Chebyshev")
    ++i
    ctx.drawImage(new CellularTextureGenerator(
        256, 256, 1024, c1, c2, CellularTextureType.Cells, CellularTextureDistanceMetric.Minkowski
    ).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
    label("Cellular", "Cells, Minkowski")
    ++i
    ctx.drawImage(new CellularTextureGenerator(
        256, 256, 1024, c1, c2, CellularTextureType.Balls, CellularTextureDistanceMetric.Chebyshev
    ).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
    label("Cellular", "Balls, Chebyshev")
    ++i
    ctx.drawImage(new CellularTextureGenerator(
        256, 256, 1024, c1, c2, CellularTextureType.Balls, CellularTextureDistanceMetric.Minkowski
    ).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
    label("Cellular", "Balls, Minkowski")
    ++i
    ctx.drawImage(new CellularTextureGenerator(
        256, 256, 1024, c1, c2, CellularTextureType.Net, CellularTextureDistanceMetric.Chebyshev
    ).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
    label("Cellular", "Net, Chebyshev")
    ++i
    ctx.drawImage(new CellularTextureGenerator(
        256, 256, 1024, c1, c2, CellularTextureType.Net, CellularTextureDistanceMetric.Minkowski
    ).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
    label("Cellular", "Net, Minkowski")
    ++i
    ctx.drawImage(new NoiseTextureGenerator(256, 256, ch, 0.5, 0.5, 1).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
    label("Noise")
    ++i
    ctx.drawImage(new PerlinNoiseTextureGenerator(256, 256, c1, c2, 1).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
    label("Perlin", "Noise")
    ++i
    ctx.drawImage(new CloudsTextureGenerator(256, 256, c1, c2, 1).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
    label("Perlin", "Clouds")
    ++i
    ctx.drawImage(new VelvetTextureGenerator(256, 256, c1, c2, 1).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
    label("Perlin", "Velvet")
    ++i
    ctx.drawImage(new GlassTextureGenerator(256, 256, c1, c2, 1, 1).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
    label("Perlin", "Glass")
    ++i
    ctx.drawImage(new FrostedGlassTextureGenerator(256, 256, c1, c2, 1).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
    label("Perlin", "Frosted glass")
    ++i
    ctx.drawImage(new BarkTextureGenerator(256, 256, c1, c2, 1, 0.75).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
    label("Perlin", "Bark")
    ++i
    ctx.drawImage(new CirclesTextureGenerator(256, 256, c1, c2, ch, 1, 4, 1).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
    label("Perlin", "Circles")
    ++i
    ctx.drawImage(new CamouflageTextureGenerator(256, 256, c1, c2, 1).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
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
    ctx.drawImage(grads[0].generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
    label("Gradient", "Radial")
    ++i
    ctx.drawImage(new FisheyeSource(256, 256, grads[1], 0.5, 128, 128, 128).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
    label("Gradient", "Linear, Fisheye[+]")
    ++i
    ctx.drawImage(new FisheyeSource(256, 256, grads[1], -0.5, 128, 128, 128).generateImage(), i % W * w + 1, Math.floor(i / W) * h + 1)
    label("Gradient", "Linear, Fisheye[-]")
    ++i
    ctx.drawImage(
        new PolarSource(
            256, 256,
            new BarkTextureGenerator(512, 256, c1, c2, 0.5, 0.75),
            512, 256
        ).generateImage(),
        i % W * w + 1,
        Math.floor(i / W) * h + 1
    )
    label("Perlin + Polar", "Bark")
    ++i
    ctx.drawImage(
        new AntialiasedSource(
            256, 256,
            new ScalingSource(
                256, 256,
                new FisheyeSource(
                    256, 256,
                    new CircleSource(
                        256, 256, 128, 128, 127,
                        new PolarSource(
                            256, 256,
                            new RoofTilesSource(
                                256, 256, 12, 3,
                                new NoiseTextureGenerator(256, 256, "#E0D2B3", 0.125, 0, 1),
                                "#706859", RgbaColor.transparent
                            )
                        ),
                        RgbaColor.transparent
                    ),
                    0.5, 128, 128, 128
                ),
                0.1875, 0, 0
            ),
        ).generateImage(),
        i % W * w + 1,
        Math.floor(i / W) * h + 1
    )
    label("")
    ++i
    ctx.drawImage(
        new RoofTilesSource(
            256, 256, 8, 8,
            new NoiseTextureGenerator(256, 256, "#E0D2B3", 0.125, 0, 1),
            "#706859"
        ).generateImage(),
        i % W * w + 1,
        Math.floor(i / W) * h + 1
    )
    label("Roof Tiles")
    ++i
    ctx.drawImage(
        new CircleSource(
            256, 256, 128, 128, 127,
            new PolarSource(
                256, 256,
                new RoofTilesSource(
                    256, 256, 16, 6,
                    new NoiseTextureGenerator(256, 256, "#E0D2B3", 0.125, 0, 1),
                    "#706859", RgbaColor.transparent
                )
            ),
            RgbaColor.transparent
        ).generateImage(),
        i % W * w + 1,
        Math.floor(i / W) * h + 1
    )
    label("Roof Tiles + Polar + Circle")
    ++i
    ctx.drawImage(
        new FisheyeSource(
            256, 256,
            new CircleSource(
                256, 256, 128, 128, 127,
                new PolarSource(
                    256, 256,
                    new RoofTilesSource(
                        256, 256, 16, 6,
                        new NoiseTextureGenerator(256, 256, "#E0D2B3", 0.125, 0, 1),
                        "#706859", RgbaColor.transparent
                    )
                ),
                RgbaColor.transparent
            ),
            0.5, 128, 128, 128
        ).generateImage(),
        i % W * w + 1,
        Math.floor(i / W) * h + 1
    )
    label("Roof Tiles + Polar + Circle + Eye[+]")
    ++i
    ctx.drawImage(
        new FisheyeSource(
            256, 256,
            new CircleSource(
                256, 256, 128, 128, 127,
                new PolarSource(
                    256, 256,
                    new RoofTilesSource(
                        256, 256, 16, 8,
                        new NoiseTextureGenerator(256, 256, "#E0D2B3", 0.125, 0, 1),
                        "#706859", RgbaColor.transparent
                    )
                ),
                RgbaColor.transparent
            ),
            -0.5, 128, 128, 128
        ).generateImage(),
        i % W * w + 1,
        Math.floor(i / W) * h + 1
    )
    label("Roof Tiles + Polar + Circle + Eye[-]")
    







    c.saveImage("textures")
}
