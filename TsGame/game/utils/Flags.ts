class Flags {

    static has(value: number, flag: number) {
        return (value & flag) === flag
    }

    static not(value: number, flag: number) {
        return (value & flag) !== flag
    }

    static add(value: number, flag: number) {
        return value | flag
    }

    static remove(value: number, flag: number) {
        return value & (~flag)
    }
}
