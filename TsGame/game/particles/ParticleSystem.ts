/// <reference path="../utils/ExpirableSet.ts"/>

class ParticleSystem extends ExpirableSet<Particle> {

    render(ctx: CanvasRenderingContext2D): void {
        for (const p of this.items) {
            p.render(ctx)
        }
    }
    
    step(time: number): void {
        if (this.items.length === 0) {
            return
        }
        let j = this.count
        for (let i = 0; i < j; ++i) {
            let item = this.items[i]
            item.step(time)
            if (item.expired) {
                --j
                if (i < j) {
                    this.items[i] = this.items[j]
                }
                this.items.pop()
            }
        }
    }
}
