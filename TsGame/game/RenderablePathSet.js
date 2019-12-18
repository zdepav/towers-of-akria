/// <reference path="RenderablePath.ts"/>
class RenderablePathSet {
    constructor(paths = null) {
        this.paths = paths == null ? [] : paths;
    }
    push(path) {
        this.paths.push(path);
    }
    pushNew(path, fill) {
        this.paths.push(new RenderablePath(path, fill));
    }
    render(ctx) {
        for (let i = 0; i < this.paths.length; ++i) {
            this.paths[i].render(ctx);
        }
    }
}
//# sourceMappingURL=RenderablePathSet.js.map