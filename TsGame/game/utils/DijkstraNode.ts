class DijkstraNode {

    pos: Vec2
    previous: DijkstraNode | null
    distance: number

    constructor(x: number, y: number, previous?: DijkstraNode) {
        if (previous === undefined) {
            this.previous = null
            this.distance = 0
        } else {
            this.previous = previous
            this.distance = previous.distance + 1
        }
        this.pos = new Vec2(x, y)
    }

}
