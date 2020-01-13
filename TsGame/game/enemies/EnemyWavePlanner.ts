class EnemyWavePlanner {

    private timer: number
    private hp: number

    game: Game
    spawnTile: Tile | null

    constructor(game: Game) {
        this.game = game
        this.spawnTile = null
        this.timer = 1
        this.hp = 10
    }

    step(time: number) {
        this.timer -= time
        if (this.timer <= 0 && this.spawnTile !== null) {
            this.game.spawnEnemy(new BasicEnemy(this.game, this.spawnTile, this.hp, Math.floor(this.hp / 10)))
            this.timer = 1
            this.hp += Math.max(Math.floor(this.hp / 100), 1)
        }
    }
}
