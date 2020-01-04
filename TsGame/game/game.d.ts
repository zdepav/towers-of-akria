export class Utils {
    static hex: string
    static sign(value: number): number
    /**
     * @param min min value (inclusive)
     * @param max max value (inclusive)
     */
    static clamp(value: number, min: number, max: number): number
    /**
     * @param min min value (inclusive)
     * @param max max value (exclusive)
     */
    static wrap(value: number, min: number, max: number): number
    static lerp(f1: number, f2: number, ammount: number): number
    static lerpInt(f1: number, f2: number, ammount: number): number
    static interpolateSmooth(f1: number, f2: number, ammount: number): number
    static flatten(width: number, x: number, y: number): number
    /**
     * @param steps number of values between 0 and 1
     */
    static granulate(value: number, steps: number): number
    static euclideanDistance(dx: number, dy: number): number
    static manhattanDistance(dx: number, dy: number): number
    static chebyshevDistance(dx: number, dy: number): number
    static minkowskiDistance(dx: number, dy: number): number
    static byteToHex(byte: number): string
    static ldx(distance: number, direction: number, startX?: number): number
    static ldy(distance: number, direction: number, startY?: number): number
    static ld(distance: number, direction: number, startX?: number, startY?: number): Vec2
    /**
     * @param min min value (inclusive)
     * @param max max value (exclusive)
     */
    static rand(min: number, max: number): number
    /**
     * @param min min value (inclusive)
     * @param max max value (exclusive)
     */
    static randInt(min: number, max: number): number
    static randSign(num: number): number
    static isString(obj: any): boolean
    static getImageFromCache(id: string): Promise<CanvasImageSource>
}
export enum MouseButton { Left, Middle, Right, Back, Forward }
export class RenderablePath {
    path: Path2D
    fill: string | CanvasPattern | CanvasGradient
    constructor(path: Path2D, fill: string | CanvasPattern | CanvasGradient)
    render(ctx: CanvasRenderingContext2D): void
}
export class RenderablePathSet {
    paths: RenderablePath[]
    constructor(paths?: RenderablePath[])
    push(path: RenderablePath): void
    pushNew(path: Path2D, fill: string | CanvasPattern | CanvasGradient | null): void
    pushPolygon(points: number[], fill: string | CanvasPattern | CanvasGradient | null, originX?: number, originY?: number): void
    render(ctx: CanvasRenderingContext2D): void
}
export class PreRenderedImage {
    image: CanvasImageSource
    ctx: CanvasRenderingContext2D
    constructor(width: number, height: number)
    saveImage(fileName: string): void
    cacheImage(id: string): void
    toBase64(): string
}
export class PerformanceMeter {
    constructor()
    add(fps: number): void
    getFps(): number
}
export class Rect {
    x: number
    y: number
    w: number
    h: number
    constructor(x: number, y: number, w: number, h: number)
}
export class Vec2 {
    static zero: Vec2
    x: number
    y: number
    constructor(x: number, y: number)
    add(v: Vec2): Vec2
    addu(x: number, y: number): Vec2
    sub(v: Vec2): Vec2
    subu(x: number, y: number): Vec2
    dot(v: Vec2): number
    dotu(x: number, y: number): number
    mul(f: number): Vec2
    angleTo(v: Vec2): number
    rotate(angle: number): Vec2
    rotateAround(origin: Vec2, angle: number): Vec2
    distanceTo(v: Vec2): number
    length(): number
    normalize(): Vec2
    isZero(): boolean
    equals(v: Vec2): boolean
    copy(): Vec2
    static randUnit(): Vec2
    static randUnit3d(): Vec2
    static onEllipse(r1: number, r2: number, angle: number, center?: Vec2): Vec2
    static init(): void
}
export class DijkstraNode {
    pos: Vec2
    previous: DijkstraNode | null
    distance: number
    constructor(x: number, y: number, previous?: DijkstraNode)
}
export class Angle {
    static deg10: number
    static deg15: number
    static deg18: number
    static deg20: number
    static deg30: number
    static deg36: number
    static deg45: number
    static deg60: number
    static deg72: number
    static deg90: number
    static deg120: number
    static deg135: number
    static deg150: number
    static deg180: number
    static deg210: number
    static deg225: number
    static deg240: number
    static deg270: number
    static deg300: number
    static deg315: number
    static deg330: number
    static deg360: number
    static deg(radians: number): number
    static rand(): number
    static wrap(angle: number): number
    static between(angle1: number, angle2: number): number
    static init(): void
}
export class Curve {
    static linear(x: number): number
    static arc(x: number): number
    static invArc(x: number): number
    static sqr(x: number): number
    static sqrt(x: number): number
    static sin(x: number): number
}
export enum TileType { Unknown, Empty, WallGen, Tower, Path, Spawn, HQ }
export class Tile {
    game: Game
    pos: Vec2
    type: TileType
    turret: Turret | null
    constructor(game: Game, x: number, y: number, type: TileType, ctx: CanvasRenderingContext2D)
    step(time: number): void
    render(ctx: CanvasRenderingContext2D, preRender: boolean): void
    onClick(button: MouseButton, x: number, y: number): void
    static init(): Promise<void>
    static drawPathGround(ctx: CanvasRenderingContext2D, x: number, y: number): void
}
export enum InitializationStatus { Uninitialized, Initializing, Initialized }
export class Game {
    static saveImages: boolean
    mapWidth: number
    mapHeight: number
    width: number
    height: number
    particles: ParticleSystem
    selectedTurretElement: TurretElement | null
    init(): Promise<void>
    getMousePosition(): Vec2
    static initializeAndRun(): void
}
type ColorSourceSource = ColorSource | RgbaColor | string | null
export abstract class ColorSource {
    constructor(width: number, height: number)
    getColor(x: number, y: number): RgbaColor
    protected abstract _getColor(x: number, y: number): RgbaColor
    generateInto(ctx: CanvasRenderingContext2D, x: number, y: number): void
    generatePrImage(): PreRenderedImage
    generateImage(): CanvasImageSource
    static get(color: ColorSourceSource): ColorSource
}
export class BufferedColorSource extends ColorSource {
    constructor(width: number, height: number, source: ColorSource, scale?: number)
    protected _getColor(x: number, y: number): RgbaColor
}
export class CanvasColorSource extends ColorSource {
    constructor(canvas: HTMLCanvasElement, buffer?: boolean)
    protected _getColor(x: number, y: number): RgbaColor
}
export class RgbaColor {
    static transparent: RgbaColor
    static black: RgbaColor
    static red: RgbaColor
    static green: RgbaColor
    static blue: RgbaColor
    static yellow: RgbaColor
    static cyan: RgbaColor
    static magenta: RgbaColor
    static white: RgbaColor
    r: number
    g: number
    b: number
    a: number
    constructor(r: number, g: number, b: number, a?: number)
    multiplyFloat(ammount: number, multiplyAlpha?: boolean): RgbaColor
    multiply(c: RgbaColor): RgbaColor
    add(c: RgbaColor): RgbaColor
    blend(c: RgbaColor): RgbaColor
    withRed(r: number): RgbaColor
    withGreen(g: number): RgbaColor
    withBlue(b: number): RgbaColor
    withAlpha(a: number): RgbaColor
    lerp(c: RgbaColor, ammount: number): RgbaColor
    addNoise(intensity: number, saturation: number, coverage: number): RgbaColor
    source(width?: number, height?: number): RgbaColorSource
    toCss(): string
    static fromHex(color: string): RgbaColor
    static init(): void
}
export class RgbaColorSource extends ColorSource {
    color: RgbaColor
    constructor(color: RgbaColor, width?: number, height?: number)
    protected _getColor(x: number, y: number): RgbaColor
}
export abstract class TextureGenerator extends ColorSource {
    protected color: ColorSource
    constructor(width: number, height: number, color: ColorSourceSource)
}
export enum CellularTextureType { Cells, Net, Balls }
export enum CellularTextureDistanceMetric { Euclidean, Manhattan, Chebyshev, Minkowski }
export class CellularTextureGenerator extends TextureGenerator {
    constructor(width: number, height: number, density: number, color1: ColorSourceSource, color2: ColorSourceSource,
        type?: CellularTextureType, metric?: CellularTextureDistanceMetric, curve?: (x: number) => number)
    protected _getColor(x: number, y: number): RgbaColor
}
export class NoiseTextureGenerator extends TextureGenerator {
    constructor(width: number, height: number, color: ColorSourceSource, intensity: number, saturation: number, coverage: number)
    protected _getColor(x: number, y: number): RgbaColor
}
export class PerlinGradient {
    constructor(width: number, height: number)
    get(x: number, y: number): Vec2
}
export abstract class PerlinTextureGenerator extends TextureGenerator {
    protected color2: ColorSource
    protected scale: number
    protected curve: (x: number) => number
    constructor(width: number, height: number, color1: ColorSourceSource, color2: ColorSourceSource, scale?: number, curve?: (x: number) => number)
    protected dotGridGradient(gradient: PerlinGradient, ix: number, iy: number, x: number, y: number): number
    protected perlin(gradient: PerlinGradient, x: number, y: number): number
}
export class PerlinNoiseTextureGenerator extends PerlinTextureGenerator {
    constructor(width: number, height: number, color1: ColorSourceSource, color2: ColorSourceSource, scale?: number, curve?: (x: number) => number)
    protected _getColor(x: number, y: number): RgbaColor
}
export class CloudsTextureGenerator extends PerlinTextureGenerator {
    constructor(width: number, height: number, color1: ColorSourceSource, color2: ColorSourceSource, scale?: number, curve?: (x: number) => number)
    protected _getColor(x: number, y: number): RgbaColor
}
export class VelvetTextureGenerator extends PerlinTextureGenerator {
    constructor(width: number, height: number, color1: ColorSourceSource, color2: ColorSourceSource, scale?: number, curve?: (x: number) => number)
    protected _getColor(x: number, y: number): RgbaColor
}
export class GlassTextureGenerator extends PerlinTextureGenerator {
    constructor(width: number, height: number, color1: ColorSourceSource, color2: ColorSourceSource, scale?: number,
        turbulence?: number, curve?: (x: number) => number)
    protected _getColor(x: number, y: number): RgbaColor
}
export class FrostedGlassTextureGenerator extends PerlinTextureGenerator {
    constructor(width: number, height: number, color1: ColorSourceSource, color2: ColorSourceSource, scale?: number, curve?: (x: number) => number)
    protected _getColor(x: number, y: number): RgbaColor
}
export class BarkTextureGenerator extends PerlinTextureGenerator {
    constructor(width: number, height: number, color1: ColorSourceSource, color2: ColorSourceSource,
        scale?: number, turbulence?: number, curve?: (x: number) => number)
    protected _getColor(x: number, y: number): RgbaColor
}
export class CirclesTextureGenerator extends PerlinTextureGenerator {
    constructor(width: number, height: number, color1: ColorSourceSource, color2: ColorSourceSource, background: ColorSourceSource,
        scale?: number, ringCount?: number, turbulence?: number, curve?: (x: number) => number)
    protected _getColor(x: number, y: number): RgbaColor
}
export class CamouflageTextureGenerator extends PerlinTextureGenerator {
    constructor(width: number, height: number, color1: ColorSourceSource, color2: ColorSourceSource, scale?: number, curve?: (x: number) => number)
    protected _getColor(x: number, y: number): RgbaColor
}
export abstract class GradientSource extends ColorSource {
    constructor(width: number, height: number)
    addColorStop(pos: number, color: ColorSource | RgbaColor | string): void
    protected getColorAtPosition(x: number, y: number, position: number): RgbaColor
}
export class LinearGradientSource extends GradientSource {
    constructor(width: number, height: number, x1: number, y1: number, x2: number, y2: number)
    protected _getColor(x: number, y: number): RgbaColor
}
export class RadialGradientSource extends GradientSource {
    constructor(width: number, height: number, x: number, y: number, r1: number, r2: number)
    protected _getColor(x: number, y: number): RgbaColor
}
export abstract class ShapeSource extends ColorSource {
    protected color: ColorSource
    protected background: ColorSource
    constructor(width: number, height: number, color: ColorSourceSource, background: ColorSourceSource)
}
export class RectangleSource extends ShapeSource {
    constructor(width: number, height: number, x: number, y: number, w: number, h: number, color: ColorSourceSource, background: ColorSourceSource)
    protected _getColor(x: number, y: number): RgbaColor
}
export class CircleSource extends ShapeSource {
    constructor(width: number, height: number, x: number, y: number, r: number, color: ColorSourceSource, background: ColorSourceSource)
    protected _getColor(x: number, y: number): RgbaColor
}
export class EllipseSource extends ShapeSource {
    constructor(width: number, height: number, x: number, y: number, r1: number, r2: number, color: ColorSourceSource, background: ColorSourceSource)
    protected _getColor(x: number, y: number): RgbaColor
}
export class PathSource extends ShapeSource {
    constructor(width: number, height: number, path: Path2D, color: ColorSourceSource, background: ColorSourceSource, fillRule?: CanvasFillRule)
    protected _getColor(x: number, y: number): RgbaColor
}
export abstract class CombiningSource extends ColorSource {
    protected color1: ColorSource
    protected color2: ColorSource
    constructor(width: number, height: number, color1: ColorSourceSource, color2: ColorSourceSource)
    protected _getColor(x: number, y: number): RgbaColor
    protected abstract combine(a: RgbaColor, b: RgbaColor): RgbaColor
}
export class AddingSource extends CombiningSource {
    constructor(width: number, height: number, color1: ColorSourceSource, color2: ColorSourceSource)
    protected combine(a: RgbaColor, b: RgbaColor): RgbaColor
}
export class MultiplyingSource extends CombiningSource {
    constructor(width: number, height: number, color1: ColorSourceSource, color2: ColorSourceSource)
    protected combine(a: RgbaColor, b: RgbaColor): RgbaColor
}
export class BlendingSource extends CombiningSource {
    constructor(width: number, height: number, color1: ColorSourceSource, color2: ColorSourceSource)
    protected combine(a: RgbaColor, b: RgbaColor): RgbaColor
}
export class LerpingSource extends CombiningSource {
    constructor(width: number, height: number, color1: ColorSourceSource, color2: ColorSourceSource, coeficient: number
    )
    protected combine(a: RgbaColor, b: RgbaColor): RgbaColor
}
export abstract class TransformingSource extends ColorSource {
    protected source: ColorSource
    constructor(width: number, height: number, source: ColorSource)
    protected _getColor(x: number, y: number): RgbaColor
    protected abstract reverseTransform(x: number, y: number): Vec2
}
export class TranslatingSource extends TransformingSource {
    constructor(width: number, height: number, source: ColorSource, xd: number, yd: number)
    protected reverseTransform(x: number, y: number): Vec2
}
export class RotatingSource extends TransformingSource {
    constructor(width: number, height: number, source: ColorSource, angle: number, originX: number, originY: number)
    protected reverseTransform(x: number, y: number): Vec2
}
export class ScalingSource extends TransformingSource {
    constructor(width: number, height: number, source: ColorSource, scale: number | Vec2, originX: number, originY: number)
    protected reverseTransform(x: number, y: number): Vec2
}
export class FisheyeSource extends TransformingSource {
    constructor(width: number, height: number, source: ColorSource, scale: number, originX: number, originY: number, radius: number)
    protected reverseTransform(x: number, y: number): Vec2
}
export class PolarSource extends TransformingSource {
    constructor(width: number, height: number, source: ColorSource, sourceWidth: number, sourceHeight: number)
    protected reverseTransform(x: number, y: number): Vec2
}
export class AntialiasedSource extends ColorSource {
    constructor(width: number, height: number, source: ColorSource)
    protected _getColor(x: number, y: number): RgbaColor
}
export class Particle {
    step(time: number): void
    render(ctx: CanvasRenderingContext2D): void
    isDead(): boolean
}
export class SmokeParticle extends Particle {
    constructor(x: number, y: number, startSize: number)
    step(time: number): void
    render(ctx: CanvasRenderingContext2D): void
    isDead(): boolean
}
export class ElementSparkParticle extends Particle {
    constructor(x: number, y: number, type: TurretElement)
    step(time: number): void
    render(ctx: CanvasRenderingContext2D): void
    isDead(): boolean
}
export class ParticleSystem {
    game: Game
    constructor(game: Game)
    add(p: Particle): void
    step(time: number): void
    render(ctx: CanvasRenderingContext2D, preRender: boolean): void
}
