<template>
    <section class="winner-page">
        <Background />

        <div class="card-stage">
            <div class="stage-container" :style="cardSizeVars" :class="{ 'fade-out': fadeReelCards }">
                <img src="/stage.png" class="stage-image" />
                <img src="/crops.png" class="crop-image" />
            </div>

            <div v-for="(cardId, index) in visibleCards" :key="cardId" class="card-wrapper" :class="{
                'fade-left': fadeReelCards && index < 3,
                'fade-right': fadeReelCards && index > 3,
                'hide-center': showWinnerReveal && index === 3
            }" :style="[getCardStyle(index), cardSizeVars]">
                <Card />
            </div>

            <WinnerReveal v-if="showWinnerReveal" ref="winnerRevealEl" :card-size-vars="cardSizeVars"
                :winner-name="winnerName" :winner-phone="winnerPhone" :winner-image="winnerImage"
                @flipped="onFlipped" />
        </div>

        <!-- Mounted as soon as the flip ends so we can measure its real
             dock-anchor box, but stays invisible (`:visible`) until the
             hold finishes. -->
        <CongratulationsPage v-if="showCongratulations" ref="congratsEl" :is-overlay="true" :visible="congratsRevealed"
            :winner="congratsWinnerPayload" />
    </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { CSSProperties } from 'vue'

import Background from '../components/background.vue'
import Card from '../components/card.vue'
import WinnerReveal from '../components/WinnerReveal.vue'
import CongratulationsPage from './congratulations.vue'

// Single shared aspect ratio for the reel cards AND the reveal/dock card —
// both now stay visually consistent throughout the whole sequence
// (spin → flip → dock), matching the look in congratulations.vue.
const ASPECT_RATIO = 258 / 180

const MIN_CARD_WIDTH = 130
const MAX_CARD_WIDTH = 640
const SPACING_FACTOR = 0.82

const START_DELAY = 1200
const SPIN_DURATION = 7000
const START_SPEED = 100
const MID_SPEED = 200
const END_SPEED = 500
const MIDPOINT = 0.7
const REVEAL_DELAY = 200

// How long to hold the flipped card before it glides onto the podium.
// The size-morph (see onFlipped) starts immediately and uses this same
// window to finish settling into shape.
const DOCK_DELAY = 1200

const cardWidth = ref(230)
const showWinnerReveal = ref(false)
const fadeReelCards = ref(false)
const showCongratulations = ref(false)
// Separate from showCongratulations: this mounts the stage EARLY
// (invisible) purely so we can measure it; this flips true only once
// the hold ends, fading in confetti/title/stage for real.
const congratsRevealed = ref(false)

const winnerRevealEl = ref<InstanceType<typeof WinnerReveal> | null>(null)
const congratsEl = ref<InstanceType<typeof CongratulationsPage> | null>(null)

let startTimeout: ReturnType<typeof setTimeout> | null = null
let scrollTimeout: ReturnType<typeof setTimeout> | null = null

const cardHeight = computed(() => cardWidth.value * ASPECT_RATIO)
const cardSizeVars = computed(() => ({
    '--card-width': `${cardWidth.value}px`,
    '--card-height': `${cardHeight.value}px`
}))

// ─── INFINITE SCROLL BUFFER (LEFT → RIGHT) ──
const BUFFER_SIZE = 50
const fullCards = ref<number[]>([])
const offset = ref(0)

const visibleCards = computed(() => {
    return fullCards.value.slice(offset.value, offset.value + 7)
})

function initBuffer() {
    const ids: number[] = []
    for (let i = 0; i < BUFFER_SIZE; i++) {
        ids.push(i)
    }
    fullCards.value = ids
    offset.value = BUFFER_SIZE - 7
}

function ensureBufferHasCardsBefore() {
    if (offset.value >= 0) return
    const firstId = fullCards.value[0] ?? 0
    const count = 10
    for (let i = count; i >= 1; i--) {
        fullCards.value.unshift(firstId - i)
    }
    offset.value += count
}
// ─────────────────────────────────────────────

const config = useRuntimeConfig()
const winnerData = ref<any>(null)

const winnerName = computed(() => winnerData.value?.name || 'No correct guess.')
const winnerPhone = computed(() => winnerData.value?.mobile_number || winnerData.value?.phone || '')
const winnerImage = computed(() => {
    const photo = winnerData.value?.photo || winnerData.value?.image
    if (photo && photo !== 'dummy' && photo !== 'photo' && photo !== 'null' && photo !== 'undefined') {
        if (photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('/')) {
            return photo
        }
        const base = config?.public?.assetsUrl || ''
        return base ? (base.endsWith('/') ? base + photo : base + '/' + photo) : photo
    }
    return ''
})

const congratsWinnerPayload = computed(() => {
    if (!winnerData.value) return null
    return {
        name: winnerName.value,
        photo: winnerData.value?.photo || winnerData.value?.image || '',
        mobile_number: winnerData.value?.mobile_number || winnerData.value?.phone || ''
    }
})

