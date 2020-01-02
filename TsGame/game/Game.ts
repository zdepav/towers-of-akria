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

    private static grassTex: CanvasImageSource
    private static spawnTex: CanvasImageSource
    static pathTex: CanvasImageSource

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
                    ctx.drawImage(Tile.grassTex, this.pos.x, this.pos.y)
                    break
                case TileType.Path:
                    ctx.drawImage(Tile.pathTex, this.pos.x, this.pos.y)
                    break
                case TileType.Spawn:
                    ctx.drawImage(Tile.spawnTex, this.pos.x, this.pos.y)
                    break
                case TileType.HQ:
                    ctx.drawImage(Tile.pathTex, this.pos.x, this.pos.y)
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

    static init() {
        Tile.grassTex = new NoiseTextureGenerator(64, 64, "#5BA346", 0.075, 0, 0.25).generateImage()
        let pathTex = new NoiseTextureGenerator(64, 64, "#B5947E", 0.04, 0, 0.2)
        Tile.pathTex = pathTex.generateImage()
        let grad = new LinearGradientSource(64, 64, 0, 32, 64, 32)
        grad.addColorStop(0, "#E77B65")
        grad.addColorStop(1, pathTex)
        Tile.spawnTex = grad.generateImage()
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

}

class Game {

    static saveImages = false // for debug purposes

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

    constructor(canvas: HTMLCanvasElement) {
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

        let canvasWidth = canvas.width
        let mapWidth = Math.floor(canvasWidth / 64) - 3
        mapWidth = mapWidth % 2 === 0 ? mapWidth - 1 : mapWidth
        this.mapWidth = mapWidth < 3 ? 3 : mapWidth
        this.width = (mapWidth + 3) * 64

        let canvasHeight = canvas.height
        let mapHeight = Math.floor(canvasHeight / 64)
        mapHeight = mapHeight % 2 === 0 ? mapHeight - 1 : mapHeight
        this.mapHeight = mapHeight < 3 ? 3 : mapHeight
        this.height = mapHeight * 64

        this.guiPanel = new Rect(this.width - 192, 0, 192, this.height - 192)
    }

    init() {
        Tile.init()
        Turret.init()
        this.generateMap()
        this.generateCastle()
        this.preRender()
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
    }

    private generateMap() {
        let mapGen: TileType[][] = []
        let map: (Tile | null)[][] = []
        let dijkstraMap: (DijkstraNode | null)[][] = []
        let wallGens = new Vec2Set()
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
            wallGens.remove(wg)
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
        let points = [
            [6, 6, 60, 60], [126, 6, 60, 60], [6, 126, 60, 60], [126, 126, 60, 60],
            [30, 66, 12, 60], [66, 30, 60, 12], [150, 66, 12, 60], [66, 150, 60, 12]
        ]
        path = new Path2D()
        for (let p of points) {
            path.rect(x + p[0], y + p[1], p[2], p[3])
        }
        this.castle.pushNew(path, "#505050")
        points = [[18, 18, 36, 36], [138, 18, 36, 36], [18, 138, 36, 36], [138, 138, 36, 36]]
        path = new Path2D()
        for (let p of points) {
            path.rect(x + p[0], y + p[1], p[2], p[3])
        }
        this.castle.pushNew(path, "#404040")
        points = [
            [6, 6, 12, 12], [30, 6, 12, 12], [54, 6, 12, 12], [126, 6, 12, 12], [150, 6, 12, 12], [174, 6, 12, 12],
            [6, 30, 12, 12], [54, 30, 12, 12], [78, 30, 12, 12], [102, 30, 12, 12], [126, 30, 12, 12], [174, 30, 12, 12],
            [6, 54, 12, 12], [30, 54, 12, 12], [54, 54, 12, 12], [126, 54, 12, 12], [150, 54, 12, 12], [174, 54, 12, 12],
            [30, 78, 12, 12], [150, 78, 12, 12], [30, 102, 12, 12], [150, 102, 12, 12],
            [6, 126, 12, 12], [30, 126, 12, 12], [54, 126, 12, 12], [126, 126, 12, 12], [150, 126, 12, 12], [174, 126, 12, 12],
            [6, 150, 12, 12], [54, 150, 12, 12], [78, 150, 12, 12], [102, 150, 12, 12], [126, 150, 12, 12], [174, 150, 12, 12],
            [6, 174, 12, 12], [30, 174, 12, 12], [54, 174, 12, 12], [126, 174, 12, 12], [150, 174, 12, 12], [174, 174, 12, 12]
        ]
        path = new Path2D()
        for (let p of points) {
            path.rect(x + p[0], y + p[1], p[2], p[3])
        }
        this.castle.pushNew(path, "#606060")
    }

    run() {
        this.step()
        this.render()
    }

    private step() {
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
    }

    private setMousePosition(e: MouseEvent) {
        var rect = this.canvas.getBoundingClientRect()
        this.mousePosition = new Vec2(
            Utils.clamp(Math.floor(e.clientX - rect.left), 0, this.width - 1),
            Utils.clamp(Math.floor(e.clientY - rect.top), 0, this.width - 1)
        )
    }

    private onMouseMove(e: MouseEvent) {
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
        this.setMousePosition(e)
        let tp = new Vec2(Math.floor(this.mousePosition.x / 64), Math.floor(this.mousePosition.y / 64))
        if (tp.x < this.mapWidth && tp.y < this.mapHeight) {
            this.selectedTilePos = tp
            this.mouseButton = e.button
        }
    }

    private onMouseUp(e: MouseEvent) {
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
        }
    }

    private onKeyUp(e: KeyboardEvent) { }

    private preRender() {
        let c = new PreRenderedImage(this.width, this.height)
        c.ctx.fillStyle = "#C0C0C0"
        c.ctx.fillRect(0, 0, this.width, this.height)
        for (let x = 0; x < this.mapWidth; ++x) {
            for (let y = 0; y < this.mapHeight; ++y) {
                this.map[x][y].render(c.ctx, true)
            }
        }
        c.ctx.fillStyle = "#B5947E"
        let x = this.guiPanel.x, y = this.height - 192
        for (let i = 0; i < 9; ++i) {
            c.ctx.drawImage(Tile.pathTex, x + i % 3 * 64, y + Math.floor(i / 3) * 64)
        }
        c.ctx.fillStyle = "#606060"
        c.ctx.fillRect(this.guiPanel.x, this.guiPanel.y, 2, this.guiPanel.h)
        c.ctx.fillRect(this.guiPanel.x, this.guiPanel.y + this.guiPanel.h - 2, this.guiPanel.w, 2)
        this.castle.render(c.ctx)
        if (Game.saveImages) { c.saveImage("td_map") }
        this.preRendered = c.image
    }

    private render() {
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
    }

}