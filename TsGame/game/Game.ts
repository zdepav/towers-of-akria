/// <reference path='turrets.ts'/>
/// <reference path='utils.ts'/>
/// <reference path="TurretType.ts"/>
/// <reference path="particles.ts"/>

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

    private static tiles: CanvasImageSource

    private decor: RenderablePathSet

    game: Game
    pos: Vec2
    type: TileType
    turret: Turret | null

    constructor(game: Game, x: number, y: number, type: TileType, ctx: CanvasRenderingContext2D) {
        this.game = game
        this.type = type
        this.turret = null
        this.pos = new Vec2(x, y)
        this.decor = new RenderablePathSet()
        if (type === TileType.Path || type === TileType.Spawn || type === TileType.HQ) {
            let path = new Path2D()
            for (let i = 0; i < 4; ++i) {
                for (let j = 0; j < 4; ++j) {
                    if (Math.random() < 0.25) {
                        let _x = x + i * 16 + 4 + Math.random() * 8
                        let _y = y + j * 16 + 4 + Math.random() * 8
                        let radius = 2 + 2 * Math.random()
                        for (let k = 0; k < 4; ++k) {
                            let a = -Angle.deg45 + Angle.deg90 * (k + 0.25 + 0.5 * Math.random())
                            if (k === 0) {
                                path.moveTo(Utils.ldx(radius, a, _x), Utils.ldy(radius, a, _y))
                            } else {
                                path.lineTo(Utils.ldx(radius, a, _x), Utils.ldy(radius, a, _y))
                            }
                        }
                        path.closePath()
                    }
                }
            }
            if (type === TileType.Spawn) {
                let gradient = ctx.createLinearGradient(x, y + 32, x + 64, y + 32)
                gradient.addColorStop(0, "#CB5E48")
                gradient.addColorStop(1, "#997761")
                this.decor.pushNew(path, gradient)
            } else {
                this.decor.pushNew(path, "#997761")
            }
        } else if (type === TileType.Empty) {
            let path1 = new Path2D()
            let path2 = new Path2D()
            for (let i = 0; i < 3; ++i) {
                for (let j = 0; j < 3; ++j) {
                    if (Math.random() < 0.25) {
                        let path = Math.random() < 0.5 ? path1 : path2
                        path.arc(
                            x + 6 + 21 * i + Math.random() * 10,
                            y + 6 + 21 * j + Math.random() * 10,
                            4 + 2 * Math.random(),
                            0,
                            Angle.deg360
                        )
                        path.closePath()
                    }
                }
            }
            this.decor.pushNew(path1, "#337F1C")
            this.decor.pushNew(path2, "#479131")
        } else if (type === TileType.Tower) {
            this.decor.pushPolygon([0, 0, 62, 0, 62, 2, 2, 2, 2, 62, 0, 62], "#A0A0A0", x, y)
            this.decor.pushPolygon([62, 2, 64, 2, 64, 64, 2, 64, 2, 62, 62, 62], "#606060", x, y)
            this.decor.pushPolygon([56, 8, 58, 8, 58, 58, 8, 58, 8, 56, 56, 56], "#909090", x, y)
            this.decor.pushPolygon([6, 6, 56, 6, 56, 8, 8, 8, 8, 56, 6, 56], "#707070", x, y)
            this.turret = new Turret(this)
        }
    }

    step(time: number) {
        if (this.type === TileType.Tower && this.turret != null) {
            this.turret.step(time)
        }
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean) {
        if (preRender) {
            switch (this.type) {
                case TileType.Empty:
                    ctx.drawImage(Tile.tiles, 0, 0, 64, 64, this.pos.x, this.pos.y, 64, 64)
                    break
                case TileType.Path:
                    ctx.drawImage(Tile.tiles, 0, 64, 64, 64, this.pos.x, this.pos.y, 64, 64)
                    break
                case TileType.Spawn:
                    ctx.drawImage(Tile.tiles, 0, 128, 64, 64, this.pos.x, this.pos.y, 64, 64)
                    break
                case TileType.HQ:
                    ctx.drawImage(Tile.tiles, 0, 64, 64, 64, this.pos.x, this.pos.y, 64, 64)
                    break
                case TileType.Tower:
                    ctx.fillStyle = "#808080"
                    ctx.fillRect(this.pos.x, this.pos.y, 64, 64)
                    break
            }
            this.decor.render(ctx)
        } else if (this.type === TileType.Tower && this.turret != null) {
            this.turret.render(ctx, preRender)
            var elems = this.turret.getType().toColorArray()
            var x = this.pos.x + 2
            var y = this.pos.y + 2
            for (const c of elems) {
                ctx.fillStyle = c
                ctx.fillRect(x, y, 4, 4)
                x += 6
            }
        }
    }

    onClick(button: MouseButton, x: number, y: number) {
        if (this.type == TileType.Tower && this.turret != null && this.game.selectedTurretElement != null) {
            switch (button) {
                case MouseButton.Left:
                    if (this.turret.upgradeCostMultiplier(this.game.selectedTurretElement) > 0) {
                        this.turret.addType(this.game.selectedTurretElement)
                    }
                    break;
                case MouseButton.Right:
                    this.turret = new Turret(this)
                    break;
            }
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache("td_tiles").then(
            tex => { Tile.tiles = tex },
            () => new Promise<void>(resolve => {
                let c = new PreRenderedImage(64, 192)
                let ctx = c.ctx
                new NoiseTextureGenerator(64, 64, "#5BA346", 0.075, 0, 0.25).generateInto(ctx, 0, 0)
                new NoiseTextureGenerator(64, 128, "#B5947E", 0.04, 0, 0.2).generateInto(ctx, 0, 64)
                let grad = ctx.createLinearGradient(0, 160, 64, 160)
                grad.addColorStop(0, "#E77B65")
                grad.addColorStop(1, "#E77B6500")
                ctx.fillStyle = grad
                ctx.fillRect(0, 128, 64, 64)
                c.cacheImage("td_tiles")
                Tile.tiles = c.image
                resolve()
            })
        )
    }

    static drawPathGround(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.drawImage(Tile.tiles, 0, 64, 64, 64, x, y, 64, 64)
    }

}

