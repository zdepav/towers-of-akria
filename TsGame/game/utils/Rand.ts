class Rand {

    /**
     * returns random float value between 0 (inclusive) and 1 (exclusive)
     */
    static r(): number

    /**
     * returns random float value between 0 (inclusive) and max (exclusive)
     * @param max max value (exclusive)
     */
    static r(max: number): number

    /**
     * returns random float value between min (inclusive) and max (exclusive)
     * @param min min value (inclusive)
     * @param max max value (exclusive)
     */
    static r(min: number, max: number): number

    static r(a?: number, b?: number): number {
        if (a === undefined) {
            return Math.random()
        } else if (b === undefined) {
            return Math.random() * a
        } else {
            if (b <= a) {
                return a
            }
            return Math.random() * (b - a) + a
        }
    }

    /**
     * returns random integer value between 0 (inclusive) and max (exclusive)
     * @param max max value (exclusive)
     */
    static i(max: number): number

    /**
     * returns random float value between min and max
     * @param min min value (inclusive)
     * @param max max value (exclusive)
     */
    static i(min: number, max: number): number

    static i(a: number, b?: number): number {
        if (b === undefined) {
            return Math.floor(Math.random() * a)
        } else {
            if (b <= a) {
                return a
            }
            return Math.floor(Math.random() * (b - a) + a)
        }
    }

    /**
     * @param items array of items to choose from
     * @returns randomly chosen item if the array is not empty, null otherwise
     */
    static item<T>(items: T[]): T | null {
        return items.length > 0 ? items[Math.floor(Math.random() * items.length)] : null
    }

    static sign(num: number = 1): number {
        return (Math.floor(Math.random() * 2) * 2 - 1) * num
    }

    /**
     * @param chance probability to return true, between 0 and 1
     */ 
    static chance(chance: number): boolean {
        return Math.random() < chance
    }
}