<template>
    <section class="winner-page">
        <Background />

        <div class="winner-card" :class="{ 'entered': hasEntered }" @click="handleCardClick" style="cursor: pointer;">
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Background from '../components/background.vue'
import rawData from '../data.json'

interface Winner {
    name: string
    phone: string
    image?: string
}

const router = useRouter()
const namesList = ref<Winner[]>(rawData)

const totalDuration = 15000 // 15 seconds total
const startDelay = 40 // Very fast start
const endDelay = 2500 // Very slow end

const currentIndex = ref(0)
const finalWinner = ref<Winner | null>(null)
const isFinished = ref(false)
const hasEntered = ref(false)

const currentItem = computed(() => {
    if (isFinished.value && finalWinner.value) {
        return finalWinner.value
    }
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

onMounted(() => {
    // Fast entrance trigger
    requestAnimationFrame(() => {
        hasEntered.value = true
    })

    selectFinalWinner()

    const startTime = Date.now()

    const runCycle = () => {
        const elapsed = Date.now() - startTime

        if (elapsed >= totalDuration) {
            isFinished.value = true
            return
        }

        currentIndex.value = (currentIndex.value + 1) % namesList.value.length

        // Eased progress: starts fast, slows down dramatically
        const progress = elapsed / totalDuration
        // Use ease-out-expo style: fast at start, very slow at end
        const easedProgress = 1 - Math.pow(1 - progress, 4)
        const delay = startDelay + (endDelay - startDelay) * easedProgress

        setTimeout(runCycle, delay)
    }

    runCycle()
})

const handleCardClick = () => {
    const winner = finalWinner.value || currentItem.value
    router.push({
        path: '/congratulations',
        query: {
            name: winner.name,
            phone: winner.phone
        }
    })
}
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

/* ========== FAST ENTRANCE ANIMATION ========== */

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

    opacity: 0;
    transform: scale(0.3) translateY(60px);
    /* Fast entrance: 0.5s */
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.winner-card.entered {
    opacity: 1;
    transform: scale(1) translateY(0);
}

/* Quick settle */
.winner-card.entered {
    animation: cardSettle 0.4s ease-out 0.5s both;
}

@keyframes cardSettle {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.02);
    }

    100% {
        transform: scale(1);
    }
}

/* ========== REST OF STYLES ========== */

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
    transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease-out;
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