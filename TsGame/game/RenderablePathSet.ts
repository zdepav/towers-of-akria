/// <reference path="RenderablePath.ts"/>

class RenderablePathSet {

    paths: RenderablePath[]

    constructor(paths: RenderablePath[] = null) {
        this.paths = paths == null ? [] : paths
    }

    push(path: RenderablePath) {
        this.paths.push(path)
    }

    pushNew(path: Path2D, fill: string | CanvasPattern | CanvasGradient) {
        this.paths.push(new RenderablePath(path, fill))
    }

    render(ctx: CanvasRenderingContext2D) {
        for (let i = 0; i < this.paths.length; ++i) {
            this.paths[i].render(ctx)
        }
    }

}
