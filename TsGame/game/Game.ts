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
const screenMusic: Array<string | null> = [null, null, null]

class Game {

    static saveImages = false // for debug purposes

    private readonly ctx: CanvasRenderingContext2D
    private readonly guiPanels: GuiPanel[]
    private readonly soundSystem: SoundSystem

    private castleImage: CanvasImageSource
    private introBackground: CanvasImageSource

    private container: HTMLElement
    private preRendered: CanvasImageSource
    private canvas: HTMLCanvasElement
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
    private sellButton: TextButton
    private startGameButton: TextButton
    private resetGameButton: TextButton
    private showFPS: boolean
    private gameSpeed: number
    private gameSpeedButtons: Array<GameSpeedButton>
    private muted: boolean

    private _screen: GameScreen

    private get screen(): GameScreen { return this._screen }

    private set screen(value: GameScreen) {
        this._screen = value
        this.soundSystem.stopAll()
        this.soundSystem.music = screenMusic[value]
    }

    private get hoveredTile(): Tile | null {
        return this.hoveredTilePos !== null
            ? this.map[this.hoveredTilePos.x][this.hoveredTilePos.y]
            : null
    }

    mapWidth: number
    mapHeight: number
    width: number
    height: number

    get towerDamageMultiplier(): number { return this.arcaneTowerCount * 0.25 + 1 }

    private constructor(container: HTMLElement) {
        this.container = container
        this.width = 1152
        this.height = 720
        this.mapWidth = 15
        this.mapHeight = 9
        container.style.margin = '0 auto'
        container.style.display = 'block'
        container.style.width = this.width + 'px'
        container.style.height = this.height + 'px'
        let canvas = document.createElement('canvas')
        canvas.id = 'game-canvas'
        canvas.width = this.width
        canvas.height = this.height
        canvas.style.border = '2px solid #606060'
        canvas.style.outline = 'none'
        this.ctx = <CanvasRenderingContext2D>canvas.getContext('2d')
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
        this.soundSystem = new SoundSystem()
        this.rangeMarkerRotation = 0
        this.hoveredElement = null
        this.paused = false
        this.mana = 20000 // TODO: set to 200
        this.lives = 2000 // TODO: set to 20
        this.screen = GameScreen.Intro
        this.showFPS = false
        this.gameSpeed = 1
    }

