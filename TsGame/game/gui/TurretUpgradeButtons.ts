/// <reference path="Button.ts"/>
/// <reference path="IGuiItem.ts"/>

class TurretUpgradeButton extends Button {
    
    private backColor: string
    private pressedColor: string

    targetTile: Tile | null
    type: TurretElement
    game: Game
    
    constructor(game: Game, x: number, y: number, w: number, h: number, type: TurretElement) {
        super(game, x, y, w, h)
        this.targetTile = null
        this.type = type
        let elementColor = RgbaColor.fromHex(TurretType.getColor(type))
        this.backColor = elementColor.lerp(RgbaColor.fromHex("#C0C0C0"), 0.5).toCss()
        this.pressedColor = elementColor.lerp(RgbaColor.fromHex("#A0A0A0"), 0.5).toCss()
    }

    protected onClick() {
        super.onClick()
        if (this.pressed && this.targetTile && this.targetTile.turret) {
            let turret = this.targetTile.turret
            if (!this.game.buyUpgrade(turret.upgradeCostMultiplier(this.type))) {
                return
            }
            turret.addType(this.type)
        }
    }

    step(time: number): void {
        super.step(time)
        if (!this.targetTile || !this.targetTile.turret) {
            return
        }
        let upgradeCostMultiplier = this.targetTile.turret.upgradeCostMultiplier(this.type)
        this.enabled = this.game.playerCanAffordUpgrade(upgradeCostMultiplier)
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.targetTile || !this.targetTile.turret) {
            return
        }
        let turret = this.targetTile.turret
        let info = turret.getInfoAfterUpgrade(this.type)
        if (info === undefined) {
            return
        }
        ctx.fillStyle = this.enabled ? "#606060" : "#808080"
        ctx.fillRect(this.x, this.y, this.w, this.h)
        ctx.fillStyle = this.pressed ? this.pressedColor : this.backColor
        ctx.fillRect(this.x + 2, this.y + 2, this.w - 4, this.h - 4)
        Tile.drawTowerGround(ctx, this.x + 4, this.y + 4)
        turret.renderPreviewAfterUpgrade(ctx, this.x + 4, this.y + 4, this.type)
        ctx.fillStyle = "#000000"
        ctx.textAlign = "left"
        ctx.textBaseline = "top"
        ctx.font = "bold 14px serif"
        ctx.fillText(info.name, this.x + 74, this.y + 8)
        ctx.font = "12px monospace"
        ctx.fillText(`Range:   ${info.range}`, this.x + 74, this.y + 30)
        ctx.fillText(`Max DPS: ${info.dps}`, this.x + 74, this.y + 48)
        ctx.font = "13px serif"
        Utils.fillWrappedText(ctx, info.description, this.x + 6, this.y + 74, this.w - 12, 14)
    }
}
