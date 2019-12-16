/// <reference path='utils.ts'/>
/// <reference path='turrets.ts'/>
/// <reference path='game.ts'/>

let game: Game = null

function gameLoop() {
    window.requestAnimationFrame(gameLoop)
    game.run()
}

window.onload = () => {
    game = new Game(<HTMLCanvasElement>$("#game-canvas").get(0))
    game.init()
    gameLoop()
}
