/// <reference path="Coords.ts"/>
class DijkstraNode {
    constructor(x, y, previous) {
        this.previous = previous;
        this.distance = previous == null ? 0 : previous.distance + 1;
        this.pos = new Coords(x, y);
    }
}
//# sourceMappingURL=DijkstraNode.js.map