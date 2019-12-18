/// <reference path='game/Game.ts'/>
let game = null;
function gameLoop() {
    window.requestAnimationFrame(gameLoop);
    game.run();
}
window.onload = () => {
    game = new Game($("#game-canvas").get(0));
    game.init();
    gameLoop();
};
//# sourceMappingURL=main.js.map