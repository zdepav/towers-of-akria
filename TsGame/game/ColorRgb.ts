class ColorRgb {

    r: number
    g: number
    b: number

    constructor(r: number, g: number, b: number) {
        this.r = Math.min(Math.max(r, 0), 255)
        this.g = Math.min(Math.max(g, 0), 255)
        this.b = Math.min(Math.max(b, 0), 255)
    }

    toCss(): string {
        const hex = "0123456789abcdef"
        return "#" +
            hex[Math.floor(this.r / 16)] +
            hex[Math.floor(this.r % 16)] +
            hex[Math.floor(this.g / 16)] +
            hex[Math.floor(this.g % 16)] +
            hex[Math.floor(this.b / 16)] +
            hex[Math.floor(this.b % 16)]
    }

    static MultiplyFloat(c: ColorRgb, ammount: number): ColorRgb {
        return new ColorRgb(c.r * ammount, c.g * ammount, c.b * ammount)
    }

    static Multiply(c1: ColorRgb, c2: ColorRgb): ColorRgb {
        return new ColorRgb(c1.r * c2.r, c1.g * c2.g, c1.b * c2.b)
    }

    static Add(c1: ColorRgb, c2: ColorRgb): ColorRgb {
        return new ColorRgb(c1.r + c2.r, c1.g + c2.g, c1.b + c2.b)
    }

    static Mix(c1: ColorRgb, c2: ColorRgb, ammount: number): ColorRgb {
        if (ammount >= 1) {
            return c2
        } else if (ammount <= 0) {
            return c1
        } else {
            let a2 = 1 - ammount
            return new ColorRgb(
                c1.r * a2 + c2.r * ammount,
                c1.g * a2 + c2.g * ammount,
                c1.b * a2 + c2.b * ammount
            )
        }
    }

}