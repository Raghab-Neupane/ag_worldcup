<template>
    <div ref="rootEl" class="reveal-container" :style="containerStyle">
        <div class="flip-card" :class="{ flipped: isFlipped }">
            <div class="flip-inner">
                <div class="flip-face front">
                    <Card />
                </div>
                <div class="flip-face back">
                    <WinnerCard :winner-name="winnerName" :winner-phone="winnerPhone" :winner-image="winnerImage" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import Card from './card.vue'
import WinnerCard from './winnercard.vue'

interface Props {
    winnerName?: string
    winnerPhone?: string
    winnerImage?: string
    cardSizeVars?: Record<string, string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
    flipped: []
}>()

const rootEl = ref<HTMLElement | null>(null)
const isFlipped = ref(false)

// null = use the default in-flow placement (sits wherever the parent
// positions it, e.g. centered in the reel). Once locked, this holds an
// explicit fixed box so we can animate it anywhere with no jump.
// IMPORTANT: width/height here are the card's NATIVE (unscaled) size —
// the visual 1.15x reel scale is applied separately via `transform`, the
// same way it always was. Baking the scale into width/height instead
// (i.e. using the post-scale getBoundingClientRect size) was the bug:
// .flip-card sizes itself off var(--card-width)/(--card-height), so a
// bigger forced box left it sitting in one corner instead of centered —
// that's what made the flip look like it pivoted from one edge.
const lock = ref<{
    top: string
    left: string
    width: string
    height: string
    scale: number
} | null>(null)

// Where to animate the locked box TO — set by dockToStage().
const dockTarget = ref<{ top: string; left: string; scale: number } | null>(null)

// Target SIZE to morph toward during the hold, set by morphToSize().
// Kept separate from `lock` so the position/scale math in `lock` stays
// untouched — this just overrides the rendered width/height (and the
// --card-width/--card-height vars .flip-card actually sizes itself off),
// letting CSS transition the shape smoothly instead of popping into it.
const morphSize = ref<{ width: string; height: string } | null>(null)

const containerStyle = computed(() => {
    const sizeVars = props.cardSizeVars || {}
    const overrideVars = morphSize.value
        ? { '--card-width': morphSize.value.width, '--card-height': morphSize.value.height }
        : {}

    if (!lock.value) return { ...sizeVars, ...overrideVars }

    const w = morphSize.value?.width || lock.value.width
    const h = morphSize.value?.height || lock.value.height

    if (dockTarget.value) {
        return {
            ...sizeVars,
            ...overrideVars,
            position: 'fixed' as const,
            top: dockTarget.value.top,
            left: dockTarget.value.left,
            width: w,
            height: h,
            transform: `translate(-50%, -50%) scale(${dockTarget.value.scale})`
        }
    }

    return {
        ...sizeVars,
        ...overrideVars,
        position: 'fixed' as const,
        top: lock.value.top,
        left: lock.value.left,
        width: w,
        height: h,
        transform: `translate(-50%, -50%) scale(${lock.value.scale})`
    }
})

onMounted(() => {
    // small pause so the card "settles" in place before flipping
    setTimeout(() => {
        isFlipped.value = true
        emit('flipped')
    }, 500)
})

// Snapshot the card's CURRENT on-screen center point and pin it there
// with position:fixed using its NATIVE size — visually identical to
// before (same center point, same 1.15x scale), just now able to move.
const lockInPlace = async () => {
    await nextTick()
    if (!rootEl.value) return
    const rect = rootEl.value.getBoundingClientRect() // post-scale box, used only for its CENTER point
    const nativeWidth = props.cardSizeVars?.['--card-width']
    const nativeHeight = props.cardSizeVars?.['--card-height']
    lock.value = {
        top: `${rect.top + rect.height / 2}px`,
        left: `${rect.left + rect.width / 2}px`,
        width: nativeWidth || `${rect.width}px`,
        height: nativeHeight || `${rect.height}px`,
        scale: 1.15 // matches the reel's center-card scale (getCardStyle index 3)
    }
}

// Smoothly resize the card toward `width`/`height` (px numbers). Meant to
// be called as soon as the hold begins, so the shape finishes morphing
// BEFORE the dock glide starts — no last-second pop into the right
// proportions.
const morphToSize = async (width: number, height: number) => {
    if (!lock.value) await lockInPlace()
    await nextTick()
    morphSize.value = { width: `${width}px`, height: `${height}px` }
}

// Animate the locked box down to the congrats stage slot.
const dockToStage = async (target: { top: string; left: string; scale?: number }) => {
    if (!lock.value) await lockInPlace()
    await nextTick()
    dockTarget.value = {
        top: target.top,
        left: target.left,
        scale: target.scale ?? 1
    }
}

defineExpose({ lockInPlace, dockToStage, morphToSize })
</script>

<style scoped>
.reveal-container {
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%) scale(1.15);
    z-index: 21;
    filter: drop-shadow(0 0 25px rgba(245, 198, 43, 0.8)) drop-shadow(0 0 50px rgba(239, 150, 0, 0.5));
    transition:
        top 1.1s cubic-bezier(0.22, 1, 0.36, 1),
        left 1.1s cubic-bezier(0.22, 1, 0.36, 1),
        width 1.1s cubic-bezier(0.22, 1, 0.36, 1),
        height 1.1s cubic-bezier(0.22, 1, 0.36, 1),
        transform 1.1s cubic-bezier(0.22, 1, 0.36, 1);
}

.flip-card {
    width: var(--card-width);
    height: var(--card-height);

    perspective: 1200px;
    perspective-origin: center center;

    /* Lets the card's actual rendered shape ease toward the morph target
       (driven by --card-width/--card-height above) instead of snapping
       to it the instant the var changes. */
    transition:
        width 1.1s cubic-bezier(0.22, 1, 0.36, 1),
        height 1.1s cubic-bezier(0.22, 1, 0.36, 1);
}

.flip-inner {
    width: 100%;
    height: 100%;

    position: relative;

    transform-style: preserve-3d;
    transform-origin: center center;

    transition:
        transform 1s cubic-bezier(0.4, 0, 0.2, 1);

    will-change: transform;
}

.flip-card.flipped .flip-inner {
    transform: rotateY(180deg);
}

.flip-face {
    position: absolute;
    inset: 0;

    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;

    transform-origin: center center;
}

.front {
    transform: rotateY(0deg);
}

.back {
    transform: rotateY(180deg);
}
</style>