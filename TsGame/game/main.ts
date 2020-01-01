/// <reference path='Game.ts'/>

window.onload = () => {
    let game = new Game($("#game-canvas").get(0) as HTMLCanvasElement)
    game.init()
    function gameLoop() {
        window.requestAnimationFrame(gameLoop)
        game.run()
    }
    gameLoop()
}
