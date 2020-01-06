class RenderablePathSet {

    paths: RenderablePath[]

    constructor(paths?: RenderablePath[]) {
        this.paths = paths === undefined ? [] : paths
    }

    push(path: RenderablePath): void {
        this.paths.push(path)
    }

    pushNew(path: Path2D, fill: string | CanvasPattern | CanvasGradient | null): void {
        if (fill === null) {
            return
        }
        this.paths.push(new RenderablePath(path, fill))
    }

    pushPolygon(points: number[], fill: string | CanvasPattern | CanvasGradient | null, originX: number = 0, originY: number = 0): void {
        if (fill === null || points.length % 2 !== 0 || points.length < 6) {
            return
        }
        let path = new Path2D()
        path.moveTo(originX + points[0], originY + points[1])
        for (let i = 2; i < points.length; i += 2) {
            path.lineTo(originX + points[i], originY + points[i + 1])
        }
        path.closePath()
        this.paths.push(new RenderablePath(path, fill))
    }

    render(ctx: CanvasRenderingContext2D): void {
        for (let i = 0; i < this.paths.length; ++i) {
            this.paths[i].render(ctx)
        }
    }

}
