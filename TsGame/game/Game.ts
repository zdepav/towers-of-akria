enum MouseButton {
    Left,
    Middle,
    Right,
    Back,
    Forward
}

enum GameScreen {
    Intro,
    Game,
    End
}

class Game {

    private castleImage: CanvasImageSource
    private introBackground: CanvasImageSource

    static saveImages = false // for debug purposes

    private container: HTMLElement
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
    private paused: boolean
    private mana: number
    private lives: number
    private screen: GameScreen
    private startGameButton: TextButton
    private resetGameButton: TextButton

    private get hoveredTile(): Tile | null {
        return this.hoveredTilePos !== null ? this.map[this.hoveredTilePos.x][this.hoveredTilePos.y] : null
    }

    mapWidth: number
    mapHeight: number
    width: number
    height: number

    get towerDamageMultiplier(): number { return this.arcaneTowerCount * 0.25 + 1 }

    private constructor(container: HTMLElement) {
        this.container = container
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
        this.arcaneTowerCount = 0
        this.wavePlanner = new EnemyWavePlanner(this)
        this.guiPanels = [new GuiPanel(this, 0, 0, this.width, this.height)]
        this.rangeMarkerRotation = 0
        this.hoveredElement = null
        this.paused = false
        this.mana = 200
        this.lives = 20
        this.screen = GameScreen.Intro
    }

    private init(): Promise<void> {
        return RgbaColor.init()
            .then(() => Angle.init())
            .then(() => Tile.init())
            .then(() => Turret.initAll())
            .then(() => this.generateCastle())
            .then(() => this.generateIntroBackground())
            .then(() => this.initGui())
            .then(() => this.initEvents())
            .then(() => this.generateMap())
            .then(() => this.preRender())
    }

    private initGui(): Promise<void> {
        return new Promise<void>(resolve => {

            let panel1 = new GuiPanel(this, 960, 0, 192, 384)
            this.guiPanels.push(panel1)
            this.guiPanels[0].addItem(panel1)
            let pauseButton = new PauseButton(this, this.width - 24, 8, 16, 16)
            pauseButton.onclick = () => this.paused = !this.paused
            panel1.addItem(pauseButton)

            let panel2 = new GuiPanel(this, 0, 576, 1152, 704)
            this.guiPanels.push(panel2)
            this.guiPanels[0].addItem(panel2)
            this.upgradeButtons = []
            for (let e = TurretElement.Air, x = 4; e <= TurretElement.Water; ++e, x += 287) {
                let button = new TurretUpgradeButton(this, x, 582, 283, 118, e)
                this.upgradeButtons.push(button)
                panel2.addItem(button)
            }

            this.startGameButton = new TextButton(this, 32, this.height - 96, this.width - 64, 64, "Start game")
            this.startGameButton.onclick = () => {
                this.startGameButton.enabled = false
                this.generateMap()
                    .then(() => this.preRender())
                    .then(() => new Promise<void>(resolve => {
                        this.screen = GameScreen.Game
                        resolve()
                    }))
            }

            this.resetGameButton = new TextButton(this, 32, this.height - 96, this.width - 64, 64, "Back to menu")
            this.resetGameButton.onclick = () => {
                this.screen = GameScreen.Intro
                this.startGameButton.enabled = true
            }
            resolve()
        })
    }

    private initEvents(): Promise<void> {
        return new Promise<void>(resolve => {
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
        })
    }

