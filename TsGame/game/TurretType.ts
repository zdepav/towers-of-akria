enum TurretElement {
    Air,
    Earth,
    Fire,
    Water
}

class TurretType {

    private type: number[]

    constructor(type: number[] = null) {
        this.type = type === null ? [0, 0, 0, 0] : type
    }

    copy(): TurretType { return new TurretType(this.type.slice()) }

    add(elem: TurretElement) {
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

    contains(type: TurretElement) { return this.type[type] > 0 }

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
        for (let i = 0; i < this.type[TurretElement.Air]; ++i) {
            arr.push("#d8d1ff")
        }
        for (let i = 0; i < this.type[TurretElement.Earth]; ++i) {
            arr.push("#6dd13e")
        }
        for (let i = 0; i < this.type[TurretElement.Fire]; ++i) {
            arr.push("#f7854c")
        }
        for (let i = 0; i < this.type[TurretElement.Water]; ++i) {
            arr.push("#79b4f2")
        }
        return arr
    }

}
