/// <reference path="ColorSource.ts"/>

abstract class GradientSource extends ColorSource {

    private colorStops: { pos: number, color: ColorSource }[]

    constructor(width: number, height: number) {
        super(width, height)
        this.colorStops = []
    }

    addColorStop(pos: number, color: ColorSource | RgbaColor | string): void {
        this.colorStops.push({ pos: pos, color: ColorSource.get(color) })
        this.colorStops.sort((a, b) => a.pos - b.pos)
    }

    protected getColorAtPosition(x: number, y: number, position: number): RgbaColor {
        if (this.colorStops.length == 0) {
            return RgbaColor.black
        } else if (this.colorStops.length == 1) {
            return this.colorStops[0].color.getColor(x, y)
        } else if (position <= this.colorStops[0].pos) {
            return this.colorStops[0].color.getColor(x, y)
        } else if (position >= this.colorStops[this.colorStops.length - 1].pos) {
            return this.colorStops[this.colorStops.length - 1].color.getColor(x, y)
        } else {
            let i = 1
            while (position > this.colorStops[i].pos) {
                ++i
            }
            return this.colorStops[i - 1].color.getColor(x, y).lerp(
                this.colorStops[i].color.getColor(x, y),
                (position - this.colorStops[i - 1].pos) / (this.colorStops[i].pos - this.colorStops[i - 1].pos)
            )
        }
    }

}
