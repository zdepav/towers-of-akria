class RenderablePath {

    path: Path2D
    fill: string | CanvasPattern | CanvasGradient

    constructor(path: Path2D, fill: string | CanvasPattern | CanvasGradient) {
        this.path = path
        this.fill = fill
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.fill
        ctx.fill(this.path)
    }

}
