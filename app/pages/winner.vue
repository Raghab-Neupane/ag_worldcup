<template>
    <section class="winner-page">
        <Background />

        <div class="card-stage">
            <div class="stage-container" :style="cardSizeVars" :class="{ 'fade-out': fadeReelCards }">
                <img src="/Stage.png" class="stage-image" />
                <img src="/Crops.png" class="crop-image" />
            </div>

            <!--
        INFINITE SCROLL FIX:
        - Iterate over `visibleCards` (7 cards from the large buffer)
        - Each card has a unique `id` as key → Vue creates fresh elements
        - `index` is the relative position (0..6) used for styling
      -->
            <div v-for="(cardId, index) in visibleCards" :key="cardId" class="card-wrapper" :class="{
                'fade-left': fadeReelCards && index < 3,
                'fade-right': fadeReelCards && index > 3,
                'fade-center': fadeReelCards && index === 3
            }" :style="[getCardStyle(index), cardSizeVars]">
                <Card />
            </div>

            <WinnerReveal v-if="showWinnerReveal" :card-size-vars="cardSizeVars" :fade-duration="FADE_DURATION"
                :winner-name="winnerName" :winner-phone="winnerPhone" :winner-image="winnerImage"
                :class="{ 'on-congrats-stage': cardOnStage }" />
        </div>

        <!-- Congratulations overlay -->
        <CongratulationsPage v-if="showCongratulations" :is-overlay="true" />
    </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { CSSProperties } from 'vue'

import Background from '../components/background.vue'
import Card from '../components/card.vue'
import WinnerReveal from '../components/WinnerReveal.vue'
import CongratulationsPage from './congratulations.vue'

const ASPECT_RATIO = 485.79 / 337.94
const MIN_CARD_WIDTH = 230
const MAX_CARD_WIDTH = 300
const SPACING_FACTOR = 0.75

// ─────────────────────────────────────────────
// SCROLL CONFIG (unchanged)
// ─────────────────────────────────────────────
const START_DELAY = 1200
const SPIN_DURATION = 7000
const START_SPEED = 100
const MID_SPEED = 200
const END_SPEED = 500
const MIDPOINT = 0.7

const REVEAL_DELAY = 200
const FADE_DELAY = 200
const FADE_DURATION = 990
const REDIRECT_DELAY = 2500
// ─────────────────────────────────────────────

const cardWidth = ref(230)
const showWinnerReveal = ref(false)
const fadeReelCards = ref(false)
const showCongratulations = ref(false)
const cardOnStage = ref(false)

let startTimeout: ReturnType<typeof setTimeout> | null = null
let scrollTimeout: ReturnType<typeof setTimeout> | null = null

const cardHeight = computed(() => cardWidth.value * ASPECT_RATIO)
const cardSizeVars = computed(() => ({
    '--card-width': `${cardWidth.value}px`,
    '--card-height': `${cardHeight.value}px`
}))

// ─── INFINITE SCROLL BUFFER ──────────────────
// Buffer holds all cards; we slide a window of 7 over it.
const BUFFER_SIZE = 50                      // plenty for the whole spin
const fullCards = ref<number[]>([])         // unique IDs
const offset = ref(0)                       // current window start

// Visible cards = 7 cards starting at offset
const visibleCards = computed(() => {
    return fullCards.value.slice(offset.value, offset.value + 7)
})

// Fill buffer on mount
function initBuffer() {
    const ids: number[] = []
    for (let i = 0; i < BUFFER_SIZE; i++) {
        ids.push(i)
    }
    fullCards.value = ids
    offset.value = 0
}

// Add new cards when we near the end of the buffer
function ensureBufferHasCards() {
    const needed = offset.value + 7
    if (needed >= fullCards.value.length) {
        const lastId = fullCards.value[fullCards.value.length - 1] ?? 0
        for (let i = 1; i <= 10; i++) {
            fullCards.value.push(lastId + i)
        }
    }
}
// ─────────────────────────────────────────────

// ─── Winner data (unchanged) ────────────────
const config = useRuntimeConfig()
const winnerData = ref<any>(null)

const winnerName = computed(() => winnerData.value?.name || 'No correct guess.')
const winnerPhone = computed(() => {
    const rawPhone = winnerData.value?.mobile_number || ''
    if (!rawPhone) return ''
    const p = rawPhone.trim()
    if (p.length <= 4) return p
    return p.slice(0, 2) + '*'.repeat(p.length - 4) + p.slice(-2)
})

const winnerImage = computed(() => {
    const photo = winnerData.value?.photo
    if (photo && photo !== 'dummy' && photo !== 'photo' && photo !== 'null' && photo !== 'undefined') {
        if (photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('/')) {
            return photo
        }
        const base = config?.public?.assetsUrl || ''
        return base ? (base.endsWith('/') ? base + photo : base + '/' + photo) : photo
    }
    return '/profile.webp'
})

// ─── Card styling (now uses relative index 0..6) ─────────────
const getCardStyle = (relativeIndex: number): CSSProperties => {
    const spacing = cardWidth.value * SPACING_FACTOR
    const x = (relativeIndex - 3) * spacing          // center = index 3
    const scales = [0.72, 0.90, 1.00, 1.15, 1.00, 0.90, 0.72]
    const zIndices = [1, 2, 3, 10, 3, 2, 1]

    return {
        position: 'absolute',
        left: '50%',
        bottom: '0',
        transform: `translateX(calc(-50% + ${x}px)) scale(${scales[relativeIndex]})`,
        zIndex: zIndices[relativeIndex]
    }
}

