/// <reference path='Game.ts'/>

let game: Game = null

function gameLoop() {
    window.requestAnimationFrame(gameLoop)
    game.run()
}

window.onload = () => {
    Angles.init()
    AirTurret.init()
    EarthTurret.init()
    FireTurret.init()
    IceTurret.init()
    game = new Game($("#game-canvas").get(0) as HTMLCanvasElement)
    game.init()
    gameLoop()
}
