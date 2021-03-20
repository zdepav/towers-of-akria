/// <reference path="../ColorSource.ts"/>

abstract class ShapeSource extends ColorSource {

    protected color: ColorSource
    protected background: ColorSource

    protected constructor(
        width: number, height: number,
        color: ColorSourceSource,
        background: ColorSourceSource
    ) {
        super(width, height)
        this.color = ColorSource.get(color ?? RgbaColor.white)
        this.background = ColorSource.get(background ?? RgbaColor.black)
    }
}
