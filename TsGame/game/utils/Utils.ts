class Utils {

    static hex = "0123456789abcdef"

    static sign(value: number): number {
        return value < 0 ? -1 : value > 0 ? 1 : 0
    }

    /**
     * @param min min value (inclusive)
     * @param max max value (inclusive)
     */
    static clamp(value: number, min: number, max: number): number {
        return value > max ? max : value < min ? min : value
    }

    /**
     * @param min min value (inclusive)
     * @param max max value (exclusive)
     */
    static wrap(value: number, min: number, max: number): number {
        value -= min
        let range = max - min
        if (value < 0) {
            value = range - (-value) % range
        }
        return value % range + min
    }

    static lerp(f1: number, f2: number, ammount: number): number {
        if (ammount <= 0) {
            return f1
        } else if (ammount >= 1) {
            return f2
        } else {
            return f1 + ammount * (f2 - f1)
        }
    }

    static lerpInt(f1: number, f2: number, ammount: number): number {
        if (ammount <= 0) {
            return Math.floor(f1)
        } else if (ammount >= 1) {
            return Math.floor(f2)
        } else {
            return Math.floor((1 - ammount) * Math.floor(f1) + ammount * (Math.floor(f2) + 0.9999))
        }
    }

    static interpolateSmooth(f1: number, f2: number, ammount: number): number {
        if (ammount <= 0) {
            return f1
        } else if (ammount >= 1) {
            return f2
        } else {
            return f1 + (1 - Math.cos(ammount * Math.PI)) * 0.5 * (f2 - f1)
        }
    }

    static flatten(width: number, x: number, y: number): number {
        return width * y + x
    }

    /**
     * @param steps number of values between 0 and 1
     */
    static granulate(value: number, steps: number): number {
        return Math.floor(value * steps) / steps + 1 / steps / 2
    }

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

    static byteToHex(byte: number): string {
        byte = Utils.clamp(byte, 0, 255)
        return Utils.hex[Math.floor(byte / 16)] + Utils.hex[Math.floor(byte % 16)]
    }

    static ldx(distance: number, direction: number, startX: number = 0): number {
        return startX + distance * Math.cos(direction)
    }

    static ldy(distance: number, direction: number, startY: number = 0): number {
        return startY + distance * Math.sin(direction)
    }

    static ld(distance: number, direction: number, startX: number = 0, startY: number = 0): Vec2 {
        return new Vec2(
            startX + distance * Math.cos(direction),
            startY + distance * Math.sin(direction)
        )
    }

    /**
     * @param min min value (inclusive)
     * @param max max value (exclusive)
     */
    static rand(min: number, max: number): number {
        if (max <= min) {
            return min
        }
        return Math.random() * (max - min) + min
    }

    /**
     * @param min min value (inclusive)
     * @param max max value (exclusive)
     */
    static randInt(min: number, max: number): number {
        if (max <= min) {
            return min
        }
        return Math.floor(Math.random() * (max - min) + min)
    }

    static randSign(num: number = 1): number {
        return (Math.floor(Math.random() * 2) * 2 - 1) * num
    }

    static isString(obj: any): boolean {
        return typeof obj === 'string' || obj instanceof String
    }

    static getImageFromCache(id: string): Promise<CanvasImageSource> {
        return new Promise<CanvasImageSource>((resolve, reject) => {
            let data = localStorage.getItem(id)
            if (data) {
                let img = new Image()
                img.onload = () => {
                    console.log(`Restored ${id} from cache`)
                    resolve(img)
                }
                img.src = "data:image/png;base64," + data
            } else reject()
        })
    }

    static fillWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
        let words = text.split(/[ \t]+/)
        let lines: string[] = []
        let currentLine = words[0]
        for (let i = 1; i < words.length; i++) {
            let word = words[i]
            let size = ctx.measureText(`${currentLine} ${word}`)
            if (size.width < maxWidth) {
                currentLine += " " + word
            } else {
                lines.push(currentLine)
                currentLine = word
            }
        }
        lines.push(currentLine)
        for (const line of lines) {
            ctx.fillText(line, x, y)
            y += lineHeight
        }
    }
}