    private init(): Promise<void> {
        return this.soundSystem.init()
            .then(() => RgbaColor.init())
            .then(() => Vec2.init())
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
            this.gameSpeedButtons = [
                new GameSpeedButton(this, 0, panel1.x + 8, 8, 20, 20),
                new GameSpeedButton(this, 1, panel1.x + 36, 8, 20, 20),
                new GameSpeedButton(this, 2, panel1.x + 64, 8, 20, 20),
                new GameSpeedButton(this, 3, panel1.x + 92, 8, 20, 20)
            ]
            this.gameSpeedButtons[1].chosen = true
            for (let gameSpeedButton of this.gameSpeedButtons) {
                panel1.addItem(gameSpeedButton)
            }
            this.sellButton = new TextButton(
                this,
                panel1.x + 4, panel1.y + panel1.h - 52,
                panel1.w - 6, 48,
                'Sell Tower'
            )
            this.sellButton.onclick = () => {
                if (this.selectedTile && !this.paused) {
                    let t = this.selectedTile.sellTurret()
                    if (t) {
                        this.mana += t.count * 50
                    }
                }
            }
            panel1.addItem(this.sellButton)

            let panel2 = new GuiPanel(this, 0, 576, 1152, 144)
            this.guiPanels.push(panel2)
            this.guiPanels[0].addItem(panel2)
            this.upgradeButtons = []
            for (let e = TurretElement.Air, x = 4; e <= TurretElement.Water; ++e, x += 287) {
                let button = new TurretUpgradeButton(this, x, 582, 283, 134, e)
                this.upgradeButtons.push(button)
                panel2.addItem(button)
            }

            this.startGameButton = new TextButton(
                this,
                this.width / 2 - 160, this.height - 96,
                320, 64,
                'Start game'
            )
            this.startGameButton.borderColor = '#303030'
            this.startGameButton.fillColor = '#D8CA84'
            this.startGameButton.pressedFillColor = '#AF9A3B'
            this.startGameButton.font = '32px sans-serif'
            this.startGameButton.onclick = () => {
                this.startGameButton.enabled = false
                this.generateMap()
                    .then(() => this.preRender())
                    .then(() => new Promise<void>(resolve => {
                        this.screen = GameScreen.Game
                        resolve()
                    }))
            }

            this.resetGameButton = new TextButton(
                this,
                this.width / 2 - 160, this.height - 96,
                320, 64,
                'Back to menu'
            )
            this.resetGameButton.fillColor = '#400000'
            this.resetGameButton.pressedFillColor = '#602020'
            this.resetGameButton.borderColor = '#A08080'
            this.resetGameButton.textColor = '#FFE0E0'
            this.resetGameButton.font = '32px sans-serif'
            this.resetGameButton.onclick = () => {
                this.startGameButton.enabled = true
                this.projectiles.clear()
                this.particles.clear()
                this.enemies.clear()
                this.hoveredTilePos = null
                this.selectedTile = null
                this.mouseButton = null
                this.arcaneTowerCount = 0
                this.wavePlanner = new EnemyWavePlanner(this)
                this.hoveredElement = null
                this.paused = false
                this.mana = 200
                this.lives = 20
                this.setSpeed(1)
                this.screen = GameScreen.Intro
            }

            resolve()
        })
    }

    private initEvents(): Promise<void> {
        return new Promise<void>(resolve => {
            this.canvas.setAttribute('tabindex', '0')
            this.canvas.focus()
            this.canvas.addEventListener('contextmenu', (e: MouseEvent) => {
                e.preventDefault()
                return false
            }, false)
            let g = this
            this.canvas.addEventListener('mousemove', (e: MouseEvent) => g.onMouseMove(e))
            this.canvas.addEventListener('mousedown', (e: MouseEvent) => g.onMouseDown(e))
            this.canvas.addEventListener('mouseup', (e: MouseEvent) => g.onMouseUp(e))
            this.canvas.addEventListener('keydown', (e: KeyboardEvent) => g.onKeyDown(e))
            this.canvas.addEventListener('keyup', (e: KeyboardEvent) => g.onKeyUp(e))
            resolve()
        })
    }

    private generateIntroBackground(): Promise<void> {
        return Utils.getImageFromCache('td_intro_back').then(
            tex => { this.introBackground = tex },
            () => new Promise<void>(resolve => {
                let c = new CellularTextureGenerator(
                    256, 256, 2304,
                    new NoiseTextureGenerator(
                        256, 256,
                        RgbaColor.fromHex('#303030'),
                        0.05, 0, 1
                    ),
                    new FrostedGlassTextureGenerator(
                        256, 256,
                        RgbaColor.fromHex('#AF9A3B'),
                        RgbaColor.fromHex('#D8CA84'),
                        1, Curve.linear
                    ),
                    CellularTextureType.Net,
                    CellularTextureDistanceMetric.Euclidean,
                    Curve.arc
                ).generatePrImage()
                c.cacheImage('td_intro_back')
                this.introBackground = c.image
                resolve()
            })
        )
    }

    private generateMap(): Promise<void> {
        return new Promise<void>(resolve => {
            let mapGen: TileType[][] = []
            let map: (Tile | null)[][] = []
            let dijkstraMap: (DijkstraNode | null)[][] = []
            let wallGens = new Set<Vec2>()
            for (let x = 0; x < this.mapWidth; ++x) {
                let columnDijkstra: (DijkstraNode | null)[] = []
                let columnGen: TileType[] = []
                let column: (Tile | null)[] = []
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
            let queue = [dijkstraMap[1][0] = new DijkstraNode(1, startY)]
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
                if (x > 1 &&
                    dijkstraMap[x - 1][y] === null &&
                    mapGen[x - 1][y] === TileType.Unknown
                ) {
                    let node = new DijkstraNode(x - 1, y, dn)
                    dijkstraMap[x - 1][y] = node
                    queue.push(node)
                }
                if (y > 0 &&
                    dijkstraMap[x][y - 1] === null &&
                    mapGen[x][y - 1] === TileType.Unknown
                ) {
                    let node = new DijkstraNode(x, y - 1, dn)
                    dijkstraMap[x][y - 1] = node
                    queue.push(node)
                }
                if (x < this.mapWidth - 2 &&
                    dijkstraMap[x + 1][y] === null &&
                    mapGen[x + 1][y] === TileType.Unknown
                ) {
                    let node = new DijkstraNode(x + 1, y, dn)
                    dijkstraMap[x + 1][y] = node
                    queue.push(node)
                }
                if (y < this.mapHeight - 1 &&
                    dijkstraMap[x][y + 1] === null &&
                    mapGen[x][y + 1] === TileType.Unknown
                ) {
                    let node = new DijkstraNode(x, y + 1, dn)
                    dijkstraMap[x][y + 1] = node
                    queue.push(node)
                }
            }
            if (path === null) {
                throw new Error('Map generation not successful!')
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
                        (
                            x < this.mapWidth - 1 &&
                            y > 0 &&
                            mapGen[x + 1][y - 1] === TileType.Path
                        ) ||
                        (
                            x > 0 &&
                            y < this.mapHeight - 1 &&
                            mapGen[x - 1][y + 1] === TileType.Path
                        ) ||
                        (
                            x < this.mapWidth - 1 &&
                            y < this.mapHeight - 1 &&
                            mapGen[x + 1][y + 1] === TileType.Path
                        )
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
                } else {
                    break
                }
            }
            this.map[0][startY].next = this.map[1][startY]
            resolve()
        })
    }

    private generateCastle(): Promise<void> {
        return Utils.getImageFromCache('td_castle').then(
            tex => { this.castleImage = tex },
            () => new Promise<void>(resolve => {
                let c = new PreRenderedImage(192, 192)
                let castle = new RenderablePathSet()
                let path = new Path2D()
                path.rect(36, 36, 120, 120)
                let tex = new FrostedGlassTextureGenerator(192, 192, '#82614F', '#997663', 0.5)
                castle.pushNew(path, this.ctx.createPattern(tex.generateImage(), 'repeat'))
                let walls = [
                    [6, 6, 60, 60], [126, 6, 60, 60], [6, 126, 60, 60], [126, 126, 60, 60],
                    [30, 66, 12, 60], [66, 30, 60, 12], [150, 66, 12, 60], [66, 150, 60, 12]
                ]
                path = new Path2D()
                for (let w of walls) {
                    path.rect(w[0], w[1], w[2], w[3])
                }
                castle.pushNew(path, '#505050')
                path = new Path2D()
                path.rect(18, 18, 36, 36)
                path.rect(138, 18, 36, 36)
                path.rect(18, 138, 36, 36)
                path.rect(138, 138, 36, 36)
                castle.pushNew(path, '#404040')
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
                castle.pushNew(path, '#606060')
                castle.render(c.ctx)
                c.cacheImage('td_castle')
                this.castleImage = c.image
                resolve()
            }
        ))
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
            .then(() => intro(0)) // TODO: set to 4000
            .then(() => new Promise<void>(resolve => {
                this.container.appendChild(this.canvas)
                this.prevTime = new Date().getTime()
                resolve()
            }))
            .then(gameLoop)
    }

    private step(timeElapsed?: number): void {
        if (timeElapsed == undefined) {
            let time = new Date().getTime()
            let timeDiff = (time - this.prevTime) / 1000
            if (timeDiff <= 0) {
                return
            }
            this.performanceMeter.add(1 / timeDiff)
            timeDiff = Math.min(timeDiff * this.gameSpeed, 1)
            while (timeDiff > 0.035) {
                this.step(0.035)
                timeDiff -= 0.035
            }
            this.step(timeDiff)
            this.prevTime = time
            return
        }
        this.guiPanels[0].step(timeElapsed)
        switch (this.screen) {
            case GameScreen.Intro:
                this.startGameButton.step(timeElapsed)
                break
            case GameScreen.Game:
                if (!this.paused) {
                    let arcaneTowerCount = 0
                    for (let x = 0; x < this.mapWidth; ++x) {
                        for (let y = 0; y < this.mapHeight; ++y) {
                            let t = this.map[x][y]
                            t.step(timeElapsed)
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
                    this.wavePlanner.step(timeElapsed)
                    this.enemies.step(timeElapsed)
                    this.particles.step(timeElapsed)
                    this.projectiles.step(timeElapsed)
                    this.rangeMarkerRotation += timeElapsed * Angle.deg60
                    if (this.selectedTile && this.selectedTile.turret) {
                        let info = this.selectedTile.turret.getCurrentInfo()
                        if (info !== undefined) {
                            this.sellButton.enabled = true
                            this.sellButton.text =
                                'Sell tower for ' + (this.selectedTile.turret.getType().count * 50)
                        } else {
                            this.sellButton.enabled = false
                        }
                    } else {
                        this.sellButton.enabled = false
                    }
                    this.sellButton.visible = this.sellButton.enabled
                }
                break
            case GameScreen.End:
                this.resetGameButton.step(timeElapsed)
                break
        }
        this.time += timeElapsed
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
        let rect = this.canvas.getBoundingClientRect()
        this.mousePosition = new Vec2(
            Utils.clamp(Math.floor(e.clientX - rect.left), 0, this.width - 1),
            Utils.clamp(Math.floor(e.clientY - rect.top), 0, this.height - 1)
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
                let tp = new Vec2(
                    Math.floor(this.mousePosition.x / 64),
                    Math.floor(this.mousePosition.y / 64)
                )
                if (!tp.equals(this.hoveredTilePos)) {
                    this.hoveredTilePos = null
                }
                break
            case GameScreen.End:
                this.resetGameButton.onMouseMove()
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
                if (this.paused) {
                    this.guiPanels[1].onMouseDown(e.button)
                } else {
                    this.guiPanels[0].onMouseDown(e.button)
                    let tp = new Vec2(
                        Math.floor(this.mousePosition.x / 64),
                        Math.floor(this.mousePosition.y / 64)
                    )
                    if (tp.x < this.mapWidth && tp.y < this.mapHeight) {
                        this.hoveredTilePos = tp
                        this.mouseButton = e.button
                    }
                }
                break
            case GameScreen.End:
                this.resetGameButton.onMouseDown(e.button)
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
                if (this.paused) {
                    this.guiPanels[1].onMouseUp(e.button)
                } else {
                    this.guiPanels[0].onMouseUp(e.button)
                    if (this.hoveredTilePos) {
                        this.selectedTile = this.hoveredTile
                        for (const b of this.upgradeButtons) {
                            b.targetTile = this.selectedTile
                        }
                        this.hoveredTilePos = null
                    }
                    this.mouseButton = null
                }
                break
            case GameScreen.End:
                this.resetGameButton.onMouseUp(e.button)
                break
        }
    }

    private onKeyDown(e: KeyboardEvent): void {
        switch (e.code) {
            case 'KeyC':
                if (e.altKey) {
                    localStorage.clear()
                    alert('Cache cleared.')
                }
                break
            case 'KeyD': // TODO: remove
                this.wavePlanner.nextWave()
                break
            case 'KeyP':
            case 'Digit0':
            case 'Numpad0':
                this.setSpeed(0)
                break
            case 'Space':
                this.setSpeed(this.paused ? 1 : 0)
                break
            case 'KeyF':
                this.showFPS = !this.showFPS
                break
            case 'Digit1':
            case 'Numpad1':
                this.setSpeed(1)
                break
            case 'Digit2':
            case 'Numpad2':
                this.setSpeed(2)
                break
            case 'Digit3':
            case 'Numpad3':
                this.setSpeed(3)
                break
        }
    }

    private onKeyUp(e: KeyboardEvent): void { }

    private preRender(): Promise<void> {
        return new Promise<void>(resolve => {
            let c = new PreRenderedImage(this.width, this.height)
            let ctx = c.ctx
            ctx.fillStyle = '#C0C0C0'
            ctx.fillRect(0, 0, this.width, this.height)
            for (let x = 0; x < this.mapWidth; ++x) {
                for (let y = 0; y < this.mapHeight; ++y) {
                    this.map[x][y].render(ctx, true)
                }
            }
            ctx.fillStyle = '#B5947E'
            let x = this.guiPanels[1].x, y = this.guiPanels[1].bottom
            for (let i = 0; i < 9; ++i) {
                Tile.drawPathGround(ctx, x + i % 3 * 64, y + Math.floor(i / 3) * 64)
            }
            ctx.fillStyle = '#606060'
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
                ctx.fillStyle = <CanvasPattern>ctx.createPattern(this.introBackground, 'repeat')
                ctx.fillRect(0, 0, this.width, this.height)
                ctx.lineJoin = 'round'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.font = 'bold 112px sans-serif'
                ctx.strokeStyle = '#00000060'
                for (let i = 64; i >= 16; i -= 12) {
                    ctx.lineWidth = i
                    ctx.strokeText('Towers of Akria', this.width / 2, this.height / 4)
                }
                ctx.fillStyle = '#C3B15F'
                ctx.fillText('Towers of Akria', this.width / 2, this.height / 4)
                this.startGameButton.render(ctx)
                break
            case GameScreen.Game:
                this.renderGame()
                break
            case GameScreen.End:
                ctx.fillStyle = '#400000'
                ctx.fillRect(0, 0, this.width, this.height)
                ctx.fillStyle = '#FFE0E0'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.font = '96px monospace'
                ctx.fillText('GAME OVER', this.width / 2, this.height * 0.33)
                ctx.font = '40px monospace'
                ctx.fillText(
                    'You survived ' + (this.wavePlanner.waveNumber - 1) + ' waves',
                    this.width / 2,
                    this.height * 0.67
                )
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
        if (this.selectedTile && this.selectedTile.turret) {
            let info = this.selectedTile.turret.getCurrentInfo()
            if (info !== undefined) {
                ctx.fillStyle = '#606060'
                let p = this.guiPanels[1]
                ctx.fillRect(p.x + 4, p.y + 224, p.w - 6, p.h - 228)
                ctx.fillStyle = '#C0C0C0'
                ctx.fillRect(p.x + 6, p.y + 226, p.w - 10, p.h - 232)
                ctx.fillStyle = '#000000'
                ctx.textAlign = 'left'
                ctx.textBaseline = 'top'
                ctx.font = 'bold 14px serif'
                ctx.fillText(info.name, p.x + 12, p.y + 232)
                ctx.font = '12px monospace'
                ctx.fillText('Range:   ' + info.range, p.x + 12, p.y + 254)
                ctx.fillText('Max DPS: ' + info.dps, p.x + 12, p.y + 272)
                if (info.effect != null) {
                    let _y = p.y + 290
                    for (let line of info.effect.split(', ')) {
                        ctx.fillText(line, p.x + 12, _y)
                        _y += 18
                    }
                }
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
            let {x, y} = this.selectedTile.pos.addu(32, 32)
            this.renderRangeMarker(ctx, x, y, range, '#00000060')
            if (this.hoveredElement !== null) {
                let info = this.selectedTile.turret.getInfoAfterUpgrade(this.hoveredElement)
                if (info) {
                    this.renderRangeMarker(ctx, x, y, info.range, '#40404040')
                }
            }
        }

        ctx.fillStyle = '#000000'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.font = 'bold 24px monospace'
        ctx.fillText(
            'WAVE:  ' + this.wavePlanner.waveNumber,
            this.guiPanels[1].x + 8,
            this.guiPanels[1].y + 40
        )
        ctx.fillText('MANA:  ' + this.mana, this.guiPanels[1].x + 8, this.guiPanels[1].y + 68)
        ctx.fillText('LIVES: ' + this.lives, this.guiPanels[1].x + 8, this.guiPanels[1].y + 96)
        if (this.showFPS) {
            let fps = this.performanceMeter.getFps()
            if (!isNaN(fps)) {
                ctx.fillText(
                    'FPS:   ' + Math.floor(fps),
                    this.guiPanels[1].x + 8,
                    this.guiPanels[1].y + 128
                )
            }
        }

        if (this.paused) {
            ctx.fillStyle = '#20202080'
            ctx.fillRect(0, 0, this.width, this.height)
            ctx.fillStyle = '#E0E0E0'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.font = 'bold 32px monospace'
            ctx.fillText('Paused', this.width / 2, this.height / 2)
        }
    }

    renderRangeMarker(
        ctx: CanvasRenderingContext2D,
        x: number, y: number,
        range: number,
        color: string
    ): void {
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

    setSpeed(speed: number): void {
        this.paused = speed == 0
        this.gameSpeed = speed < 1 ? 1 : speed
        this.gameSpeedButtons[0].chosen = speed == 0
        this.gameSpeedButtons[1].chosen = speed == 1
        this.gameSpeedButtons[2].chosen = speed == 2
        this.gameSpeedButtons[3].chosen = speed == 3
        if (this.screen === GameScreen.Game) {
            return
        } else if (!this.paused && speed == 0) {
            this.soundSystem.muted = true
        } else if (this.paused && speed > 0 && !this.muted) {
            this.soundSystem.muted = false
        }
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
        if (enemyWave < 25) {
            this.mana += 4 + Math.floor(enemyWave * 0.25)
        } else if (enemyWave < 50) {
            this.mana += 10 + Math.floor((enemyWave - 24) * 0.2)
        } else {
            this.mana += 15 + Math.floor((enemyWave - 49) * 0.1)
        }
    }

    getUpgradeCost(upgradeCostMultiplier: number): number {
        return 100 * upgradeCostMultiplier
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

    createSound(name: string, looping: boolean): Sound {
        return this.soundSystem.createPaused(name, looping)
    }

    playSound(name: string): Sound {
        return this.soundSystem.play(name)
    }

    loopSound(name: string): Sound {
        return this.soundSystem.loop(name)
    }

    static initializeAndRun(
        introInit: Promise<void>,
        intro: (duration: number) => Promise<void>
    ): void {
        let container = document.getElementById('zptd-game-container')
        if (container == null) {
            throw new Error('Html element with id "zptd-game-container" not found')
        } else {
            new Game(container).start(introInit, intro)
        }
    }
}
