/// <reference path="../utils/Expirable.ts"/>

abstract class Projectile extends Expirable {

    abstract render(ctx: CanvasRenderingContext2D): void

}
