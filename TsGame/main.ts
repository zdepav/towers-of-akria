/// <reference path='utils.ts'/>
/// <reference path='turrets.ts'/>
/// <reference path='game.ts'/>

let game: Game = null

function gameLoop() {
    window.requestAnimationFrame(gameLoop)
    game.run()
}

window.onload = () => {
    EarthTurret.init()
    AirTurret.init()
    Angles.init()
    game = new Game(<HTMLCanvasElement>$("#game-canvas").get(0))
    game.init()
    gameLoop()
}
