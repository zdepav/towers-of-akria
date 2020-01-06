/// <reference path="../utils/ExpirableSet.ts"/>

class ParticleSystem extends ExpirableSet<Particle> {

    render(ctx: CanvasRenderingContext2D): void {
        for (const p of this.items) {
            p.render(ctx)
        }
    }

}
