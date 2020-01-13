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
        for (let i = 0; i < this.count; ++i) {
            this.items[i].step(time)
        }
        this.clearWhere(item => item.expired)
    }

    clear(): void {
        if (this.items.length > 0) {
            this.items.splice(0, this.items.length)
        }
    }

    clearWhere(condition: (item: T) => boolean): void {
        let j = this.count
        for (let i = 0; i < j;) {
            let item = this.items[i]
            if (condition(item)) {
                --j
                if (i < j) {
                    this.items[i] = this.items[j]
                }
                this.items.pop()
            } else ++i
        }
    }
}
