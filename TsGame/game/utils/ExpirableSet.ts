class ExpirableSet<T extends Expirable> {

    protected items: T[]

    get count() { return this.items.length }

    constructor() {
        this.items = []
    }

    add(item: T): void {
        if (this.count === this.items.length) {
            this.items.push(item)
        } else {
            this.items[this.items.length] = item
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