// ─── Easing and speed (unchanged) ──────────
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

const getDelay = (progress: number) => {
    if (progress < MIDPOINT) {
        const local = progress / MIDPOINT
        return START_SPEED + (MID_SPEED - START_SPEED) * local
    }
    const local = (progress - MIDPOINT) / (1 - MIDPOINT)
    return MID_SPEED + (END_SPEED - MID_SPEED) * easeOutCubic(local)
}

// ─── Animation loop ────────────────────────
const startScrollAnimation = () => {
    const startTime = performance.now()

    const animate = () => {
        const elapsed = performance.now() - startTime

        if (elapsed >= SPIN_DURATION) {
            // Reel stopped – trigger reveal & fade
            setTimeout(() => {
                showWinnerReveal.value = true
                fadeReelCards.value = true
            }, REVEAL_DELAY)
            setTimeout(() => { showCongratulations.value = true }, REVEAL_DELAY + REDIRECT_DELAY)
            setTimeout(() => { cardOnStage.value = true }, REVEAL_DELAY + REDIRECT_DELAY + 700)
            return
        }

        // ─── INFINITE SCROLL STEP ────────────────────────
        // Slide the window forward by 1 card
        offset.value += 1
        ensureBufferHasCards()   // add more if needed
        // ────────────────────────────────────────────────

        const progress = elapsed / SPIN_DURATION
        const delay = getDelay(progress)

        scrollTimeout = setTimeout(animate, delay)
    }

    animate()
}

// ─── Responsive card width (unchanged) ──────
const updateCardWidth = () => {
    const target = window.innerWidth / 5.5
    cardWidth.value = Math.min(MAX_CARD_WIDTH, Math.max(MIN_CARD_WIDTH, target))
}

// ─── Lifecycle ──────────────────────────────
onMounted(async () => {
    updateCardWidth()
    window.addEventListener('resize', updateCardWidth)

    // Initialise the infinite card buffer
    initBuffer()

    startTimeout = setTimeout(() => startScrollAnimation(), START_DELAY)

    // Fetch winner data (unchanged)
    const postId = sessionStorage.getItem('selectedPostId')
    if (postId) {
        try {
            const res = await $fetch<any>(`${config.public.winnersEndpoint}?post_id=${postId}`)
            if (res) {
                if (typeof res === 'object' && 'winner' in res && res.winner === null) {
                    winnerData.value = null
                } else {
                    winnerData.value = typeof res === 'object' ? (res.winner || res) : null
                }
            }
        } catch (e) {
            console.error('Failed to fetch winner on winner page:', e)
        }
    }
})

onUnmounted(() => {
    window.removeEventListener('resize', updateCardWidth)
    if (startTimeout) clearTimeout(startTimeout)
    if (scrollTimeout) clearTimeout(scrollTimeout)
})
</script>

<style scoped>
/* ─── ALL STYLES REMAIN EXACTLY AS BEFORE ─── */
.winner-page {
    position: relative;
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.card-stage {
    position: relative;
    width: 100%;
    height: 500px;
    margin-top: 80px;
}

.card-wrapper {
    position: absolute;
    width: var(--card-width);
    height: var(--card-height);
    transform-origin: center center;
    transition:
        transform v-bind('FADE_DURATION + "ms"') cubic-bezier(0.22, 1, 0.36, 1),
        left v-bind('FADE_DURATION + "ms"') cubic-bezier(0.22, 1, 0.36, 1),
        opacity v-bind('FADE_DURATION + "ms"') ease;
}

.fade-left {
    opacity: 0;
    transform: translateX(-1200px) scale(0.4) !important;
}

.fade-right {
    opacity: 0;
    transform: translateX(1200px) scale(0.4) !important;
}

.fade-center {
    opacity: 0;
}

.stage-container {
    position: absolute;
    left: 50%;
    bottom: -60px;
    width: var(--card-width);
    transform: translateX(-50%) scale(1.15);
    z-index: 0;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    transition: opacity v-bind('FADE_DURATION + "ms"') ease;
}

.stage-container.fade-out {
    opacity: 0;
    pointer-events: none;
}

.stage-image {
    position: relative;
    z-index: 1;
    width: 200%;
    max-width: 380px;
    flex-shrink: 0;
    height: auto;
    display: block;
    filter: drop-shadow(0 6px 15px rgba(0, 0, 0, 0.45));
}

.crop-image {
    position: absolute;
    z-index: 0;
    left: 50%;
    bottom: 30%;
    width: 240%;
    max-width: 440px;
    flex-shrink: 0;
    height: auto;
    transform: translateX(-50%);
    filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.35));
}

@media (max-width: 768px) {
    .card-stage {
        height: 400px;
        margin-top: 60px;
    }

    .stage-image {
        max-width: 280px;
    }

    .crop-image {
        max-width: 320px;
    }
}

/* WinnerReveal overlay positioning (unchanged) */
:deep(.reveal-container.on-congrats-stage) {
    position: fixed !important;
    left: 50% !important;
    bottom: calc(clamp(100px, 12vh, 160px) + 20px) !important;
    transform: translateX(-50%) scale(0.9) !important;
    z-index: 22 !important;
}
</style>