const getCardStyle = (relativeIndex: number): CSSProperties => {
    const spacing = cardWidth.value * SPACING_FACTOR
    const x = (relativeIndex - 3) * spacing
    const scales = [0.72, 0.90, 1.00, 1.15, 1.00, 0.90, 0.72]
    const zIndices = [1, 2, 3, 10, 3, 2, 1]

    return {
        position: 'absolute',
        left: '50%',
        bottom: '0',
        transform:
            `translate3d(${x}px,0,0) scale(${scales[relativeIndex]})`,
        marginLeft: `-${cardWidth.value / 2}px`,
        zIndex: zIndices[relativeIndex],
        willChange: 'transform'
    }
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

const getDelay = (progress: number) => {
    if (progress < MIDPOINT) {
        const local = progress / MIDPOINT
        return START_SPEED + (MID_SPEED - START_SPEED) * local
    }
    const local = (progress - MIDPOINT) / (1 - MIDPOINT)
    return MID_SPEED + (END_SPEED - MID_SPEED) * easeOutCubic(local)
}

const startScrollAnimation = () => {
    const startTime = performance.now()

    const animate = () => {
        const elapsed = performance.now() - startTime

        if (elapsed >= SPIN_DURATION) {
            fadeReelCards.value = true
            setTimeout(() => {
                showWinnerReveal.value = true
            }, REVEAL_DELAY)
            return
        }

        offset.value -= 1
        ensureBufferHasCardsBefore()

        const progress = elapsed / SPIN_DURATION
        const delay = getDelay(progress)

        scrollTimeout = setTimeout(animate, delay)
    }

    animate()
}

// ─── Flip finished → measure stage early, morph size, hold, then dock ──
const hasDocked = ref(false)

const onFlipped = async () => {
    await winnerRevealEl.value?.lockInPlace()

    // Mount the congrats stage now — but it stays invisible (`visible`
    // prop false) until the hold ends. This lets us measure its REAL
    // dock-anchor box right away and morph the card toward that EXACT
    // size during the hold. No analytic approximation, no guessing —
    // whatever size the anchor actually renders at is what we morph to.
    showCongratulations.value = true
    await nextTick()
    await congratsEl.value?.waitForStageReady?.()

    const earlyRect = congratsEl.value?.getCardDockRect?.()
    if (earlyRect) {
        winnerRevealEl.value?.morphToSize(earlyRect.width, earlyRect.height)
    }

    setTimeout(async () => {
        congratsRevealed.value = true // fades in confetti/title/stage
        await nextTick()
        applyDock()
        hasDocked.value = true
    }, DOCK_DELAY)
}

// Re-measures the anchor RIGHT NOW and moves+resizes the card to match
// exactly. Called once at dock time, then again on every resize/orientation
// change while docked.
const applyDock = () => {
    const dockRect = congratsEl.value?.getCardDockRect?.()
    if (!dockRect) return
    winnerRevealEl.value?.morphToSize(dockRect.width, dockRect.height)
    winnerRevealEl.value?.dockToStage({ top: dockRect.top, left: dockRect.left, scale: 1 })
}

let resyncRaf: number | null = null
const handleViewportChange = () => {
    updateCardWidth()
    if (!hasDocked.value) return
    if (resyncRaf) cancelAnimationFrame(resyncRaf)
    resyncRaf = requestAnimationFrame(() => {
        requestAnimationFrame(() => applyDock())
    })
}

const updateCardWidth = () => {
    const widthTarget = window.innerWidth / 6.3
    const heightTarget = window.innerHeight / 1.75
    const target = Math.min(widthTarget, heightTarget)
    cardWidth.value = Math.min(MAX_CARD_WIDTH, Math.max(MIN_CARD_WIDTH, target))
}

let dockResizeObserver: ResizeObserver | null = null

onMounted(async () => {
    updateCardWidth()
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('orientationchange', handleViewportChange)

    if (typeof ResizeObserver !== 'undefined') {
        dockResizeObserver = new ResizeObserver(() => handleViewportChange())
        dockResizeObserver.observe(document.documentElement)
    }

    initBuffer()

    startTimeout = setTimeout(() => startScrollAnimation(), START_DELAY)

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
    window.removeEventListener('resize', handleViewportChange)
    window.removeEventListener('orientationchange', handleViewportChange)
    dockResizeObserver?.disconnect()
    if (resyncRaf) cancelAnimationFrame(resyncRaf)
    if (startTimeout) clearTimeout(startTimeout)
    if (scrollTimeout) clearTimeout(scrollTimeout)
})
</script>

<style scoped>
.winner-page {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.card-stage {
    position: relative;
    width: 100%;
    height: clamp(280px, 58vh, 1100px);
    margin-top: clamp(32px, 8vh, 160px);
}

.card-wrapper {
    position: absolute;
    width: var(--card-width);
    height: var(--card-height);
    transform-origin: center center;
    transition:
        transform 150ms ease-out,
        opacity 300ms ease;
    will-change: transform;
}

.card-wrapper>* {
    width: 100% !important;
    height: 100% !important;
    display: block;
}

.fade-left {
    opacity: 0;
    transform: translateX(-1200px) scale(0.4) !important;
}

.fade-right {
    opacity: 0;
    transform: translateX(1200px) scale(0.4) !important;
}

.hide-center {
    opacity: 0;
    transition: none;
}

/* Mini stage/platform behind the spinning cards. Sizing now mirrors
   congratulations.vue's .stage-wrapper exactly (1.5x card width,
   1.45x card height) and the image rules below mirror its
   .stage-image / .crop-image, so the platform reads at the same scale
   during the spin as it does once the card is docked — no visual jump
   in the background stage itself when the page swaps over. */
.stage-container {
    position: absolute;
    left: 50%;
    bottom: -60px;
    width: calc(var(--card-width) * 1.5);
    height: calc(var(--card-height, 300px) * 1.45);
    max-width: 1100px;
    transform: translateX(-50%);
    z-index: 0;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    transition: opacity 990ms ease;
}

.stage-container.fade-out {
    opacity: 0;
    pointer-events: none;
}

.stage-image {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 900px;
    height: auto;
    display: block;
    filter: drop-shadow(0 6px 15px rgba(0, 0, 0, 0.45));
}

.crop-image {
    position: absolute;
    z-index: 2;
    left: 50%;
    bottom: 10%;
    width: 130%;
    max-width: 1100px;
    height: auto;
    transform: translateX(-50%);
    filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.15));
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
</style>