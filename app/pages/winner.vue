<template>
    <section class="winner-page">
        <Background />

        <!-- Lottie Celebration Canvas (replaces both confetti + firework canvases) -->
        <canvas ref="lottieCanvas" class="lottie-canvas"></canvas>

        <div v-if="participantsError || matchError" class="error-message"
            style="position: relative; z-index: 10; color: white; text-align: center; margin-top: 20vh; font-size: 2rem;">
            Error fetching data: {{ participantsError?.message || matchError?.message }}
        </div>
        <div v-else class="winner-card" :class="{ 'entered': hasEntered }">
            <div class="winner-card-inner">
                <div class="winner-content">
                    <Transition name="slide">
                        <div :key="currentIndex" class="slide-item">
                            <h4 class="winner-name">{{ currentItem.name }}</h4>
                            <h4 class="winner-phone">{{ formatPhone(currentItem.phone) }}</h4>
                        </div>
                    </Transition>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
import { useFetch } from '#app'
import Background from '../components/background.vue'
import { goToCongratulations } from '../router/router'
import lottie, { type AnimationItem } from 'lottie-web'

interface Winner {
    name: string
    phone: string
    image?: string
}

// Get runtime config
const config = useRuntimeConfig()

// Fetch participants from backend
const { data: participants, error: participantsError } = await useFetch<Winner[]>(`${config.public.participants}/participants`)
const namesList = ref<Winner[]>(participants.value || [])
watch(participants, (val) => {
    if (val) namesList.value = val
})

// Fetch the currently selected match
const { data: selectedMatch, error: matchError } = await useFetch<any>(`${config.public.apiBase}/matches/selectedmatch`)

// ─── CONFIGURABLE TIMING ───────────────────────────────────────────
const totalDuration = 18000  // 38 seconds total
const startDelay = -30        // Very fast start
const endDelay = 800         // Very slow end
// ──────────────────────────────────────────────────────────────────

const currentIndex = ref(0)
const finalWinner = ref<Winner | null>(null)
const isFinished = ref(false)
const hasEntered = ref(false)
let animationComplete = false

// Lottie canvas ref & animation instance
const lottieCanvas = ref<HTMLCanvasElement | null>(null)
let lottieAnim: AnimationItem | null = null

// Track repeated celebration intervals (for lottie replays)
let celebrationReplayInterval: ReturnType<typeof setInterval> | null = null
let celebrationStopTimeout: ReturnType<typeof setTimeout> | null = null

const currentItem = computed(() => {
    if (isFinished.value && finalWinner.value) return finalWinner.value
    return namesList.value[currentIndex.value] || { name: '', phone: '' }
})

const formatPhone = (phone: string) => {
    if (!phone) return ''
    const p = phone.trim()
    if (p.length <= 4) return p
    return p.slice(0, 2) + '*'.repeat(p.length - 4) + p.slice(-2)
}

const selectFinalWinner = () => {
    const randomIndex = Math.floor(Math.random() * namesList.value.length)
    finalWinner.value = namesList.value[randomIndex] || null
}

// Easing: fast at start, dramatically slows at end
const easeOutExpo = (x: number): number => {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
}

// ─── LOTTIE CELEBRATION ────────────────────────────────────────────
// Plays the combined firework+confetti Lottie JSON.
// Called once when the winner is revealed, then replayed every ~1.5s
// for 4 seconds total (matching the original canvas behaviour).
const startCelebration = () => {
    if (!lottieCanvas.value) return

    // Destroy any previous instance before creating a new one
    if (lottieAnim) {
        lottieAnim.destroy()
        lottieAnim = null
    }

    // lottie-web supports a <canvas> renderer which keeps the canvas
    // element approach familiar and avoids injecting extra DOM nodes.
    lottieAnim = lottie.loadAnimation({
        // "canvas" renderer draws directly onto our <canvas> element
        // via an internal 2D context — no extra wrapper div needed.
        container: lottieCanvas.value as unknown as Element,
        renderer: 'canvas',
        loop: false,        // We control looping manually with replay
        autoplay: true,
        // Path relative to the Nuxt /public directory
        path: '/firework_burst_confetti.json',
        rendererSettings: {
            // Make the Lottie canvas fill the viewport via CSS;
            // tell the renderer to use the element's own dimensions.
            preserveAspectRatio: 'xMidYMid slice',
            clearCanvas: true,
        }
    })

    // Replay every 1 500 ms so the burst keeps firing (same cadence as
    // the original setInterval(startConfetti, 800) + setInterval(startFirework, 1200))
    celebrationReplayInterval = setInterval(() => {
        if (lottieAnim) {
            lottieAnim.goToAndPlay(0, true) // restart from frame 0
        }
    }, 1500)

    // Stop replaying after 4 seconds (same as original setTimeout 4000 ms)
    celebrationStopTimeout = setTimeout(() => {
        if (celebrationReplayInterval) {
            clearInterval(celebrationReplayInterval)
            celebrationReplayInterval = null
        }
        // Let the last play-through finish naturally; Lottie's loop: false
        // means it will stop on the last frame then we can clear the canvas.
        if (lottieAnim) {
            lottieAnim.addEventListener('complete', () => {
                if (lottieAnim) {
                    lottieAnim.destroy()
                    lottieAnim = null
                }
            })
        }
    }, 4000)
}

