class EnemyWavePlanner {

    private timer: number
    private hp: number
    private enemyType: number

    game: Game
    spawnTile: Tile | null

    constructor(game: Game) {
        this.game = game
        this.spawnTile = null
        this.timer = 1
        this.hp = 10
        this.enemyType = 0
    }

    step(time: number) {
        this.timer -= time
        if (this.timer <= 0 && this.spawnTile !== null) {
            let armor = Math.floor(this.hp / 10)
            let e: Enemy
            switch (this.enemyType) {
                case 1:
                    e = new FastEnemy(this.game, this.spawnTile, this.hp, armor);
                    break;
                case 2:
                    e = new RegeneratingEnemy(this.game, this.spawnTile, this.hp, armor);
                    break;
                case 3:
                    e = new BigEnemy(this.game, this.spawnTile, this.hp, armor);
                    break;
                default:
                    e = new BasicEnemy(this.game, this.spawnTile, this.hp, armor);
                    break;
            }
            this.game.spawnEnemy(e)
            this.timer = 1
            this.hp += Math.max(Math.floor(this.hp / 100), 1)
            if (Math.random() < 0.1) {
                this.enemyType = Utils.randInt(0, 4)
            }
        }
    }
}
