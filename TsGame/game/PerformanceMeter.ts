class PerformanceMeter {

    private queue: number[]
    private sum: number

    constructor() {
        this.queue = []
        this.sum = 0
    }

    add(fps: number) {
        this.queue.push(fps)
        this.sum += fps
        if (this.queue.length > 100) {
            this.sum -= this.queue.shift()
        }
    }

    getFps() {
        return this.queue.length > 0 ? this.sum / this.queue.length : NaN
    }

}
