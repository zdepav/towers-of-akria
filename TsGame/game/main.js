window.onload = function () {
    var game = new Game($("#game-canvas").get(0));
    game.init();
    function gameLoop() {
        window.requestAnimationFrame(gameLoop);
        game.run();
    }
    gameLoop();
};
//# sourceMappingURL=main.js.map