    private generateIntroBackground(): Promise<void> {
        return Utils.getImageFromCache("td_intro_back").then(tex => { this.introBackground = tex }, () => new Promise<void>(resolve => {
            let c = new CellularTextureGenerator(
                256, 256, 2304,
                new NoiseTextureGenerator(
                    256, 256,
                    RgbaColor.fromHex("#303030"),
                    0.05, 0, 1
                ),
                new FrostedGlassTextureGenerator(
                    256, 256,
                    RgbaColor.fromHex("#AF9A3B"),
                    RgbaColor.fromHex("#D8CA84"),
                    1, Curve.linear
                ),
                CellularTextureType.Net,
                CellularTextureDistanceMetric.Euclidean,
                Curve.arc
            ).generatePrImage()
            c.cacheImage("td_intro_back")
            this.introBackground = c.image
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
                let i = Rand.r(wallGens.size)
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
                switch (Rand.i(4)) {
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
            let startY = 1 + 2 * Math.floor(Rand.r(this.mapHeight - 1) / 2)
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
        return Utils.getImageFromCache("td_castle").then(tex => { this.castleImage = tex }, () => new Promise<void>(resolve => {
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
            this.castleImage = c.image
            resolve()
        }))
    }

    private start(introInit: Promise<void>, intro: (duration: number) => Promise<void>): void {
        let g = this
        function gameLoop(): undefined {
            window.requestAnimationFrame(gameLoop)
            g.step()
            g.render()
            return undefined
        }
        introInit
            .then(() => this.init())
            .then(() => intro(4000))
            .then(() => new Promise<void>(resolve => {
                this.container.appendChild(this.canvas)
                this.prevTime = new Date().getTime()
                resolve()
            }))
            .then(gameLoop)
    }

    private step(): void {
        let time = new Date().getTime()
        let timeDiff = (time - this.prevTime) / 1000
        this.performanceMeter.add(1 / timeDiff)
        this.guiPanels[0].step(timeDiff)
        switch (this.screen) {
            case GameScreen.Intro:
                this.startGameButton.step(timeDiff)
                break
            case GameScreen.Game:
                if (!this.paused) {
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
                }
                break
            case GameScreen.End:
                this.resetGameButton.step(timeDiff)
                break
        }
        this.prevTime = time
        this.time += timeDiff
    }

    end(): void {
        this.screen = GameScreen.End
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
        this.setMousePosition(e)
        switch (this.screen) {
            case GameScreen.Intro:
                this.startGameButton.onMouseMove()
                break
            case GameScreen.Game:
                this.hoveredElement = null
                this.guiPanels[0].onMouseMove()
                if (this.hoveredTilePos === null) {
                    return
                }
                let tp = new Vec2(Math.floor(this.mousePosition.x / 64), Math.floor(this.mousePosition.y / 64))
                if (!tp.equals(this.hoveredTilePos)) {
                    this.hoveredTilePos = null
                }
                break
        }
    }

    private onMouseDown(e: MouseEvent): void {
        this.setMousePosition(e)
        switch (this.screen) {
            case GameScreen.Intro:
                this.startGameButton.onMouseDown(e.button)
                break
            case GameScreen.Game:
                this.guiPanels[0].onMouseDown(e.button)
                let tp = new Vec2(Math.floor(this.mousePosition.x / 64), Math.floor(this.mousePosition.y / 64))
                if (tp.x < this.mapWidth && tp.y < this.mapHeight) {
                    this.hoveredTilePos = tp
                    this.mouseButton = e.button
                }
                break
        }
    }

    private onMouseUp(e: MouseEvent): void {
        this.setMousePosition(e)
        switch (this.screen) {
            case GameScreen.Intro:
                this.startGameButton.onMouseUp(e.button)
                break
            case GameScreen.Game:
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
                break
        }
    }

    private onKeyDown(e: KeyboardEvent): void {
        switch (e.key.toUpperCase()) {
            case 'C':
                if (e.altKey) {
                    localStorage.clear()
                    alert("Cache cleared.")
                }
                break
            case 'P':
                if (this.screen === GameScreen.Game) {
                    this.paused = !this.paused
                }
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
        switch (this.screen) {
            case GameScreen.Intro:
                ctx.fillStyle = ctx.createPattern(this.introBackground, "repeat") as CanvasPattern
                ctx.fillRect(0, 0, this.width, this.height)
                ctx.lineJoin = "round"
                ctx.textAlign = "center"
                ctx.textBaseline = "middle"
                ctx.font = "bold 112px sans-serif"
                ctx.strokeStyle = "#00000060"
                for (let i = 64; i >= 16; i -= 12) {
                    ctx.lineWidth = i
                    ctx.strokeText("Towers of Akria", this.width / 2, this.height / 4)
                }
                ctx.fillText("Towers of Akria", this.width / 2, this.height / 4)
                ctx.fillStyle = "#D8CA8440"
                ctx.fillText("Towers of Akria", this.width / 2, this.height / 4)
                this.startGameButton.render(ctx)
                break
            case GameScreen.Game:
                this.renderGame()
                break
            case GameScreen.End:
                ctx.fillStyle = "#400000"
                ctx.fillRect(0, 0, this.width, this.height)
                ctx.fillStyle = "#FFE0E0"
                ctx.textAlign = "center"
                ctx.textBaseline = "middle"
                ctx.font = "96px monospace"
                ctx.fillText("GAME OVER", this.width / 2, this.height * 0.33)
                ctx.font = "40px monospace"
                ctx.fillText(`You survived ${this.wavePlanner.waveNumber - 1} waves`, this.width / 2, this.height * 0.67)
                this.resetGameButton.render(ctx)
                break
        }
    }

    private renderGame(): void {
        let ctx = this.ctx

        ctx.drawImage(this.preRendered, 0, 0)

        for (let x = 0; x < this.mapWidth; ++x) {
            for (let y = 0; y < this.mapHeight; ++y) {
                this.map[x][y].render(ctx, false)
            }
        }
        this.guiPanels[0].render(ctx)
        this.enemies.render(ctx)
        ctx.drawImage(this.castleImage, this.guiPanels[1].x, this.guiPanels[1].bottom)
        this.particles.render(ctx)
        this.projectiles.render(ctx)
        for (let x = 0; x < this.mapWidth; ++x) {
            for (let y = 0; y < this.mapHeight; ++y) {
                this.map[x][y].renderOverlay(ctx)
            }
        }

        if (this.selectedTile && this.selectedTile.turret) {
            let range = this.selectedTile.turret.range
            let { x, y } = this.selectedTile.pos.addu(32, 32)
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
        ctx.textAlign = "right"
        ctx.textBaseline = "top"
        ctx.font = "bold 10px monospace"
        if (!isNaN(fps)) {
            ctx.fillText(`FPS: ${Math.floor(fps)}`, this.guiPanels[1].x + this.guiPanels[1].w - 40, this.guiPanels[1].y + 6)
        }
        ctx.textAlign = "left"
        ctx.font = "bold 24px monospace"
        ctx.fillText(`WAVE:  ${this.wavePlanner.waveNumber}`, this.guiPanels[1].x + 8, this.guiPanels[1].y + 8)
        ctx.fillText(`MANA:  ${this.mana}`, this.guiPanels[1].x + 8, this.guiPanels[1].y + 36)
        ctx.fillText(`LIVES: ${this.lives}`, this.guiPanels[1].x + 8, this.guiPanels[1].y + 64)

        if (this.paused) {
            ctx.fillStyle = "#20202080"
            ctx.fillRect(0, 0, this.width, this.height)
            ctx.fillStyle = "#E0E0E0"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.font = "bold 32px monospace"
            ctx.fillText("Paused", this.width / 2, this.height / 2)
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
        --this.lives
        if (this.lives <= 0) {
            this.end()
        }
    }

    addCurrency(enemyWave: number) {
        this.mana += 4 + Math.floor(enemyWave * 0.25)
    }

    playerCanAffordUpgrade(upgradeCostMultiplier: number): boolean {
        return upgradeCostMultiplier >= 0 && this.mana >= 100 * upgradeCostMultiplier
    }

    buyUpgrade(upgradeCostMultiplier: number): boolean {
        let price = 100 * upgradeCostMultiplier
        if (upgradeCostMultiplier >= 0 && this.mana >= price) {
            this.mana -= price
            return true
        }
        return false
    }

    hoverElement(type: TurretElement): void {
        this.hoveredElement = type
    }

    static initializeAndRun(introInit: Promise<void>, intro: (duration: number) => Promise<void>): void {
        let container = document.getElementById("zptd-game-container")
        if (container == null) {
            throw new Error('Html element with id "zptd-game-container" not found')
        } else {
            new Game(container).start(introInit, intro)
        }
    }
}
