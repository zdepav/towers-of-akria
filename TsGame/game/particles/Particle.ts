/// <reference path="../utils/Expirable.ts"/>

abstract class Particle extends Expirable {

    abstract render(ctx: CanvasRenderingContext2D): void
}
