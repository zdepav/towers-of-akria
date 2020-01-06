/// <reference path="../ColorSource.ts"/>

abstract class TextureGenerator extends ColorSource {

    protected color: ColorSource

    constructor(width: number, height: number, color: ColorSourceSource) {
        super(width, height)
        this.color = ColorSource.get(color ?? RgbaColor.black)
    }

}
