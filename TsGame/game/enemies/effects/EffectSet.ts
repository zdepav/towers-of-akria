/// <reference path="../../utils/ExpirableSet.ts"/>

class EffectSet extends ExpirableSet<Effect> {

    add(effect: Effect): void {
        if (this.count > 0) {
            let j = this.count
            for (let i = 0; i < j; ++i) {
                let item = this.items[i]
                if (effect.merge(item) || effect.incompatibleWith(item)) {
                    --j
                    if (i < j) {
                        this.items[i] = this.items[j]
                        this.items.pop()
                    }
                }
            }
        }
        super.add(effect)
    }

    colorize(color: RgbaColor): RgbaColor {
        for (const e of this.items) {
            color = e.colorize(color)
        }
        return color
    }
}
