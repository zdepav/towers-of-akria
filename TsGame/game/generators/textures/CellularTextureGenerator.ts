/// <reference path="TextureGenerator.ts"/>

enum CellularTextureType {
    Cells,
    Net,
    Balls
}

enum CellularTextureDistanceMetric {
    Euclidean,
    Manhattan,
    Chebyshev,
    Minkowski
}

// based on https://blackpawn.com/texts/cellular/default.html
class CellularTextureGenerator extends TextureGenerator {

    private color2: ColorSource
    private type: CellularTextureType
    private density: number
    private distances: number[]
    private min: number
    private range: number
    private curve: (x: number) => number

    /**
     * @param density n => 1 point per n pixels
     */
    constructor(
        width: number,
        height: number,
        density: number,
        color1: ColorSourceSource,
        color2: ColorSourceSource,
        type: CellularTextureType = CellularTextureType.Cells,
        metric: CellularTextureDistanceMetric = CellularTextureDistanceMetric.Euclidean,
        curve?: (x: number) => number
    ) {
        super(width, height, color1)
        this.color2 = ColorSource.get(color2 ?? RgbaColor.white)
        this.type = type
        let distance: (dx: number, dy: number) => number
        switch (metric) {
            case CellularTextureDistanceMetric.Euclidean:
                distance = Metric.euclideanDistance
                break
            case CellularTextureDistanceMetric.Manhattan:
                distance = Metric.manhattanDistance
                break
            case CellularTextureDistanceMetric.Chebyshev:
                distance = Metric.chebyshevDistance
                break
            case CellularTextureDistanceMetric.Minkowski:
                distance = Metric.minkowskiDistance
                break
        }
        this.density = Math.max(1, density)
        this.curve = curve ?? Curve.linear
        let points: Vec2[] = []
        let pointCount = this.width * this.height / this.density
        if (pointCount < 2) {
            pointCount = 2
        }
        for (let i = 0; i < pointCount; ++i) {
            points[i] = new Vec2(Rand.r(this.width), Rand.r(this.height))
        }
        this.distances = []
        this.min = Infinity
        let max = 0, i: number, d: number
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                let { min1, min2 } = CellularTextureGenerator.distancesTo2Nearest(x, y, this.width, this.height, points, distance)
                switch (this.type) {
                    case CellularTextureType.Net:
                        d = min2 - min1
                        break
                    case CellularTextureType.Balls:
                        d = min2 * min1
                        break
                    default: // Lava
                        d = min1 * min1
                        break
                }
                this.min = Math.min(this.min, d)
                max = Math.max(max, d)
                this.distances[Utils.flatten(this.width, x, y)] = d
            }
        }
        this.range = max - this.min
    }

    private static wrappedDistance(
        x: number, y: number,
        width: number, height: number,
        b: Vec2,
        distance: (dx: number, dy: number) => number
    ): number {
        let dx = Math.abs(x - b.x)
        let dy = Math.abs(y - b.y)
        if (dx > width / 2) {
            dx = width - dx
        }
        if (dy > height / 2) {
            dy = height - dy
        }
        return distance(dx, dy)
    }

    private static distancesTo2Nearest(
        x: number, y: number,
        width: number, height: number,
        points: Vec2[],
        distance: (dx: number, dy: number) => number
    ): { min1: number, min2: number } {
        let min1 = Infinity
        let min2 = Infinity
        for (const p of points) {
            let d = CellularTextureGenerator.wrappedDistance(x, y, width, height, p, distance)
            if (d < min1) {
                min2 = min1
                min1 = d
            } else if (d < min2) {
                min2 = d
            }
        }
        return { min1, min2 }
    }

    protected _getColor(x: number, y: number): RgbaColor {
        x = Math.round(x)
        y = Math.round(y)
        return this.color.getColor(x, y).lerp(
            this.color2.getColor(x, y),
            this.curve((this.distances[Utils.flatten(this.width, x, y)] - this.min) / this.range)
        )
    }
}
