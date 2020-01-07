class EnemyWavePlanner {

    private timer: number

    game: Game
    spawnTile: Tile | null

    constructor(game: Game) {
        this.game = game
        this.spawnTile = null
        this.timer = 1
    }

    step(time: number) {
        this.timer -= time
        if (this.timer <= 0 && this.spawnTile !== null) {
            this.game.spawnEnemy(new BasicEnemy(this.game, this.spawnTile, 50, 10))
            this.timer = 1
        }
    }

}
