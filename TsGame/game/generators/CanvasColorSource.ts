/// <reference path="ColorSource.ts"/>

class CanvasColorSource extends ColorSource {

    private readonly ctx: CanvasRenderingContext2D
    private readonly data: RgbaColor[] | null

    constructor(canvas: HTMLCanvasElement, buffer: boolean = false) {
        super(canvas.width, canvas.height)
        this.ctx = <CanvasRenderingContext2D>canvas.getContext('2d')
        if (buffer) {
            let data = this.ctx.getImageData(0, 0, this.width, this.height).data
            this.data = []
            let c = this.width * this.height * 4
            for (let i = 0; i < c; i += 4) {
                this.data.push(new RgbaColor(data[i], data[i + 1], data[i + 2], data[i + 3]))
            }
        } else {
            this.data = null
        }
    }

    protected _getColor(x: number, y: number): RgbaColor {
        x = Math.floor(x)
        y = Math.floor(y)
        if (this.data) {
            return this.data[Utils.flatten(this.width, x, y)]
        } else {
            const data = this.ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data
            return new RgbaColor(data[0], data[1], data[2], data[3])
        }
    }

    generateInto(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.drawImage(this.ctx.canvas, 0, 0)
    }
}
