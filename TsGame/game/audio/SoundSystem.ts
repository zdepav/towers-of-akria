///<reference path="../utils/ExpirableSet.ts"/>

class SoundSystem extends ExpirableSet<Sound> {

    private readonly sounds: Record<string, HTMLAudioElement>

    private _muted: boolean

    get muted(): boolean { return this._muted }

    set muted(value: boolean) {
        if (!this._muted && value) {
            this.muteAll()
        } else if (this._muted && !value && this._music != null) {
            this.unmuteAll()
        }
        this._muted = value
    }

    private _music: string | null
    private _musicSound: Sound | null

    get music(): string | null { return this._music }

    set music(value: string | null) {
        if (value == this._music) {
            return
        }
        if (!this._muted) {
            this._musicSound?.stop()
            if (value != null) {
                this._musicSound = this.loop(value)
            }
        }
        this._music = value
    }

    constructor() {
        super()
        this.sounds = {}
        this._muted = false
        this._music = null
        this._musicSound = null
    }

    private load(name: string, file: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let audio = new Audio()
            audio.preload = 'auto'
            audio.autoplay = false
            audio.controls = false
            audio.style.display = "none"
            this.sounds[name] = audio
            audio.oncanplay = () => resolve()
            audio.onerror = () => reject()
            audio.src = 'audio/' + file
        })
    }

    createPaused(soundName: string, looping: boolean): Sound {
        let sound = new Sound(
            this,
            <HTMLAudioElement>this.sounds[soundName].cloneNode(true),
            looping,
            this._muted
        )
        if (looping || !this._muted) {
            this.add(sound)
        }
        return sound
    }

    play(soundName: string): Sound {
        let sound = new Sound(
            this,
            <HTMLAudioElement>this.sounds[soundName].cloneNode(true),
            false,
            this._muted
        )
        if (!this._muted) {
            sound.resume()
            this.add(sound)
        }
        return sound
    }

    loop(soundName: string): Sound {
        let sound = new Sound(
            this,
            <HTMLAudioElement>this.sounds[soundName].cloneNode(true),
            true,
            this._muted
        )
        sound.resume()
        this.add(sound)
        return sound
    }

    muteAll(): void {
        this.clearWhere(snd => {
            snd.mute()
            return snd.expired
        })
    }

    unmuteAll(): void {
        for (const item of this.items) {
            item.unmute()
        }
    }

    stopAll(): void {
        for (const item of this.items) {
            if (!item.expired) {
                item.stop()
            }
        }
        this._musicSound = null
        this.clear()
    }

    init(): Promise<void[]> {
        return Promise.all([
            this.load('arrow', 'arrow.wav'),
            this.load('water', 'water.wav'),
            this.load('electric-spark', 'electric-spark.wav'),
            this.load('cannon', 'cannon.wav'),
            this.load('fire', 'fire.wav'),
            this.load('flamethrower', 'flamethrower.wav')
        ])
    }
}
