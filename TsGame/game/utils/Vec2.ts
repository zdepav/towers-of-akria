class Vec2 {

    static zero: Vec2

    private len: number | null

    x: number
    y: number

    get length(): number {
        if (this.len === null) {
            this.len = Math.sqrt(this.x * this.x + this.y * this.y)
        }
        return this.len
    }

    get sqrLength() { return this.x * this.x + this.y * this.y }

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.len = null
    }

    add(v: Vec2): Vec2 {
        return new Vec2(this.x + v.x, this.y + v.y)
    }

    addu(x: number, y: number): Vec2 {
        return new Vec2(this.x + x, this.y + y)
    }

    sub(v: Vec2): Vec2 {
        return new Vec2(this.x - v.x, this.y - v.y)
    }

    subu(x: number, y: number): Vec2 {
        return new Vec2(this.x - x, this.y - y)
    }

    dot(v: Vec2): number {
        return this.x * v.x + this.y * v.y
    }

    dotu(x: number, y: number): number {
        return this.x * x + this.y * y
    }

    mul(f: number): Vec2 {
        return new Vec2(this.x * f, this.y * f)
    }

    lerp(v: Vec2, ammount: number): Vec2 {
        if (ammount <= 0) {
            return this
        } else if (ammount >= 1) {
            return v
        } else {
            return new Vec2(this.x + (v.x - this.x) * ammount, this.y + (v.y - this.y) * ammount)
        }
    }

    angleTo(v: Vec2): number {
        return Math.atan2(v.y - this.y, v.x - this.x)
    }

    rotate(angle: number): Vec2 {
        let c = Math.cos(angle), s = Math.sin(angle)
        return new Vec2(this.x * c - this.y * s, this.x * s + this.y * c)
    }

    rotateAround(origin: Vec2, angle: number): Vec2 {
        let x = this.x - origin.x
        let y = this.y - origin.y
        let c = Math.cos(angle), s = Math.sin(angle)
        return new Vec2(x * c - y * s, x * s + y * c).add(origin)
    }

    distanceTo(v: Vec2): number {
        return v.sub(this).length
    }

    sqrDistanceTo(v: Vec2): number {
        return v.sub(this).sqrLength
    }

    normalize(): Vec2 {
        let m = 1 / this.length
        return new Vec2(this.x * m, this.y * m)
    }

    normal(): Vec2 {
        return new Vec2(this.y, -this.x)
    }

    isZero(): boolean {
        return this.x === 0 && this.y === 0
    }

    equals(v: Vec2): boolean {
        return this.x === v.x && this.y === v.y
    }

    copy(): Vec2 {
        return new Vec2(this.x, this.y)
    }

    toString(): string {
        return `${this.x};${this.y}`
    }

    static randUnit(): Vec2 {
        let a = Angle.rand()
        return new Vec2(Utils.ldx(1, a), Utils.ldy(1, a))
    }

    static randUnit3d(): Vec2 {
        let a = Angle.rand(), a2 = Angle.rand()
        let len = Utils.ldx(1, a2)
        return new Vec2(Utils.ldx(len, a), Utils.ldy(len, a))
    }

    static onEllipse(r1: number, r2: number, angle: number, center?: Vec2): Vec2 {
        if (center === undefined) {
            center = Vec2.zero
        }
        return new Vec2(Utils.ldx(r1, angle, center.x), Utils.ldy(r2, angle, center.y))
    }

    static init(): void {
        Vec2.zero = new Vec2(0, 0)
    }

}

Vec2.init()
