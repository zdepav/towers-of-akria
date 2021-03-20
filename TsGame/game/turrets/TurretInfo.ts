class TurretInfo {

    name: string
    description: string
    range: number
    dps: string
    effect: string | null
    upgradeNote: string | null

    constructor(name: string, description: string, range: number, dps: string, effect?: string) {
        this.name = name
        this.description = description
        this.range = range
        this.dps = dps
        this.effect = effect ?? null
        this.upgradeNote = null
    }

    withUpgradeNote(note: string): TurretInfo {
        this.upgradeNote = note
        return this
    }
}
