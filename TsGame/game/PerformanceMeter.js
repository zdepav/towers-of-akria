class PerformanceMeter {
    constructor() {
        this.queue = [];
        this.sum = 0;
    }
    add(fps) {
        this.queue.push(fps);
        this.sum += fps;
        if (this.queue.length > 100) {
            this.sum -= this.queue.shift();
        }
    }
    getFps() {
        return this.queue.length > 0 ? this.sum / this.queue.length : NaN;
    }
}
//# sourceMappingURL=PerformanceMeter.js.map