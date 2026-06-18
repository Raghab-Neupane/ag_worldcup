<template>
    <section class="winner-page">
        <Background />

        <div class="reel-stage entered">
            <!-- center marker showing which card is "selected" -->
            <div class="center-marker" :style="markerStyle"></div>

            <div class="reel-track" :style="trackStyle">
                <div v-for="n in CARD_COUNT" :key="n" class="reel-slot" :style="slotStyle">
                    <Card :style="cardSizeVars" />
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Background from '../components/background.vue'
import Card from '../components/card.vue'

// ─── CONFIGURABLE TIMING FOR LOTTERY-STYLE CARD REEL ──────────────────
const totalDuration = 6000      // total scroll duration in ms
const minDelay = 90             // fastest step delay (very fast at start)
const maxDelay = 650             // slowest step delay (dramatic slowdown at end)
const cardGap = 16               // visible gap between cards in the row, in px
const CARD_COUNT = 40            // how many cards make up the reel
// ─────────────────────────────────────────────────────────────────────

// Card size is responsive: a fraction of viewport width, clamped between
// a sensible min/max, with height derived from the same aspect ratio as
// the Figma export (337.94 : 485.79).
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
    // roughly one-fifth of the viewport per card, clamped to a usable range
    const target = window.innerWidth / 5.5
    cardWidth.value = Math.min(MAX_CARD_WIDTH, Math.max(MIN_CARD_WIDTH, target))
}

const winningSlotIndex = ref(Math.floor(CARD_COUNT * 0.7)) // which slot the reel lands on

const trackOffset = ref(0)
const trackStyle = computed(() => ({
    transform: `translateX(${trackOffset.value}px)`
}))
const slotStyle = computed(() => ({ marginRight: `${cardGap}px` }))
const markerStyle = computed(() => ({ width: `${cardWidth.value}px` }))

const centerSlot = (slotIndex: number) => {
    const viewportCenter = window.innerWidth / 2
    trackOffset.value = viewportCenter - (slotIndex * slotWidth.value) - (cardWidth.value / 2)
}

// Easing: fast scroll for most of the duration, then a dramatic slowdown at the end
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

const startScrollAnimation = () => {
    const startTimeRef = Date.now()
    currentSlot = 0
    centerSlot(0)

    const runCycle = () => {
        const elapsed = Date.now() - startTimeRef

        if (elapsed >= totalDuration || currentSlot >= winningSlotIndex.value) {
            if (timeoutId) clearTimeout(timeoutId)
            timeoutId = null

            // Snap exactly onto the selected slot
            currentSlot = winningSlotIndex.value
            centerSlot(currentSlot)
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

onMounted(() => {
    updateCardWidth()
    centerSlot(0)

    onResize = () => {
        updateCardWidth()
        centerSlot(currentSlot)
    }
    window.addEventListener('resize', onResize)

    // Start immediately on load, no click/interaction required
    startScrollAnimation()
})

onUnmounted(() => {
    if (timeoutId) clearTimeout(timeoutId)
    if (onResize) window.removeEventListener('resize', onResize)
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

/* ─── REEL STAGE ─────────────────────────────────────────────── */
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
</style>