/// <reference path='Game.ts'/>

class GameItem {

    game: Game

    constructor(game: Game) {
        this.game = game
    }

    step(time: number) { }

    render(ctx: CanvasRenderingContext2D, preRender: boolean) { }

}
