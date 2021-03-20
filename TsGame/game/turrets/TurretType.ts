enum TurretElement {
    Air,
    Earth,
    Fire,
    Water
}

class TurretType {

    private readonly type: number[]
    private c: number

    get air(): number { return this.type[TurretElement.Air] }

    get earth(): number { return this.type[TurretElement.Earth] }

    get fire(): number { return this.type[TurretElement.Fire] }

    get water(): number { return this.type[TurretElement.Water] }

    get count(): number { return this.c }

    constructor(type?: number[]) {
        this.type = type === undefined ? [0, 0, 0, 0] : type
        this.c = 0
        for (let i = 0; i < 4; ++i) {
            this.c += this.type[i]
        }
    }

    copy(): TurretType { return new TurretType(this.type.slice()) }

    add(type: TurretElement): void {
        ++this.type[type]
        ++this.c
    }

    with(type: TurretElement): TurretType {
        let ntype: number[] = []
        for (let e = TurretElement.Air; e <= TurretElement.Water; ++e) {
            ntype[e] = e === type ? this.type[e] + 1 : this.type[e]
        }
        return new TurretType(ntype)
    }

    contains(type: TurretElement): boolean { return this.type[type] > 0 }

    toArray(): TurretElement[] {
        let arr: TurretElement[] = []
        for (let i = 0; i < this.type[TurretElement.Air]; ++i) {
            arr.push(TurretElement.Air)
        }
        for (let i = 0; i < this.type[TurretElement.Earth]; ++i) {
            arr.push(TurretElement.Earth)
        }
        for (let i = 0; i < this.type[TurretElement.Fire]; ++i) {
            arr.push(TurretElement.Fire)
        }
        for (let i = 0; i < this.type[TurretElement.Water]; ++i) {
            arr.push(TurretElement.Water)
        }
        return arr
    }

    toColorArray(): string[] {
        let arr: string[] = []
        for (let e = TurretElement.Air; e <= TurretElement.Water; ++e) {
            for (let i = 0; i < this.type[e]; ++i) {
                arr.push(TurretType.getColor(e))
            }
        }
        return arr
    }

    static getColor(type: TurretElement): string {
        switch (type) {
            case TurretElement.Air:
                return "#d8d1ff"
            case TurretElement.Earth:
                return "#6dd13e"
            case TurretElement.Fire:
                return "#f7854c"
            case TurretElement.Water:
                return "#79b4f2"
            default:
                return "#000000"
        }
    }
}
