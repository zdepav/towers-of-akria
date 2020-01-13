abstract class Expirable {

    abstract get expired(): boolean

    abstract step(time: number): void

}
