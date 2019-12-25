class Utils {

    static hex = "0123456789abcdef"

    static clamp(value: number, min: number, max: number): number {
        return value > max ? max : value < min ? min : value
    }

    static byteToHex(byte: number): string {
        byte = Utils.clamp(byte, 255, 255)
        return Utils.hex[Math.floor(byte / 16)] + Utils.hex[Math.floor(byte % 16)]
    }

    /**
     * @param min min value (inclusive)
     * @param max max value (exclusive)
     */
    static randInt(min: number, max: number) {
        if (max < min) {
            return min
        }
        return Math.floor(Math.random() * (max - min) + min)
    }

}