enum InitializationStatus {
    Uninitialized,
    Initializing,
    Initialized
}

class Game {

    static saveImages = true // for debug purposes

    private status: InitializationStatus
    private preRendered: CanvasImageSource
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private guiPanel: Rect
    private map: Tile[][]
    //private enemies: GameItem[]
    private castle: RenderablePathSet
    private prevTime: number
    private time: number
    private performanceMeter: PerformanceMeter
    private mousePosition: Vec2
    private selectedTilePos: Vec2 | null
    private mouseButton: MouseButton | null

    private get selectedTile(): Tile | null {
        return this.selectedTilePos !== null ? this.map[this.selectedTilePos.x][this.selectedTilePos.y] : null
    }

    mapWidth: number
    mapHeight: number
    width: number
    height: number
    particles: ParticleSystem
    selectedTurretElement: TurretElement | null

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
        this.particles = new ParticleSystem(this)
        this.selectedTurretElement = null
        this.selectedTilePos = null
        this.mouseButton = null
        this.status = InitializationStatus.Uninitialized

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
        return Tile.init()
            .then(() => Turret.initAll())
            .then(() => this.generateMap())
            .then(() => this.generateCastle())
            .then(() => this.preRender())
            .then(() => new Promise<void>(resolve => {
                this.canvas.setAttribute("tabindex", "0")
                this.canvas.focus()
                this.canvas.addEventListener("contextmenu", (e: MouseEvent) => {
                    e.preventDefault()
                    return false;
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

    private generateMap() {
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
        while (queue.length > 0) {
            let dn: DijkstraNode | null = queue.shift() as DijkstraNode
            let x = dn.pos.x
            let y = dn.pos.y
            if (x === this.mapWidth - 2 && y === endY) {
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
        this.map = map as Tile[][] // all tiles are initialized by now
    }

    private generateCastle() {
        this.castle = new RenderablePathSet()
        let x = this.guiPanel.x
        let y = this.height - 192
        let path = new Path2D()
        path.rect(x + 36, y + 36, 120, 120)
        let tex = new FrostedGlassTextureGenerator(192, 192, "#82614F", "#997663", 0.5)
        this.castle.pushNew(path, this.ctx.createPattern(tex.generateImage(), "repeat"))
        let walls = [
            [6, 6, 60, 60], [126, 6, 60, 60], [6, 126, 60, 60], [126, 126, 60, 60],
            [30, 66, 12, 60], [66, 30, 60, 12], [150, 66, 12, 60], [66, 150, 60, 12]
        ]
        path = new Path2D()
        for (let w of walls) {
            path.rect(x + w[0], y + w[1], w[2], w[3])
        }
        this.castle.pushNew(path, "#505050")
        path = new Path2D()
        path.rect(x + 18, y + 18, 36, 36)
        path.rect(x + 138, y + 18, 36, 36)
        path.rect(x + 18, y + 138, 36, 36)
        path.rect(x + 138, y + 138, 36, 36)
        this.castle.pushNew(path, "#404040")
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
            path.rect(x + pts[i], y + pts[i + 1], 12, 12)
        }
        this.castle.pushNew(path, "#606060")
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
                for (let x = 0; x < this.mapWidth; ++x) {
                    for (let y = 0; y < this.mapHeight; ++y) {
                        this.map[x][y].step(timeDiff)
                    }
                }
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

    private preRender() {
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
        this.castle.render(ctx)
        this.preRendered = c.image
    }

    private render() {
        switch (this.status) {
            case InitializationStatus.Uninitialized:
            case InitializationStatus.Initializing: {
                this.ctx.fillStyle = "#C0C0C0"
                this.ctx.fillRect(0, 0, this.width, this.height)
                this.ctx.fillStyle = "#000000"
                this.ctx.textAlign = "center"
                this.ctx.textBaseline = "middle"
                this.ctx.font = "bold 32px serif"
                this.ctx.fillText("Loading", this.width / 2, this.height / 2)
                return
            }
            case InitializationStatus.Initialized: {
                this.ctx.drawImage(this.preRendered, 0, 0)
                for (let x = 0; x < this.mapWidth; ++x) {
                    for (let y = 0; y < this.mapHeight; ++y) {
                        this.map[x][y].render(this.ctx, false)
                    }
                }
                this.particles.render(this.ctx, false)
                let fps = this.performanceMeter.getFps()
                this.ctx.fillStyle = "#000000"
                this.ctx.textAlign = "right"
                this.ctx.textBaseline = "top"
                this.ctx.font = "bold 16px serif"
                if (!isNaN(fps)) {
                    this.ctx.fillText(Math.floor(fps).toString(), this.guiPanel.x + this.guiPanel.w - 16, this.guiPanel.y + 16)
                }
                this.ctx.fillText(this.mousePosition.x.toString(), this.guiPanel.x + this.guiPanel.w - 16, this.guiPanel.y + 32)
                this.ctx.fillText(this.mousePosition.y.toString(), this.guiPanel.x + this.guiPanel.w - 16, this.guiPanel.y + 48)
                return
            }
        }
    }

    static initializeAndRun() {
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
