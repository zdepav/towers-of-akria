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
    turret: Turret | null // only has value for tower tiles
    next: Tile | null // only has value for spawn/path tiles

    constructor(game: Game, x: number, y: number, type: TileType, ctx: CanvasRenderingContext2D) {
        this.game = game
        this.type = type
        this.turret = null
        this.pos = new Vec2(x, y)
        this.decor = new RenderablePathSet()
        this.next = null
        if (type === TileType.Path || type === TileType.Spawn || type === TileType.HQ) {
            let path = new Path2D()
            for (let i = 0; i < 4; ++i) {
                for (let j = 0; j < 4; ++j) {
                    if (Rand.chance(0.25)) {
                        let _x = x + i * 16 + 4 + Rand.r(8)
                        let _y = y + j * 16 + 4 + Rand.r(8)
                        let radius = 2 + Rand.r(2)
                        for (let k = 0; k < 4; ++k) {
                            let a = -Angle.deg45 + Angle.deg90 * (k + 0.25 + Rand.r(0.5))
                            if (k === 0) {
                                path.moveTo(Vec2.ldx(radius, a, _x), Vec2.ldy(radius, a, _y))
                            }
                            else {
                                path.lineTo(Vec2.ldx(radius, a, _x), Vec2.ldy(radius, a, _y))
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
            }
            else {
                this.decor.pushNew(path, "#997761")
            }
        } else if (type === TileType.Empty) {
            let path1 = new Path2D()
            let path2 = new Path2D()
            for (let i = 0; i < 3; ++i) {
                for (let j = 0; j < 3; ++j) {
                    if (Rand.chance(0.25)) {
                        let path = Rand.chance(0.5) ? path1 : path2
                        path.arc(x + 6 + 21 * i + Rand.r(10), y + 6 + 21 * j + Rand.r(10), 4 + Rand.r(2), 0, Angle.deg360)
                        path.closePath()
                    }
                }
            }
            this.decor.pushNew(path1, "#337F1C")
            this.decor.pushNew(path2, "#479131")
        } else if (type === TileType.Tower) {
            this.turret = new Turret(this)
        }
    }

    step(time: number): void {
        if (this.type === TileType.Tower && this.turret != null) {
            this.turret.step(time)
        }
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean): void {
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
                    ctx.drawImage(Tile.tiles, 0, 192, 64, 64, this.pos.x, this.pos.y, 64, 64)
                    break
            }
            this.decor.render(ctx)
        } else if (this.type === TileType.Tower && this.turret != null) {
            this.turret.render(ctx)
        }
    }

    renderOverlay(ctx: CanvasRenderingContext2D): void {
        if (this.type === TileType.Tower && this.turret != null) {
            let elems = this.turret.getType().toColorArray()
            let x = this.pos.x + 2
            let y = this.pos.y + 2
            for (const c of elems) {
                ctx.fillStyle = c
                ctx.fillRect(x, y, 4, 4)
                x += 6
            }
        }
    }

    sellTurret(): TurretType | null {
        if (this.type == TileType.Tower && this.turret != null && this.turret.getType().count > 0) {
            let t = this.turret.getType()
            this.turret = new Turret(this)
            return t
        } else {
            return null
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache("td_tiles").then(tex => { Tile.tiles = tex }, () => new Promise<void>(resolve => {
            let c = new PreRenderedImage(64, 256)
            let ctx = c.ctx
            new NoiseTextureGenerator(64, 64, "#5BA346", 0.075, 0, 0.25).generateInto(ctx, 0, 0)
            new NoiseTextureGenerator(64, 128, "#B5947E", 0.04, 0, 0.2).generateInto(ctx, 0, 64)
            let grad = ctx.createLinearGradient(0, 160, 64, 160)
            grad.addColorStop(0, "#E77B65")
            grad.addColorStop(1, "#E77B6500")
            ctx.fillStyle = grad
            ctx.fillRect(0, 128, 64, 64)
            ctx.fillStyle = "#808080"
            ctx.fillRect(0, 192, 64, 64)
            let rps = new RenderablePathSet()
            rps.pushPolygon([0, 0, 62, 0, 62, 2, 2, 2, 2, 62, 0, 62], "#A0A0A0", 0, 192)
            rps.pushPolygon([62, 2, 64, 2, 64, 64, 2, 64, 2, 62, 62, 62], "#606060", 0, 192)
            rps.pushPolygon([56, 8, 58, 8, 58, 58, 8, 58, 8, 56, 56, 56], "#909090", 0, 192)
            rps.pushPolygon([6, 6, 56, 6, 56, 8, 8, 8, 8, 56, 6, 56], "#707070", 0, 192)
            rps.render(ctx)
            c.cacheImage("td_tiles")
            Tile.tiles = c.image
            resolve()
        }))
    }

    static drawPathGround(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.drawImage(Tile.tiles, 0, 64, 64, 64, x, y, 64, 64)
    }

    static drawTowerGround(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.drawImage(Tile.tiles, 0, 192, 64, 64, x, y, 64, 64)
    }
}
