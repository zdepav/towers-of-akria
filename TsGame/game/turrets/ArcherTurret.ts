/// <reference path="../game.d.ts"/>

class ArcherTurret extends Turret {

    private static image: CanvasImageSource;

    constructor(tile: Tile, type: TurretType) {
        super(tile, type);
    }

    step(time: number): void {
        super.step(time);
    }

    render(ctx: CanvasRenderingContext2D, preRender: boolean): void {
        super.render(ctx, preRender);
        if (preRender) {
            return;
        }
        ctx.drawImage(ArcherTurret.image, this.tile.pos.x, this.tile.pos.y);
    }

    addType(type: TurretElement): void {
        if (this.type.count() >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
            case TurretElement.Earth:
                this.type.add(type);
                break;
            case TurretElement.Fire:
                this.tile.turret = new SunTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Water:
                this.tile.turret = new MoonTurret(this.tile, this.type.add(type));
                break;
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache("td_tower_AEfw_archer").then(tex => { ArcherTurret.image = tex; }, () => new Promise<void>(resolve => {
            let c = new PreRenderedImage(64, 64);
            c.cacheImage("td_tower_AEfw_archer");
            ArcherTurret.image = c.image;
            resolve();
        }));
    }

}
