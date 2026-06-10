<template>
    <section class="winner-page">
        <Background />

        <div class="winner-card" @click="handleCardClick" style="cursor: pointer;">
            <div class="winner-card-inner">
                <div class="winner-content">
                    <Transition name="slide">
                        <div :key="currentIndex" class="slide-item">
                            <h4 class="winner-name">{{ currentItem.name }}</h4>
                            <h4 class="winner-phone">{{ currentItem.phone }}</h4>
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
    name: string;
    phone: string;
    image?: string;
}

const router = useRouter()
const namesList = ref<Winner[]>(rawData)

const totalDuration = 5000 // 15 seconds
const startDelay = 50 // ms
const endDelay = 1200 // ms

const currentIndex = ref(0)
const finalWinner = ref<Winner | null>(null)
const isFinished = ref(false)

const currentItem = computed(() => {
    if (isFinished.value && finalWinner.value) {
        return finalWinner.value
    }
    return namesList.value[currentIndex.value] || { name: '', phone: '' }
})

// Pick a random winner at start
const selectFinalWinner = () => {
    const randomIndex = Math.floor(Math.random() * namesList.value.length)
    finalWinner.value = namesList.value[randomIndex] || null
}

onMounted(() => {
    selectFinalWinner()

    const startTime = Date.now()

    const runCycle = () => {
        const elapsed = Date.now() - startTime

        if (elapsed >= totalDuration) {
            isFinished.value = true
            return
        }

        // Cycle to next name
        currentIndex.value = (currentIndex.value + 1) % namesList.value.length

        // Eased progress (cubic ease-out style delay growth)
        const progress = elapsed / totalDuration
        const delay = startDelay + (endDelay - startDelay) * Math.pow(progress, 3.5)

        setTimeout(runCycle, delay)
    }

    runCycle()
})

const handleCardClick = () => {
    const winner = finalWinner.value || currentItem.value
    router.push({
        path: '/congratulations',
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


/* OUTER SILVER/GREY FRAME */
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
}

/* INNER GRADIENT RING */
.winner-card-inner {
    width: 100%;
    height: 100%;

    padding: 4px;

    border-radius: 36px;

    background: linear-gradient(180deg,
            #FFE36C 0%,
            #FFC200 33%,
            #F5A800 66%,
            #E58200 100%);

    box-sizing: border-box;
}

/* GOLD CARD */
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

    background: linear-gradient(180deg,
            #f6e57d 0%,
            #f6d64a 30%,
            #ffbf00 70%,
            #eb8a00 100%);
}

/* TOP GLOSS EFFECT */
.winner-content::before {
    content: '';

    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 50%;

    border-radius: 28px 28px 0 0;

    background: rgba(255, 255, 255, 0.15);

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

    color: #3E022F;

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
    transition: transform 0.15s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.15s ease-out;
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