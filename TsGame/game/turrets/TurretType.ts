/// <reference path="../game.d.ts"/>

enum TurretElement {
    Air,
    Earth,
    Fire,
    Water
}

class TurretType {

    private type: number[]

    constructor(type?: number[]) {
        this.type = type === undefined ? [0, 0, 0, 0] : type
    }

    copy(): TurretType { return new TurretType(this.type.slice()) }

    add(elem: TurretElement): TurretType {
        ++this.type[elem]
        return this
    }

    air(): number { return this.type[TurretElement.Air] }

    earth(): number { return this.type[TurretElement.Earth] }

    fire(): number { return this.type[TurretElement.Fire] }

    water(): number { return this.type[TurretElement.Water] }

    count(): number {
        let c = 0
        for (let i = 0; i < 4; ++i) {
            c += this.type[i]
        }
        return c
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

class TurretInfo {

    name: string
    description: string
    range: number
    dps: string

    constructor(name: string, description: string, range: number, dps: string) {
        this.name = name
        this.description = description
        this.range = range
        this.dps = dps
    }

}
