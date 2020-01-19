window.addEventListener("load", () => {
    let container = document.getElementById("zptd-game-container") as HTMLElement
    let img = document.createElement("img")
    Game.initializeAndRun(
        new Promise<void>(resolve => {
            container.appendChild(img)
            img.alt = "competition screen"
            img.addEventListener("load", () => resolve())
            img.src = "itnetwork_winter_2019_1.jpg"
        }),
        duration => new Promise<void>(resolve => {
            setTimeout(() => {
                container.removeChild(img)
                resolve()
            }, duration)
        })
    )
})
