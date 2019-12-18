class RenderablePath {
    constructor(path, fill) {
        this.path = path;
        this.fill = fill;
    }
    render(ctx) {
        ctx.fillStyle = this.fill;
        ctx.fill(this.path);
    }
}
//# sourceMappingURL=RenderablePath.js.map