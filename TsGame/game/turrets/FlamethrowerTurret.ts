/// <reference path="../game.d.ts"/>

class FlamethrowerTurret extends Turret {

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
        ctx.drawImage(FlamethrowerTurret.image, this.tile.pos.x, this.tile.pos.y);
    }

    addType(type: TurretElement): void {
        if (this.type.count() >= 4) {
            return;
        }
        switch (type) {
            case TurretElement.Air:
                this.tile.turret = new PlasmaTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Earth:
                this.tile.turret = new EarthquakeTurret(this.tile, this.type.add(type));
                break;
            case TurretElement.Fire:
            case TurretElement.Water:
                this.type.add(type);
                break;
        }
    }

    static init(): Promise<void> {
        return Utils.getImageFromCache("td_tower_aeFW_flamethrower").then(tex => { FlamethrowerTurret.image = tex; }, () => new Promise<void>(resolve => {
            let c = new PreRenderedImage(64, 64);
            c.cacheImage("td_tower_aeFW_flamethrower");
            FlamethrowerTurret.image = c.image;
            resolve();
        }));
    }

}
