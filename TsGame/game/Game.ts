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

    private groundFill: string | CanvasPattern | CanvasGradient
    private decor: RenderablePathSet

    game: Game
    pos: Vec2
    type: TileType
    turret: Turret

    constructor(game: Game, x: number, y: number, type: TileType, ctx: CanvasRenderingContext2D) {
        this.game = game
        this.type = type
        this.turret = null
        this.pos = new Vec2(x, y)
        this.decor = new RenderablePathSet()
        switch (type) {
            case TileType.Empty:
                this.groundFill = ctx.createPattern(Tile.grassTex, "repeat") // "#5BA346"
                break
            case TileType.Path:
                this.groundFill = ctx.createPattern(Tile.pathTex, "repeat") // "#B5947E"
                break
            case TileType.Spawn:
                this.groundFill = ctx.createPattern(Tile.spawnTex, "repeat")
                /*  let spawnGradient = ctx.createLinearGradient(x, y + 32, x + 64, y + 32)
                    spawnGradient.addColorStop(0, "#E77B65")
                    spawnGradient.addColorStop(1, "#B5947E")
                    this.groundFill = spawnGradient */
                break
            case TileType.HQ:
                this.groundFill = ctx.createPattern(Tile.pathTex, "repeat") // "#B5947E"
                break
            case TileType.Tower:
                this.groundFill = "#808080"
                this.turret = new Turret(this)
                break
        }
        if (this.type === TileType.Path || this.type === TileType.Spawn || this.type === TileType.HQ) {
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
            if (this.type === TileType.Spawn) {
                let gradient = ctx.createLinearGradient(x, y + 32, x + 64, y + 32)
                gradient.addColorStop(0, "#CB5E48")
                gradient.addColorStop(1, "#997761")
                this.decor.pushNew(path, gradient)
            } else {
                this.decor.pushNew(path, "#997761")
            }
        } else if (this.type === TileType.Empty) {
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
        } else if (this.type === TileType.Tower) {
            let path1 = new Path2D()
            path1.moveTo(x, y)
            path1.lineTo(x + 62, y)
            path1.lineTo(x + 62, y + 2)
            path1.lineTo(x + 2, y + 2)
            path1.lineTo(x + 2, y + 62)
            path1.lineTo(x, y + 62)
            path1.closePath()
            this.decor.pushNew(path1, "#A0A0A0")
            let path2 = new Path2D()
            path2.moveTo(x + 62, y + 2)
            path2.lineTo(x + 64, y + 2)
            path2.lineTo(x + 64, y + 64)
            path2.lineTo(x + 2, y + 64)
            path2.lineTo(x + 2, y + 62)
            path2.lineTo(x + 62, y + 62)
            path2.closePath()
            this.decor.pushNew(path2, "#606060")
            let path3 = new Path2D()
            path3.moveTo(x + 56, y + 8)
            path3.lineTo(x + 58, y + 8)
            path3.lineTo(x + 58, y + 58)
            path3.lineTo(x + 8, y + 58)
            path3.lineTo(x + 8, y + 56)
            path3.lineTo(x + 56, y + 56)
            path3.closePath()
            this.decor.pushNew(path3, "#909090")
            let path4 = new Path2D()
            path4.moveTo(x + 6, y + 6)
            path4.lineTo(x + 56, y + 6)
            path4.lineTo(x + 56, y + 8)
            path4.lineTo(x + 8, y + 8)
            path4.lineTo(x + 8, y + 56)
            path4.lineTo(x + 6, y + 56)
            path4.closePath()
            this.decor.pushNew(path4, "#707070")
        }
    }

    step(time: number) {
        if (this.type === TileType.Tower && this.turret != null) {
            this.turret.step(time)
        }
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean) {
        if (preRender) {
            ctx.fillStyle = this.groundFill
            ctx.fillRect(this.pos.x, this.pos.y, 64, 64)
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

    onClick(button: MouseButton, x: number, y: number) { }

}

class Game {

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
    private selectedTurretElement: TurretElement | null

    mapWidth: number
    mapHeight: number
    width: number
    height: number
    particles: ParticleSystem

    constructor(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d")
        this.canvas = canvas
        this.prevTime = new Date().getTime()
        this.time = 0
        this.mousePosition = Vec2.zero
        this.performanceMeter = new PerformanceMeter()
        this.particles = new ParticleSystem(this)
        this.selectedTurretElement = null

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
        this.canvas.addEventListener("contextmenu", (e: MouseEvent) => {
            e.preventDefault()
            return false;
        }, false)
        let g = this
        this.canvas.addEventListener("mousemove", (e: MouseEvent) => g.onMouseMove(e), false)
        this.canvas.addEventListener("mousedown", (e: MouseEvent) => g.onMouseDown(e), false)
        this.canvas.addEventListener("mouseup", (e: MouseEvent) => g.onMouseUp(e), false)
        this.canvas.addEventListener("keydown", (e: KeyboardEvent) => g.onKeyDown(e), false)
        this.canvas.addEventListener("keyup", (e: KeyboardEvent) => g.onKeyUp(e), false)
    }

    private generateMap() {
        let mapGen: TileType[][] = []
        this.map = []
        let dijkstraMap: DijkstraNode[][] = []
        let wallGens: Set<Vec2> = new Set<Vec2>()
        for (let x = 0; x < this.mapWidth; ++x) {
            var columnDijkstra: DijkstraNode[] = []
            var columnGen: TileType[] = []
            var column: Tile[] = []
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
            this.map.push(column)
        }
        while (wallGens.size > 0) {
            let wg: Vec2
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
        let startNode = new DijkstraNode(1, startY, null)
        dijkstraMap[1][0] = startNode
        let queue = [dijkstraMap[1][0]]
        while (queue.length > 0) {
            let dn = queue.shift()
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
                    this.map[x][y] = new Tile(this, x * 64, y * 64, TileType.Spawn, this.ctx)
                } else if (mapGen[x][y] === TileType.HQ) {
                    this.map[x][y] = new Tile(this, x * 64, y * 64, TileType.HQ, this.ctx)
                } else if (mapGen[x][y] === TileType.Path) {
                    this.map[x][y] = new Tile(this, x * 64, y * 64, TileType.Path, this.ctx)
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
                    this.map[x][y] = new Tile(this, x * 64, y * 64, TileType.Tower, this.ctx)
                    let r = Math.random()
                    /*if (r < 0.8) {
                        this.map[x][y].turret.addType(TurretElement.Earth)
                    }
                    if (r < 0.6) {
                        this.map[x][y].turret.addType(TurretElement.Earth)
                    }
                    if (r < 0.4) {
                        this.map[x][y].turret.addType(TurretElement.Earth)
                    }
                    if (r < 0.2) {
                        this.map[x][y].turret.addType(TurretElement.Earth)
                    }*/
                    let t = this.map[x][y].turret
                    if (r < 0.2) {
                        t.addType(TurretElement.Air)
                    } else if (r < 0.4) {
                        t.addType(TurretElement.Earth)
                    } else if (r < 0.6) {
                        t.addType(TurretElement.Fire)
                    } else if (r < 0.8) {
                        t.addType(TurretElement.Water)
                    }
                    r = Math.random()
                    t = this.map[x][y].turret
                    if (r < 0.15) {
                        t.addType(TurretElement.Air)
                    } else if (r < 0.3) {
                        t.addType(TurretElement.Earth)
                    } else if (r < 0.45) {
                        t.addType(TurretElement.Fire)
                    } else if (r < 0.6) {
                        t.addType(TurretElement.Water)
                    }
                    r = Math.random()
                    t = this.map[x][y].turret
                    if (r < 0.1) {
                        t.addType(TurretElement.Air)
                    } else if (r < 0.2) {
                        t.addType(TurretElement.Earth)
                    } else if (r < 0.3) {
                        t.addType(TurretElement.Fire)
                    } else if (r < 0.4) {
                        t.addType(TurretElement.Water)
                    }
                    r = Math.random()
                    t = this.map[x][y].turret
                    if (r < 0.05) {
                        t.addType(TurretElement.Air)
                    } else if (r < 0.1) {
                        t.addType(TurretElement.Earth)
                    } else if (r < 0.15) {
                        t.addType(TurretElement.Fire)
                    } else if (r < 0.2) {
                        t.addType(TurretElement.Water)
                    }
                } else {
                    this.map[x][y] = new Tile(this, x * 64, y * 64, TileType.Empty, this.ctx)
                }
            }
        }
    }

    private generateCastle() {
        this.castle = new RenderablePathSet()
        let x = this.guiPanel.x
        let y = this.height - 192
        let path1 = new Path2D()
        path1.rect(x + 36, y + 36, 120, 120)
        let tex = new FrostedGlassTextureGenerator(192, 192, "#82614F", "#997663", 0.5)
        this.castle.pushNew(path1, this.ctx.createPattern(tex.generateImage(), "repeat"))
        let path2 = new Path2D()
        path2.rect(x + 6, y + 6, 60, 60)
        path2.rect(x + 126, y + 6, 60, 60)
        path2.rect(x + 6, y + 126, 60, 60)
        path2.rect(x + 126, y + 126, 60, 60)
        path2.rect(x + 30, y + 66, 12, 60)
        path2.rect(x + 66, y + 30, 60, 12)
        path2.rect(x + 150, y + 66, 12, 60)
        path2.rect(x + 66, y + 150, 60, 12)
        this.castle.pushNew(path2, "#505050")
        let path3 = new Path2D()
        path3.rect(x + 18, y + 18, 36, 36)
        path3.rect(x + 138, y + 18, 36, 36)
        path3.rect(x + 18, y + 138, 36, 36)
        path3.rect(x + 138, y + 138, 36, 36)
        this.castle.pushNew(path3, "#404040")
        let path4 = new Path2D()
        path4.rect(x + 6, y + 6, 12, 12)
        path4.rect(x + 30, y + 6, 12, 12)
        path4.rect(x + 54, y + 6, 12, 12)
        path4.rect(x + 126, y + 6, 12, 12)
        path4.rect(x + 150, y + 6, 12, 12)
        path4.rect(x + 174, y + 6, 12, 12)
        path4.rect(x + 6, y + 30, 12, 12)
        path4.rect(x + 54, y + 30, 12, 12)
        path4.rect(x + 78, y + 30, 12, 12)
        path4.rect(x + 102, y + 30, 12, 12)
        path4.rect(x + 126, y + 30, 12, 12)
        path4.rect(x + 174, y + 30, 12, 12)
        path4.rect(x + 6, y + 54, 12, 12)
        path4.rect(x + 30, y + 54, 12, 12)
        path4.rect(x + 54, y + 54, 12, 12)
        path4.rect(x + 126, y + 54, 12, 12)
        path4.rect(x + 150, y + 54, 12, 12)
        path4.rect(x + 174, y + 54, 12, 12)
        path4.rect(x + 30, y + 78, 12, 12)
        path4.rect(x + 150, y + 78, 12, 12)
        path4.rect(x + 30, y + 102, 12, 12)
        path4.rect(x + 150, y + 102, 12, 12)
        path4.rect(x + 6, y + 126, 12, 12)
        path4.rect(x + 30, y + 126, 12, 12)
        path4.rect(x + 54, y + 126, 12, 12)
        path4.rect(x + 126, y + 126, 12, 12)
        path4.rect(x + 150, y + 126, 12, 12)
        path4.rect(x + 174, y + 126, 12, 12)
        path4.rect(x + 6, y + 150, 12, 12)
        path4.rect(x + 54, y + 150, 12, 12)
        path4.rect(x + 78, y + 150, 12, 12)
        path4.rect(x + 102, y + 150, 12, 12)
        path4.rect(x + 126, y + 150, 12, 12)
        path4.rect(x + 174, y + 150, 12, 12)
        path4.rect(x + 6, y + 174, 12, 12)
        path4.rect(x + 30, y + 174, 12, 12)
        path4.rect(x + 54, y + 174, 12, 12)
        path4.rect(x + 126, y + 174, 12, 12)
        path4.rect(x + 150, y + 174, 12, 12)
        path4.rect(x + 174, y + 174, 12, 12)
        this.castle.pushNew(path4, "#606060")
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
        this.prevTime = time
        this.time += timeDiff
    }

    private onMouseMove(e: MouseEvent) {
        var rect = this.canvas.getBoundingClientRect()
        this.mousePosition = new Vec2(
            Utils.clamp(Math.floor(e.clientX - rect.left), 0, this.width - 1),
            Utils.clamp(Math.floor(e.clientY - rect.top), 0, this.width - 1)
        )
    }

    private onMouseDown(e: MouseEvent) {
        this.onMouseMove(e)
    }

    private onMouseUp(e: MouseEvent) {
        this.onMouseMove(e)
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
        }
    }

    private onKeyUp(e: KeyboardEvent) {

    }

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
        //c.saveImage("textures")
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