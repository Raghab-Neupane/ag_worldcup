<template>
    <div class="reveal-container" :class="{ entered: hasEntered }" :style="cardSizeVars">
        <div class="flip-card" :class="{ flipped: isFlipped }">
            <div class="flip-inner">
                <div class="flip-face front">
                    <Card />
                </div>
                <div class="flip-face back">
                    <WinnerCard :winner-name="winnerName" :winner-phone="winnerPhone"
                        :winner-image="winnerImage" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Card from './card.vue'
import WinnerCard from './winnercard.vue'

interface Props {
    winnerName?: string
    winnerPhone?: string
    winnerImage?: string
    cardSizeVars?: Record<string, string>
}

defineProps<Props>()

const hasEntered = ref(false)
const isFlipped = ref(false)

onMounted(() => {
    requestAnimationFrame(() => {
        hasEntered.value = true
    })
    setTimeout(() => {
        isFlipped.value = true
    }, 1400)
})
</script>

<style scoped>
.reveal-container {
    position: fixed;
    left: 50%;
    bottom: -100vh;
    transform: translate(-50%, 0) scale(1.7);
    z-index: 20;
    filter: drop-shadow(0 0 25px rgba(245, 198, 43, 0.8)) drop-shadow(0 0 50px rgba(239, 150, 0, 0.5));
    transition:
        bottom 1200ms cubic-bezier(0.22, 1, 0.36, 1),
        left 1200ms cubic-bezier(0.22, 1, 0.36, 1),
        transform 1200ms cubic-bezier(0.22, 1, 0.36, 1),
        filter 1000ms ease;
}

.reveal-container.entered {
    bottom: calc(50vh - (var(--card-height) / 2));
    transform: translateX(-50%) scale(1.15);
}

.flip-card {
    width: var(--card-width);
    height: var(--card-height);

    perspective: 3000px;
    perspective-origin: center center;
}

.flip-inner {
    width: 100%;
    height: 100%;

    position: relative;

    transform-style: preserve-3d;
    transform-origin: center center;

    transition:
        transform 1.2s cubic-bezier(0.175,
            0.885,
            0.32,
            1.275);

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