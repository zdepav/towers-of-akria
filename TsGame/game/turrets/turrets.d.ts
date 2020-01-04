export enum TurretElement { Air, Earth, Fire, Water }
export class TurretType {
    constructor(type?: number[])
    copy(): TurretType
    add(elem: TurretElement): TurretType
    air(): number
    earth(): number
    fire(): number
    water(): number
    count(): number
    contains(type: TurretElement): boolean
    toArray(): TurretElement[]
    toColorArray(): string[]
    static getColor(type: TurretElement): string
}
export class TurretInfo {
    name: string
    description: string
    range: number
    dps: string
    constructor(name: string, description: string, range: number, dps: string)
}
export class Turret {
    protected center: Vec2
    protected tile: Tile
    protected hp: number
    protected cooldown: number
    protected type: TurretType
    game: Game
    get ready(): boolean
    constructor(tile: Tile, type?: TurretType)
    step(time: number): void
    render(ctx: CanvasRenderingContext2D, preRender: boolean): void
    getType(): TurretType
    /**
     * returns multiplier for upgrade cost if upgrade is possible or -1 if not
     * @param type upgrade type
     */
    upgradeCostMultiplier(type: TurretElement): number
    addType(type: TurretElement): void
    getInfo(type?: TurretType): TurretInfo | undefined
    static initAll(): Promise<void[]>
}
export class AcidTurret extends Turret {
    constructor(tile: Tile, type: TurretType)
    step(time: number): void
    render(ctx: CanvasRenderingContext2D, preRender: boolean): void
    addType(type: TurretElement): void
    static init(): Promise<void>
    private static preRenderFrame(texture: CanvasImageSource, targetCtx: CanvasRenderingContext2D, frame: number): void
}
export class AirTurret extends Turret {
    static image: CanvasImageSource
    angle: number
    constructor(tile: Tile, type: TurretType)
    step(time: number): void
    render(ctx: CanvasRenderingContext2D, preRender: boolean): void
    addType(type: TurretElement): void
    static init(): Promise<void>
}
export class ArcaneTurret extends Turret {
    constructor(tile: Tile, type: TurretType)
    step(time: number): void
    render(ctx: CanvasRenderingContext2D, preRender: boolean): void
    addType(type: TurretElement): void
    static init(): Promise<void>
    static prepareGradient(color: RgbaColor): LinearGradientSource
    static prepareGround(base: ColorSource): ColorSource
}
export class ArcherTurret extends Turret {
    constructor(tile: Tile, type: TurretType)
    step(time: number): void
    render(ctx: CanvasRenderingContext2D, preRender: boolean): void
    addType(type: TurretElement): void
    static init(): Promise<void>
}
export class CannonTurret extends Turret {
    constructor(tile: Tile, type: TurretType)
    step(time: number): void
    render(ctx: CanvasRenderingContext2D, preRender: boolean): void
    addType(type: TurretElement): void
    static init(): Promise<void>
}
export class EarthquakeTurret extends Turret {
    constructor(tile: Tile, type: TurretType)
    step(time: number): void
    render(ctx: CanvasRenderingContext2D, preRender: boolean): void
    addType(type: TurretElement): void
    static init(): Promise<void>
    static path(ctx: CanvasRenderingContext2D): void
}
export class EarthTurret extends Turret {
    constructor(tile: Tile, type: TurretType)
    step(time: number): void
    render(ctx: CanvasRenderingContext2D, preRender: boolean): void
    addType(type: TurretElement): void
    static init(): Promise<void>
    private static preRender1(ctx: CanvasRenderingContext2D, y: number): void
    private static preRender2(ctx: CanvasRenderingContext2D, y: number): void
    private static preRender3(ctx: CanvasRenderingContext2D, y: number): void
    private static preRender4(ctx: CanvasRenderingContext2D, y: number): void
}
export class FireTurret extends Turret {
    constructor(tile: Tile, type: TurretType)
    spawnSmoke(): void
    step(time: number): void
    render(ctx: CanvasRenderingContext2D, preRender: boolean): void
    addType(type: TurretElement): void
    static init(): Promise<void>
}
export class FlamethrowerTurret extends Turret {
    constructor(tile: Tile, type: TurretType)
    step(time: number): void
    render(ctx: CanvasRenderingContext2D, preRender: boolean): void
    addType(type: TurretElement): void
    static init(): Promise<void>
}
export class IceTurret extends Turret {
    constructor(tile: Tile, type: TurretType)
    step(time: number): void
    render(ctx: CanvasRenderingContext2D, preRender: boolean): void
    addType(type: TurretElement): void
    static init(): Promise<void>
    private static mkBranch(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, size: number): void
    private static preRender(ctx: CanvasRenderingContext2D, baseY: number, fill: string | CanvasPattern, drawCenter?: boolean): void
}
export class LightningTurret extends Turret {
    constructor(tile: Tile, type: TurretType)
    step(time: number): void
    render(ctx: CanvasRenderingContext2D, preRender: boolean): void
    addType(type: TurretElement): void
    static init(): Promise<void>
}
export class MoonTurret extends Turret {
    constructor(tile: Tile, type: TurretType)
    step(time: number): void
    render(ctx: CanvasRenderingContext2D, preRender: boolean): void
    addType(type: TurretElement): void
    static init(): Promise<void>
}
export class PlasmaTurret extends Turret {
    constructor(tile: Tile, type: TurretType)
    step(time: number): void
    render(ctx: CanvasRenderingContext2D, preRender: boolean): void
    addType(type: TurretElement): void
    static init(): Promise<void>
    private static preRender(ctx: CanvasRenderingContext2D, tex1: ColorSource, tex2: ColorSource, y: number): void
}
export class SunTurret extends Turret {
    constructor(tile: Tile, type: TurretType)
    step(time: number): void
    render(ctx: CanvasRenderingContext2D, preRender: boolean): void
    addType(type: TurretElement): void
    static init(): Promise<void>
}
export class WaterTurret extends Turret {
    constructor(tile: Tile, type: TurretType)
    step(time: number): void
    render(ctx: CanvasRenderingContext2D, preRender: boolean): void
    addType(type: TurretElement): void
    static init(): Promise<void>
    private static preRender(groundTex: CanvasImageSource, sandTex: CanvasImageSource): CanvasImageSource
}
