// stores/audio.ts
import { ref } from 'vue'

// ---------- Techno (global) ----------
const audio = ref<HTMLAudioElement | null>(null)
export const isPlaying = ref(false)
export const volume = ref(0.8)
export const isIntroPlaying = ref(false)   // shared flag

let pendingStart = false                   // deferred start when intro ends

function initTechno() {
    if (!audio.value) {
        const el = new Audio('/Techno.mp3')
        el.loop = true
        el.preload = 'auto'
        el.volume = volume.value
        audio.value = el
        console.log('🎵 Techno audio created')
    }
}

// ---------- Control intro flag ----------
export function setIntroPlaying(val: boolean) {
    isIntroPlaying.value = val
    // If intro just ended and we had a pending start, play now
    if (!val && pendingStart) {
        pendingStart = false
        console.log('🎵 Intro ended – starting deferred audio')
        forcePlayTechno()
        forcePlayFire()
    }
}

// ---------- Techno playback ----------
function startTechno(force = false) {
    initTechno()
    if (!audio.value) return
    if (isPlaying.value) return

    if (isIntroPlaying.value) {
        pendingStart = true
        console.log('⏸️ Intro active – audio deferred')
        return
    }

    audio.value.currentTime = 0
    audio.value.volume = volume.value
    const promise = audio.value.play()
    if (promise !== undefined) {
        promise
            .then(() => {
                isPlaying.value = true
                console.log(`▶️ Techno ${force ? 'forced' : 'autoplay'}`)
            })
            .catch((err) => {
                console.warn(`⚠️ Techno ${force ? 'force' : 'autoplay'} failed:`, err.message)
            })
    }
}

export function playTechno() {
    startTechno(false)
}

export function forcePlayTechno() {
    startTechno(true)
}

export function pauseTechno() {
    if (audio.value && isPlaying.value) {
        audio.value.pause()
        isPlaying.value = false
        console.log('⏸️ Techno paused')
    }
}

export function toggleTechno() {
    if (isPlaying.value) {
        pauseTechno()
    } else {
        // Turning on – try to start both Techno and Fire
        // This will respect the intro flag via the internal checks
        forcePlayTechno()
        forcePlayFire()
    }
}

// ---------- Fire (local to choose.vue) ----------
export const fireAudioRef = ref<HTMLAudioElement | null>(null)
export let fireStarted = false

function startFire(force = false) {
    const el = fireAudioRef.value
    if (!el) return
    if (fireStarted) return

    if (isIntroPlaying.value) {
        pendingStart = true
        console.log('⏸️ Intro active – Fire deferred')
        return
    }

    el.volume = 1.0
    const promise = el.play()
    if (promise !== undefined) {
        promise
            .then(() => {
                fireStarted = true
                console.log(`🔥 Fire ${force ? 'forced' : 'autoplay'}`)
            })
            .catch((err) => {
                console.warn(`⚠️ Fire ${force ? 'force' : 'autoplay'} failed:`, err.message)
            })
    }
}

export function forcePlayFire() {
    startFire(true)
}

export function stopFire() {
    if (fireAudioRef.value) {
        fireAudioRef.value.pause()
        fireAudioRef.value.currentTime = 0
        fireStarted = false
    }
}

// Optional: set volume for Fire (not used now)
// export function setFireVolume(val: number) { ... }