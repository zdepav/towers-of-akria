class RgbaColor {

    static transparent: RgbaColor
    static black: RgbaColor
    static red: RgbaColor
    static green: RgbaColor
    static blue: RgbaColor
    static yellow: RgbaColor
    static cyan: RgbaColor
    static magenta: RgbaColor
    static white: RgbaColor
    static gray: RgbaColor

    r: number
    g: number
    b: number
    a: number

    constructor(r: number, g: number, b: number, a: number = 255) {
        this.r = Math.floor(Utils.clamp(r, 0, 255))
        this.g = Math.floor(Utils.clamp(g, 0, 255))
        this.b = Math.floor(Utils.clamp(b, 0, 255))
        this.a = Math.floor(Utils.clamp(a, 0, 255))
    }

    static fromHex(color: string): RgbaColor {
        if (/^#[0-9a-f]{3}[0-9a-f]?$/i.test(color)) {
            let a = color.length > 4 ? parseInt(color[4], 16) * 17 : 255
            return new RgbaColor(
                parseInt(color[1], 16) * 17,
                parseInt(color[2], 16) * 17,
                parseInt(color[3], 16) * 17,
                a
            )
        } else if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(color)) {
            let a = color.length > 7 ? parseInt(color.substr(7, 2), 16) : 255
            return new RgbaColor(
                parseInt(color.substr(1, 2), 16),
                parseInt(color.substr(3, 2), 16),
                parseInt(color.substr(5, 2), 16),
                a
            )
        } else throw new Error("Invalid color format")
    }

    private pr(): number { return this.r * this.a / 255 }

    private pg(): number { return this.g * this.a / 255 }

    private pb(): number { return this.b * this.a / 255 }

    private pa(): number { return this.a * this.a / 255 }

    multiplyFloat(ammount: number, multiplyAlpha: boolean = false): RgbaColor {
        return new RgbaColor(
            this.r * ammount,
            this.g * ammount,
            this.b * ammount,
            multiplyAlpha ? this.a * ammount : this.a
        )
    }

    multiply(c: RgbaColor): RgbaColor {
        return new RgbaColor(this.r * c.r, this.g * c.g, this.b * c.b, this.a * c.a)
    }

    add(c: RgbaColor): RgbaColor {
        return new RgbaColor(this.r + c.pr(), this.g + c.pg(), this.b + c.pb(), this.a + c.pa())
    }

    blend(c: RgbaColor): RgbaColor {
        if (this.a === 0) {
            return c.a === 0 ? this : c
        } else if (c.a === 0) {
            return this
        } else {
            let ra = (255 - c.a) / 255
            return new RgbaColor(
                this.r * ra + c.pr(),
                this.g * ra + c.pg(),
                this.b * ra + c.pb(),
                this.a + c.a * (255 - this.a) / 255
            )
        }
    }

    withRed(r: number): RgbaColor { return new RgbaColor(r, this.g, this.b, this.a) }

    withGreen(g: number): RgbaColor { return new RgbaColor(this.r, g, this.b, this.a) }

    withBlue(b: number): RgbaColor { return new RgbaColor(this.r, this.g, b, this.a) }

    withAlpha(a: number): RgbaColor { return new RgbaColor(this.r, this.g, this.b, a) }

    lerp(c: RgbaColor, ammount: number): RgbaColor {
        if (ammount >= 1) {
            return c
        } else if (ammount <= 0) {
            return this
        } else {
            let a2 = 1 - ammount
            return new RgbaColor(
                this.r * a2 + c.r * ammount,
                this.g * a2 + c.g * ammount,
                this.b * a2 + c.b * ammount,
                this.a * a2 + c.a * ammount
            )
        }
    }

    addNoise(intensity: number, saturation: number, coverage: number): RgbaColor {
        if (Math.random() < coverage) {
            intensity *= 255
            if (saturation <= 0) {
                let n = Utils.rand(-intensity, intensity)
                return new RgbaColor(this.r + n, this.g + n, this.b + n, this.a)
            } else if (saturation >= 1) {
                return new RgbaColor(
                    this.r + Utils.rand(-intensity, intensity),
                    this.g + Utils.rand(-intensity, intensity),
                    this.b + Utils.rand(-intensity, intensity),
                    this.a
                )
            } else {
                let s2 = 1 - saturation
                let rn = Utils.rand(-intensity, intensity)
                let gn = saturation * Utils.rand(-intensity, intensity) + s2 * rn
                let bn = saturation * Utils.rand(-intensity, intensity) + s2 * rn
                return new RgbaColor(this.r + rn, this.g + gn, this.b + bn, this.a)
            }
        } else {
            return this
        }
    }

    source(width: number = 1, height: number = 1): RgbaColorSource {
        return new RgbaColorSource(this, width, height)
    }

    toCss(): string {
        return "#"
            + Utils.byteToHex(this.r)
            + Utils.byteToHex(this.g)
            + Utils.byteToHex(this.b)
            + Utils.byteToHex(this.a)
    }

    toString(): string {
        return `rgba(${this.r},${this.g},${this.b},${this.a / 255})`
    }

    static init(): Promise<void> {
        return new Promise<void>(resolve => {
            RgbaColor.transparent = new RgbaColor(0, 0, 0, 0)
            RgbaColor.black = new RgbaColor(0, 0, 0)
            RgbaColor.red = new RgbaColor(255, 0, 0)
            RgbaColor.green = new RgbaColor(0, 255, 0)
            RgbaColor.blue = new RgbaColor(0, 0, 255)
            RgbaColor.yellow = new RgbaColor(255, 255, 0)
            RgbaColor.cyan = new RgbaColor(0, 255, 255)
            RgbaColor.magenta = new RgbaColor(255, 0, 255)
            RgbaColor.white = new RgbaColor(255, 255, 255)
            RgbaColor.gray = new RgbaColor(128, 128, 128)
            resolve()
        })
    }
}
