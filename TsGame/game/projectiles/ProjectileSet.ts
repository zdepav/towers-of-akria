/// <reference path="../utils/ExpirableSet.ts"/>

class ProjectileSet extends ExpirableSet<Projectile> {

    render(ctx: CanvasRenderingContext2D): void {
        for (const p of this.items) {
            p.render(ctx)
        }
    }

}
