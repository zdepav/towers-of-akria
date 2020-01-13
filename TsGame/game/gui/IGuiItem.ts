interface IGuiItem {
    
    game: Game

    pointIsInside(point: Vec2): boolean

    onMouseDown(button: MouseButton): void

    onMouseMove(): void

    onMouseUp(button: MouseButton): void

    step(time: number): void

    render(ctx: CanvasRenderingContext2D): void
}
