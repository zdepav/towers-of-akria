class Metric {

    static euclideanDistance(dx: number, dy: number): number {
        return Math.sqrt(dx * dx + dy * dy)
    }

    static manhattanDistance(dx: number, dy: number): number {
        return Math.abs(dx) + Math.abs(dy)
    }

    static chebyshevDistance(dx: number, dy: number): number {
        return Math.max(Math.abs(dx), Math.abs(dy))
    }

    static minkowskiDistance(dx: number, dy: number): number {
        let d = Math.sqrt(Math.abs(dx)) + Math.sqrt(Math.abs(dy))
        return d * d
    }
}
