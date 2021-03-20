class PerlinGradient {

    private readonly width: number
    private readonly height: number
    private readonly data: Vec2[]

    constructor(width: number, height: number) {
        this.width = Math.ceil(width)
        this.height = Math.ceil(height)
        this.data = []
        let c = this.width * this.height
        for (let i = 0; i < c; ++i) {
            this.data.push(Vec2.randUnit())
        }
    }

    get(x: number, y: number): Vec2 {
        return this.data[Utils.wrap(x, 0, this.width) +
            Utils.wrap(y, 0, this.height) * this.width]
    }
}
