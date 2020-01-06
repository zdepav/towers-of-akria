/// <reference path="../utils/ExpirableSet.ts"/>

class EnemySet extends ExpirableSet<Enemy> {

    render(ctx: CanvasRenderingContext2D): void {
        for (const e of this.items) {
            e.render(ctx)
        }
    }

}
