class Curve {

    static linear(x: number): number { return x }

    static arc(x: number): number { return Math.sqrt(x * (2 - x)) }

    static invArc(x: number): number { return 1 - Math.sqrt(1 - x * x) }

    static sqr(x: number): number { return x * x }

    static sqrt(x: number): number { return Math.sqrt(x) }

    static sin(x: number): number { return (1 - Math.cos(x * Math.PI)) * 0.5 }
}
