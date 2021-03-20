///<reference path="../utils/Expirable.ts"/>

enum SoundState {
    Paused = 0,
    Playing= 1,
    Muted = 2,
    MutedPlaying = Muted | Playing,
    Stopped = 4
}

class Sound extends Expirable {

    private readonly audio?: HTMLAudioElement
    private state: SoundState
    private system: SoundSystem

    get expired(): boolean {
        return this.audio == undefined
            || Flags.has(this.state, SoundState.Stopped)
            || this.audio.ended
    }

    constructor(system: SoundSystem, audio: HTMLAudioElement, loop: boolean, muted: boolean) {
        super()
        this.system = system
        this.audio = (loop || !muted) ? audio : undefined
        if (this.audio != undefined) {
            this.audio.loop = loop
            this.audio.muted = muted
            this.state = muted ? SoundState.Muted : SoundState.Paused
        } else {
            this.state = SoundState.Stopped
        }
    }

    resume(): void {
        if (this.expired) {
            return
        }
        if (this.state === SoundState.Paused || this.state === SoundState.Muted) {
            this.audio!.play()
            this.state = Flags.add(this.state, SoundState.Playing)
        }
    }

    pause(): void {
        if (this.expired) {
            return
        }
        if (Flags.has(this.state, SoundState.Playing)) {
            this.audio!.pause()
            this.state = Flags.remove(this.state, SoundState.Playing)
        }
    }

    stop(): void {
        if (this.expired) {
            return
        }
        if (Flags.has(this.state, SoundState.Playing)) {
            this.audio?.pause()
        }
        this.audio!.src = undefined!
        this.state = SoundState.Stopped
    }

    mute(): void {
        if (this.expired) {
            return
        }
        if (this.audio!.loop) {
            this.audio!.muted = true
            this.state = Flags.add(this.state, SoundState.Muted)
        } else {
            this.stop()
        }
    }

    unmute(): void {
        if (this.expired) {
            return
        }
        if (Flags.has(this.state, SoundState.Muted)) {
            this.audio!.muted = false
            this.state = Flags.remove(this.state, SoundState.Muted)
        }
    }

    step(time: number): void { }
}
