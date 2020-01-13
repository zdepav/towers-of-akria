class Angle {

    private static rad2deg: number

    static deg10: number
    static deg15: number
    static deg18: number
    static deg20: number
    static deg30: number
    static deg36: number
    static deg45: number
    static deg60: number
    static deg72: number
    static deg90: number
    static deg120: number
    static deg135: number
    static deg150: number
    static deg180: number
    static deg210: number
    static deg225: number
    static deg240: number
    static deg270: number
    static deg300: number
    static deg315: number
    static deg330: number
    static deg360: number

    static deg(radians: number): number {
        return radians * Angle.rad2deg
    }

    static rand(): number {
        return Math.random() * Angle.deg360
    }

    static wrap(angle: number): number {
        return (angle < 0 ? (Angle.deg360 - (-angle) % Angle.deg360) : angle) % Angle.deg360
    }

    static difference(angle1: number, angle2: number): number {
        angle1 = Angle.wrap(angle1)
        angle2 = Angle.wrap(angle2)
        let diff = Math.abs(angle2 - angle1)
        if (diff <= Angle.deg180) {
            return angle2 - angle1
        } else {
            return Angle.deg360 - angle2 + angle1
        }
    }

    static rotateTo(angle: number, targetAngle: number, rotation: number): number {
        let diff = Angle.difference(angle, targetAngle)
        if (Math.abs(diff) < rotation) {
            return targetAngle;
        } else return Angle.wrap(angle + Math.sign(diff) * rotation)
    }

    static between(angle1: number, angle2: number): number {
        angle1 = Angle.wrap(angle1)
        angle2 = Angle.wrap(angle2)
        let diff = Math.abs(angle2 - angle1)
        if (diff <= Angle.deg180) {
            return (angle1 + angle2) / 2
        } else {
            return ((angle1 + angle2) / 2 + Angle.deg180) % Angle.deg360
        }
    }

    static init(): Promise<void> {
        return new Promise<void>(resolve => {
            Angle.rad2deg = 180 / Math.PI
            Angle.deg10 = Math.PI / 18
            Angle.deg15 = Math.PI / 12
            Angle.deg18 = Math.PI / 10
            Angle.deg20 = Math.PI / 9
            Angle.deg30 = Math.PI / 6
            Angle.deg36 = Math.PI / 5
            Angle.deg45 = Math.PI / 4
            Angle.deg60 = Math.PI / 3
            Angle.deg72 = Math.PI / 2.5
            Angle.deg90 = Math.PI / 2
            Angle.deg120 = Math.PI * 2 / 3
            Angle.deg135 = Math.PI * 0.75
            Angle.deg150 = Math.PI * 5 / 6
            Angle.deg180 = Math.PI
            Angle.deg210 = Math.PI * 7 / 6
            Angle.deg225 = Math.PI * 1.25
            Angle.deg240 = Math.PI * 4 / 3
            Angle.deg270 = Math.PI * 1.5
            Angle.deg300 = Math.PI * 5 / 3
            Angle.deg315 = Math.PI * 1.75
            Angle.deg330 = Math.PI * 11 / 6
            Angle.deg360 = Math.PI * 2
            resolve()
        })
    }
}
