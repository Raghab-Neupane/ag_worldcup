<template>
    <section class="winner-page">
        <Background />

        <div class="card-stage">
            <div v-for="n in 7" :key="n" class="card-wrapper" :style="getCardStyle(n - 1)">
                <Card :style="cardSizeVars" />
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { CSSProperties } from 'vue'

import Background from '../components/background.vue'
import Card from '../components/card.vue'

const ASPECT_RATIO = 485.79 / 337.94
const MIN_CARD_WIDTH = 230
const MAX_CARD_WIDTH = 300

const cardWidth = ref(180)

const cardHeight = computed(() => {
    return cardWidth.value * ASPECT_RATIO
})

const cardSizeVars = computed(() => ({
    '--card-width': `${cardWidth.value}px`,
    '--card-height': `${cardHeight.value}px`
}))

const updateCardWidth = () => {
    const target = window.innerWidth / 5.5

    cardWidth.value = Math.min(
        MAX_CARD_WIDTH,
        Math.max(MIN_CARD_WIDTH, target)
    )
}

const getCardStyle = (index: number): CSSProperties => {
    const positions = [
        { x: -620, scale: 0.72, z: 1 },
        { x: -420, scale: 0.90, z: 2 },
        { x: -210, scale: 1.00, z: 3 },
        { x: 0, scale: 1.15, z: 10 },
        { x: 210, scale: 1.00, z: 3 },
        { x: 420, scale: 0.90, z: 2 },
        { x: 620, scale: 0.72, z: 1 }
    ]
    const p = positions[index]!

    return {
        position: 'absolute',
        left: '43%',
        bottom: '0',
        transform: `
        translateX(${p.x}px)
        scale(${p.scale})
    `,
        zIndex: p.z
    }
}

onMounted(() => {
    updateCardWidth()
    window.addEventListener('resize', updateCardWidth)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateCardWidth)
})
</script>

<style scoped>
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

    /* adjust this only */
}

.card-wrapper {
    position: absolute;
    transform-origin: center center;
}
</style>