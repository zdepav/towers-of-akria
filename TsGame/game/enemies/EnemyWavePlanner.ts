enum EnemyType {
    Basic,
    Fast,
    Regenerating,
    Shielding,
    Big
}

class EnemyWavePlanner {

    private timer: number
    private enemyHp: number
    private enemyArmor: number
    private avgWaveSize: number
    private wave: Enemy[]
    private _waveNumber: number

    game: Game
    spawnTile: Tile | null

    get waveNumber(): number { return this._waveNumber }

    constructor(game: Game) {
        this.game = game
        this.spawnTile = null
        this.timer = 1
        this.enemyHp = 10
        this.enemyArmor = 0
        this.wave = []
        this.avgWaveSize = 10
        this._waveNumber = 0
    }

    step(time: number) {
        if (!this.spawnTile) {
            return
        }
        this.timer -= time
        if (this.timer > 0) {
            return
        }
        if (this.wave.length == 0) {
            let waveSize = Math.floor(this.avgWaveSize) + Rand.i(-3, 4)
            let enemyType = this.chooseEnemyType()
            if (enemyType === EnemyType.Big) {
                waveSize = Math.max(Math.floor(waveSize / 5), 1)
            }
            for (let i = 0; i < waveSize; ++i) {
                this.wave.push(this.createEnemy(enemyType))
            }
            ++this._waveNumber
            this.enemyArmor = Math.floor(this.enemyHp / 2)
            this.enemyHp = this.enemyHp + Utils.clamp(Math.floor(this.enemyHp / 10), 1, 10)
            this.updateWaveSize()
        }
        this.game.spawnEnemy(this.wave.pop() as Enemy)
        this.timer = this.wave.length > 0 ? 0.75 : 5
    }

    private updateWaveSize() {
        if (this.avgWaveSize < 15) {
            this.avgWaveSize += 0.25
        } else if (this.avgWaveSize < 22) {
            this.avgWaveSize += 0.2
        } else if (this.avgWaveSize < 30) {
            this.avgWaveSize += 0.15
        }
    }

    private chooseEnemyType(): EnemyType {
        if (this._waveNumber % 8 === 7) {
            return EnemyType.Big
        }
        if (this._waveNumber < 3) {
            return EnemyType.Basic
        } else if (this._waveNumber < 7) {
            return Rand.chance(0.5) ? EnemyType.Basic : EnemyType.Fast
        } else if (this._waveNumber < 15) {
            return Rand.item([EnemyType.Basic, EnemyType.Fast, EnemyType.Regenerating]) as EnemyType
        } else {
            return Rand.item([EnemyType.Basic, EnemyType.Fast, EnemyType.Regenerating, EnemyType.Shielding]) as EnemyType
        }
    }

    private createEnemy(type: EnemyType): Enemy {
        switch (type) {
            case EnemyType.Fast:
                return new FastEnemy(this.game, this._waveNumber + 1, this.spawnTile as Tile, this.enemyHp, this.enemyArmor)
            case EnemyType.Regenerating:
                return new RegeneratingEnemy(this.game, this._waveNumber + 1, this.spawnTile as Tile, this.enemyHp, this.enemyArmor)
            case EnemyType.Shielding:
                return new ShieldingEnemy(this.game, this._waveNumber + 1, this.spawnTile as Tile, this.enemyHp, this.enemyArmor)
            case EnemyType.Big:
                return new BigEnemy(this.game, this._waveNumber + 1, this.spawnTile as Tile, this.enemyHp, this.enemyArmor)
            default:
                return new BasicEnemy(this.game, this._waveNumber + 1, this.spawnTile as Tile, this.enemyHp, this.enemyArmor)
        }
    }
}
