class Rect {

    x: number
    y: number
    w: number
    h: number

    get right(): number { return this.x + this.w }

    get bottom(): number { return this.y + this.h }

    constructor(x: number, y: number, w: number, h: number) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }

    pointIsInside(point: Vec2): boolean {
        let x = point.x - this.x
        let y = point.y - this.y
        return x >= 0 && x < this.w && y >= 0 && y < this.h
    }
}
