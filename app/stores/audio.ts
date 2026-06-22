// stores/audio.ts
import { ref } from 'vue'

// ---------- Techno (global) ----------
const audio = ref<HTMLAudioElement | null>(null)
export const isPlaying = ref(false)
export const volume = ref(0.2)

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

export function playTechno() {
    initTechno()
    if (!audio.value || isPlaying.value) return
    audio.value.currentTime = 0
    audio.value.volume = volume.value
    const promise = audio.value.play()
    if (promise !== undefined) {
        promise
            .then(() => { isPlaying.value = true; console.log('▶️ Techno autoplay') })
            .catch(() => console.warn('⚠️ Techno blocked – use forcePlay'))
    }
}

export function forcePlayTechno() {
    initTechno()
    if (!audio.value) return
    if (isPlaying.value) return
    audio.value.volume = volume.value
    const promise = audio.value.play()
    if (promise !== undefined) {
        promise
            .then(() => { isPlaying.value = true; console.log('▶️ Techno forced by user') })
            .catch((err) => console.warn('⚠️ Force play failed:', err.message))
    }
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
        forcePlayTechno()
        forcePlayFire() // also try Fire
    }
}

// ---------- Fire (local to choose.vue) ----------
export const fireAudioRef = ref<HTMLAudioElement | null>(null)
export let fireStarted = false

export function forcePlayFire() {
    const el = fireAudioRef.value
    if (!el) return
    if (fireStarted) return
    el.volume = 1.0
    const promise = el.play()
    if (promise !== undefined) {
        promise
            .then(() => { fireStarted = true; console.log('🔥 Fire forced by user') })
            .catch((err) => console.warn('⚠️ Fire force failed:', err.message))
    }
}

export function stopFire() {
    if (fireAudioRef.value) {
        fireAudioRef.value.pause()
        fireAudioRef.value.currentTime = 0
        fireStarted = false
    }
}

// Optional: set volume for Fire (not used now)