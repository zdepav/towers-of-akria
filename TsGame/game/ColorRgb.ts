/// <reference path="Utils.ts"/>

class ColorRgb {

    r: number
    g: number
    b: number

    constructor(r: number, g: number, b: number) {
        this.r = Utils.clamp(r, 0, 255)
        this.g = Utils.clamp(g, 0, 255)
        this.b = Utils.clamp(b, 0, 255)
    }

    toCss(): string {
        const hex = "0123456789abcdef"
        return "#"
            + Utils.byteToHex(this.r)
            + Utils.byteToHex(this.g)
            + Utils.byteToHex(this.b)
    }

    multiplyFloat(ammount: number): ColorRgb {
        return new ColorRgb(this.r * ammount, this.g * ammount, this.b * ammount)
    }

    multiply(c: ColorRgb): ColorRgb {
        return new ColorRgb(this.r * c.r, this.g * c.g, this.b * c.b)
    }

    add(c: ColorRgb): ColorRgb {
        return new ColorRgb(this.r + c.r, this.g + c.g, this.b + c.b)
    }

    mix(c: ColorRgb, ammount: number): ColorRgb {
        if (ammount >= 1) {
            return c
        } else if (ammount <= 0) {
            return this
        } else {
            let a2 = 1 - ammount
            return new ColorRgb(
                this.r * a2 + c.r * ammount,
                this.g * a2 + c.g * ammount,
                this.b * a2 + c.b * ammount
            )
        }
    }

    addNoise(intensity: number, saturation: number, coverage: number): ColorRgb {
        if (Math.random() < coverage) {
            if (saturation <= 0) {
                let n = Utils.randInt(-intensity, intensity)
                return new ColorRgb(this.r + n, this.g + n, this.b + n)
            } else if (saturation >= 1) {
                return new ColorRgb(
                    this.r + Utils.randInt(-intensity, intensity),
                    this.g + Utils.randInt(-intensity, intensity),
                    this.b + Utils.randInt(-intensity, intensity)
                )
            } else {
                let s2 = 1 - saturation
                let rn = Utils.randInt(-intensity, intensity)
                let gn = saturation * Utils.randInt(-intensity, intensity) + s2 * rn
                let bn = saturation * Utils.randInt(-intensity, intensity) + s2 * rn
                return new ColorRgb(this.r + rn, this.g + gn, this.b + bn)
            }
        } else {
            return this
        }
    }

}