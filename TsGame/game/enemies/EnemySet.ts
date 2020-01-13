/// <reference path="../utils/ExpirableSet.ts"/>

class EnemySet extends ExpirableSet<Enemy> {

    render(ctx: CanvasRenderingContext2D): void {
        for (const e of this.items) {
            e.render(ctx)
        }
    }

    find(point: Vec2, maxDistance: number): Enemy | null {
        if (this.count == 0) {
            return null
        }
        let t: Tile
        maxDistance *= maxDistance
        for (const e of this.items) {
            let dist = point.sqrDistanceTo(e.pos)
            if (dist <= maxDistance) {
                return e
            }
        }
        return null
    }

    findNearest(point: Vec2, maxDistance: number): Enemy | null {
        if (this.count == 0) {
            return null
        }
        let closestEnemy: Enemy | null = null
        let lowestDistance = Infinity
        maxDistance *= maxDistance
        for (const e of this.items) {
            let dist = point.sqrDistanceTo(e.pos)
            if (dist <= maxDistance && dist < lowestDistance) {
                lowestDistance = dist
                closestEnemy = e
            }
        }
        return closestEnemy
    }

    findInRange(point: Vec2, maxDistance: number): Enemy[] {
        if (this.count == 0) {
            return []
        }
        let enemies: Enemy[] = []
        maxDistance *= maxDistance
        for (const e of this.items) {
            if (point.sqrDistanceTo(e.pos) <= maxDistance) {
                enemies.push(e)
            }
        }
        return enemies
    }
}
