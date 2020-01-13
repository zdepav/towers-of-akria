class PreRenderedImage {

    image: CanvasImageSource
    ctx: CanvasRenderingContext2D

    constructor(width: number, height: number) {
        let canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D
        this.image = canvas
    }

    saveImage(fileName: string): void {
        let a = document.createElement("a")
        a.setAttribute("download", fileName + ".png")
        a.setAttribute(
            "href",
            (this.image as HTMLCanvasElement)
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream")
        )
        a.setAttribute("target", "_blank")
        a.click()
    }

    cacheImage(id: string): void {
        if (Game.saveImages) {
            this.saveImage(id)
            let element = document.createElement('a')
            element.setAttribute('download', id + ".txt")
            element.setAttribute('href', 'data:text/octet-stream;charset=utf-8,' + encodeURIComponent(this.toBase64()))
            element.click()
        }
        localStorage.setItem(id, this.toBase64())
    }

    toBase64(): string {
        return (this.image as HTMLCanvasElement)
            .toDataURL("image/png")
            .replace(/^data:image\/png;base64,/, "")
    }
}
