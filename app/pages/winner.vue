<template>
    <section class="winner-page">
        <Background />

        <div class="reel-stage entered">
            <div class="center-marker" :style="markerStyle"></div>

            <div class="reel-track" :style="trackStyle">
                <div v-for="n in CARD_COUNT" :key="n" class="reel-slot" :style="slotStyle">
                    <Card :style="cardSizeVars" />
                </div>
            </div>
        </div>

        <!-- winner showcase, revealed once the reel settles -->
        <Transition name="fade">
            <div v-if="showWinnerCard && winner" class="winner-showcase">
                <p class="winner-label">Winner</p>
                <h2 class="winner-name">{{ winner.name }}</h2>
            </div>
        </Transition>
    </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Background from '../components/background.vue'
import Card from '../components/card.vue'

// ─── CONFIGURABLE TIMING FOR LOTTERY-STYLE CARD REEL ──────────────────
const totalDuration = 6000
const minDelay = 90
const maxDelay = 650
const cardGap = 16
const CARD_COUNT = 7
// ─────────────────────────────────────────────────────────────────────

// ─── WINNER FETCH ───────────────────────────────────────────────────
const BASE_URL = '' // TODO: set your API base URL here
const winner = ref<{ name: string;[key: string]: any } | null>(null)
const showWinnerCard = ref(false)

const fetchWinner = async () => {
    try {
        const res = await fetch(`${BASE_URL}/winner`)
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        winner.value = await res.json()
    } catch (err) {
        console.error('Failed to fetch winner:', err)
    }
}
// ─────────────────────────────────────────────────────────────────────

const ASPECT_RATIO = 485.79 / 337.94
const MIN_CARD_WIDTH = 130
const MAX_CARD_WIDTH = 260

const cardWidth = ref(180)
const cardHeight = computed(() => cardWidth.value * ASPECT_RATIO)
const slotWidth = computed(() => cardWidth.value + cardGap)

const cardSizeVars = computed(() => ({
    '--card-width': `${cardWidth.value}px`,
    '--card-height': `${cardHeight.value}px`
}))

const updateCardWidth = () => {
    const target = window.innerWidth / 5.5
    cardWidth.value = Math.min(MAX_CARD_WIDTH, Math.max(MIN_CARD_WIDTH, target))
}

const winningSlotIndex = ref(Math.floor(CARD_COUNT * 0.7))

const trackOffset = ref(0)
const trackStyle = computed(() => ({
    transform: `translateX(${trackOffset.value}px)`,
    transition: isAnimating.value ? 'none' : 'transform 0.3s ease-out'
}))
const slotStyle = computed(() => ({ marginRight: `${cardGap}px` }))
const markerStyle = computed(() => ({ width: `${cardWidth.value}px` }))

const isAnimating = ref(false)

const centerSlot = (slotIndex: number) => {
    const viewportCenter = window.innerWidth / 2
    trackOffset.value = viewportCenter - (slotIndex * slotWidth.value) - (cardWidth.value / 2)
}

const easeOutBack = (x: number): number => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

const easeLottery = (x: number): number => {
    if (x < 0.7) {
        return x * 0.3
    } else {
        const slowProgress = (x - 0.7) / 0.3
        return 0.3 + easeOutBack(slowProgress) * 0.7
    }
}

const calculateDelay = (progress: number): number => {
    const easedProgress = easeLottery(progress)
    return minDelay + (maxDelay - minDelay) * easedProgress
}

let timeoutId: ReturnType<typeof setTimeout> | null = null
let currentSlot = 0
let animationFrameId: number | null = null

const startScrollAnimation = () => {
    isAnimating.value = true
    const startTimeRef = Date.now()
    currentSlot = 0
    centerSlot(0)

    const runCycle = () => {
        const elapsed = Date.now() - startTimeRef

        if (elapsed >= totalDuration || currentSlot >= winningSlotIndex.value) {
            if (timeoutId) clearTimeout(timeoutId)
            timeoutId = null
            isAnimating.value = false

            currentSlot = winningSlotIndex.value
            centerSlot(currentSlot)

            // reveal winner info after the snap settles
            setTimeout(() => {
                showWinnerCard.value = true
            }, 400)
            return
        }

        const progress = Math.min(1, elapsed / totalDuration)
        const delay = calculateDelay(progress)

        currentSlot++
        centerSlot(currentSlot)

        timeoutId = setTimeout(runCycle, delay)
    }

    runCycle()
}

let onResize: (() => void) | null = null

onMounted(async () => {
    updateCardWidth()
    centerSlot(0)

    onResize = () => {
        updateCardWidth()
        centerSlot(currentSlot)
    }
    window.addEventListener('resize', onResize)

    await fetchWinner()
    startScrollAnimation()
})

onUnmounted(() => {
    if (timeoutId) clearTimeout(timeoutId)
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
    if (onResize) window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.winner-page {
    position: relative;
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.reel-stage {
    position: relative;
    z-index: 5;
    width: 100%;
    height: 70vh;
    max-height: 420px;
    display: flex;
    align-items: center;
    overflow: visible;
}

.center-marker {
    position: absolute;
    top: -12px;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 18px;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.55);
    pointer-events: none;
    z-index: 6;
}

.reel-track {
    position: relative;
    display: flex;
    align-items: center;
    will-change: transform;
}

.reel-slot {
    flex: 0 0 auto;
}

/* ─── WINNER SHOWCASE ─────────────────────────────────────────── */
.winner-showcase {
    position: relative;
    z-index: 5;
    margin-top: 24px;
    text-align: center;
}

.winner-label {
    font-size: 14px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 4px;
}

.winner-name {
    font-size: 28px;
    font-weight: 700;
    color: #ffd84d;
    margin: 0;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-enter-from {
    opacity: 0;
    transform: translateY(8px);
}

.fade-leave-to {
    opacity: 0;
}
</style>