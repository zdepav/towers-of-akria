/// <reference path='Game.ts'/>
/// <reference path='generators.ts'/>

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

window.addEventListener("load", () => {
    let game = new Game(document.getElementById("zptd-game-container") as HTMLElement)
    game.init()
    gen()
    function gameLoop() {
        window.requestAnimationFrame(gameLoop)
        game.run()
    }
    gameLoop()
})