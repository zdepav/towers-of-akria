/// <reference path='game/Game.ts'/>

let game: Game = null

function gameLoop() {
    window.requestAnimationFrame(gameLoop)
    game.run()
}

window.onload = () => {
    game = new Game($("#game-canvas").get(0) as HTMLCanvasElement)
    game.init()
    gameLoop()
}
