/// <reference path="PreRenderedImage.ts"/>
/// <reference path="ColorRgb.ts"/>
/// <reference path="Coords.ts"/>

enum CellularTextureType {
    Lava,
    Net,
    Balls
}

// based on https://blackpawn.com/texts/cellular/default.html
class CellularTexture {

    private width: number
    private height: number
    private color1: ColorRgb
    private color2: ColorRgb
    private type: CellularTextureType
    private density: number

    // density n => 1 point per n pixels, has to be at least 16
    constructor(width: number, height: number, density: number, color1: ColorRgb, color2: ColorRgb, type: CellularTextureType) {
        this.width = width
        this.height = height
        this.color1 = color1
        this.color2 = color2
        this.type = type
        this.density = Math.max(16, density)
    }

    private wrappedDistance(x: number, y: number, b: Coords): number {
        let dx = Math.abs(x - b.x)
        let dy = Math.abs(y - b.y)
        if (dx > this.width / 2) {
             dx = this.width - dx;
        }
        if (dy > this.height / 2) {
            dy = this.height - dy;
        }
        return Math.sqrt(dx * dx + dy * dy)
    }
    
    private distancesTo2Nearest(x: number, y: number, points: Coords[]): { min1: number, min2: number } {
        let min1 = Infinity
        let min2 = Infinity
        for (const p of points) {
            let d = this.wrappedDistance(x, y, p)
            if (d < min1) {
                min2 = min1
                min1 = d
            } else if (d < min2) {
                min2 = d
            }
        }
        return { min1, min2 }
    }

    private flatten(x: number, y: number): number {
        return this.width * y + x
    }

    generate(): CanvasImageSource {
        let tex = new PreRenderedImage(this.width, this.height)
        let points: Coords[] = []
        let pointCount = this.width * this.height / this.density
        if (pointCount < 2) {
            pointCount = 2
        }
        for (let i = 0; i < pointCount; ++i) {
            points[i] = new Coords(
                Math.random() * this.width,
                Math.random() * this.height
            )
        }
        let distances: number[] = []
        let min = Infinity
        let max = 0
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                let i = this.flatten(x, y)
                let { min1, min2 } = this.distancesTo2Nearest(x, y, points)
                switch (this.type) {
                    case CellularTextureType.Net:
                        distances[i] = min2 - min1
                        break
                    case CellularTextureType.Balls:
                        distances[i] = min2 * min1
                        break
                    default: // Lava
                        distances[i] = min1 * min1
                        break
                }
                min = Math.min(min, distances[i])
                max = Math.max(max, distances[i])
            }
        }
        let range = max - min
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                let i = this.flatten(x, y)
                let coef = (distances[i] - min) / range
                tex.ctx.fillStyle = ColorRgb.Mix(this.color1, this.color2, coef).toCss()
                tex.ctx.fillRect(x, y, 1, 1);
            }
        }
        return tex.image
    }

}