// ─── NAVIGATION ────────────────────────────────────────────────────
const navigateToCongratulations = async () => {
    const winner = finalWinner.value || currentItem.value

    if (selectedMatch.value?.match_no) {
        try {
            await $fetch(`${config.public.apiBase}/matches/selectedmatch/${selectedMatch.value.match_no}`, {
                method: 'PATCH',
                body: { winner: winner.name, phone: winner.phone }
            })
        } catch (e) {
            console.error('Failed to post winner:', e)
        }
    }

    goToCongratulations()
}

// ─── LIFECYCLE ─────────────────────────────────────────────────────
onMounted(() => {
    requestAnimationFrame(() => { hasEntered.value = true })
    selectFinalWinner()

    // Size the canvas to the viewport on mount so Lottie fills the screen
    if (lottieCanvas.value) {
        lottieCanvas.value.width = window.innerWidth
        lottieCanvas.value.height = window.innerHeight
    }

    // Resize canvas if the window is resized
    const onResize = () => {
        if (lottieCanvas.value) {
            lottieCanvas.value.width = window.innerWidth
            lottieCanvas.value.height = window.innerHeight
            // Resize event also calls resize() on the animation so it redraws
            if (lottieAnim) lottieAnim.resize()
        }
    }
    window.addEventListener('resize', onResize)

    const startTime = Date.now()
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const runCycle = () => {
        const elapsed = Date.now() - startTime

        if (elapsed >= totalDuration) {
            isFinished.value = true
            animationComplete = true

            // 🎯 AUTO NAVIGATE when winner stops — no click needed!
            startCelebration()
            setTimeout(() => {
                navigateToCongratulations()
            }, 1500)

            return
        }

        currentIndex.value = (currentIndex.value + 1) % namesList.value.length

        const progress = Math.min(1, elapsed / totalDuration)
        const easedProgress = easeOutExpo(progress)
        const delay = startDelay + (endDelay - startDelay) * easedProgress

        timeoutId = setTimeout(runCycle, delay)
    }

    runCycle()

        // Cleanup resize listener on unmount (stored so onUnmounted can remove it)
        ; (window as any).__winnerPageResizeHandler = onResize
})

onUnmounted(() => {
    // Clear celebration replay timers
    if (celebrationReplayInterval) clearInterval(celebrationReplayInterval)
    if (celebrationStopTimeout) clearTimeout(celebrationStopTimeout)

    // Destroy Lottie instance to free memory & cancel any pending RAF
    if (lottieAnim) {
        lottieAnim.destroy()
        lottieAnim = null
    }

    // Remove resize listener
    const handler = (window as any).__winnerPageResizeHandler
    if (handler) {
        window.removeEventListener('resize', handler)
        delete (window as any).__winnerPageResizeHandler
    }
})
</script>

<style scoped>
.winner-page {
    position: relative;
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

/* Single Lottie canvas that replaces both .confetti-canvas and .firework-canvas */
.lottie-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
}

.winner-card {
    position: relative;
    z-index: 5;
    width: 550px;
    height: 176px;
    padding: 6px;
    border-radius: 42px;
    background: linear-gradient(180deg,
            #d0d0d0 0%,
            #f0f0f0 50%,
            #b0b0b0 100%);
    box-shadow:
        0 0 0 2px #a0a0a0,
        0 10px 30px rgba(0, 0, 0, 0.35),
        inset 0 1px 0 rgba(255, 255, 255, 0.6);
    transform: scale(0.3) translateY(60px);
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.winner-card.entered {
    transform: scale(1) translateY(0);
}

.winner-card-inner {
    width: 100%;
    height: 100%;
    padding: 4px;
    border-radius: 36px;
    background: linear-gradient(180deg, #E58200 0%, #F5A800 35%, #FFC200 70%, #FFE36C 100%);
    box-sizing: border-box;
}

.winner-content {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 32px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    background: linear-gradient(180deg, #FFE36C 0%, #FFC200 30%, #F5A800 70%, #E58200 100%);
}

.winner-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 32px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 40%, rgba(255, 255, 255, 0) 100%);
    pointer-events: none;
    z-index: 2;
}

.slide-item {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.winner-name {
    margin: 0;
    color: rgba(62, 2, 47, 1);
    font-family: 'Work Sans', sans-serif;
    font-size: 40px;
    font-weight: 700;
    font-style: normal;
    line-height: 100%;
    letter-spacing: 0%;
    text-align: center;
    z-index: 1;
}

.winner-phone {
    margin: 8px 0 0;
    color: #3E022F;
    font-family: 'Work Sans', sans-serif;
    font-size: 32px;
    font-weight: 600;
    font-style: normal;
    line-height: 100%;
    letter-spacing: 0%;
    text-align: center;
    z-index: 1;
}

/* SLIDE TRANSITION */
.slide-enter-active,
.slide-leave-active {
    transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease-out;
}

.slide-enter-from {
    transform: translateY(100%);
    opacity: 0;
}

.slide-leave-to {
    transform: translateY(-100%);
    opacity: 0;
}

/* RESPONSIVE */
@media (max-width: 768px) {
    .winner-card {
        width: 90vw;
        height: 30vw;
        min-height: 140px;
    }

    .winner-name {
        font-size: clamp(24px, 5vw, 42px);
    }

    .winner-phone {
        font-size: clamp(20px, 4vw, 34px);
    }
}
</style>