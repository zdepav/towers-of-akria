/// <reference path="Coords.ts"/>

class DijkstraNode {

    pos: Coords
    previous: DijkstraNode
    distance: number

    constructor(x: number, y: number, previous: DijkstraNode) {
        this.previous = previous
        this.distance = previous == null ? 0 : previous.distance + 1
        this.pos = new Coords(x, y)
    }

}
