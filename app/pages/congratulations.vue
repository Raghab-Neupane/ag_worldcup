<template>
    <section class="congratulations-page">
        <Background />

        <!-- Lottie Animations Container -->
        <div class="animations-container">
            <div ref="confettiLottie" class="lottie-animation confetti-lottie"></div>
            <div ref="fireworkLottie" class="lottie-animation firework-lottie"></div>
            <div ref="fireworkLottie2" class="lottie-animation firework-lottie-2"></div>
        </div>

        <div class="congrats-container" :class="{ 'animate-in': animateIn }">
            <!-- Congratulations title -->
            <div class="congrats-title-wrapper">
                <img src="/Congratulations.png" alt="Congratulations" class="congrats-img">
            </div>

            <!-- Winner profile photo -->
            <div class="winner-profile">
                <img :src="winnerImage">
            </div>

            <!-- Winner name and phone -->
            <div class="winner-details">
                <h2 class="winner-name">{{ winnerName }}</h2>
                <h3 class="winner-phone">{{ winnerPhone }}</h3>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, onMounted, ref, onUnmounted } from 'vue'
import lottie from 'lottie-web'
import Background from '../components/background.vue'

const route = useRoute()
const animateIn = ref(false)
let confettiInstance: any = null
let fireworkInstance: any = null
let firework2Instance: any = null
let intervals: number[] = []

const config = useRuntimeConfig()
const { data: selectedMatch } = await useFetch<any>(`${config.public.apiBase}/matches/selectedmatch`)
// Participants Endpoint use participants.public.apiBase
const { data: participants } = await useFetch<any[]>(`${config.public.participants}/participants`)

const winnerName = computed(() => selectedMatch.value?.winner || '_')
const winnerPhone = computed(() => {
    const rawPhone = selectedMatch.value?.phone || '_'
    if (rawPhone === '98******67' || rawPhone === '_') return rawPhone
    const p = rawPhone.trim()
    if (p.length <= 4) return p
    return p.slice(0, 2) + '*'.repeat(p.length - 4) + p.slice(-2)
})

const winnerImage = computed(() => {
    const base = config.public.assetsUrl || ''
    const participant = participants.value?.find(p => p.name === winnerName.value)
    return participant?.image ? base + '/' + participant.image : base + '/profile.webp'
})

// Lottie refs
const confettiLottie = ref<HTMLDivElement | null>(null)
const fireworkLottie = ref<HTMLDivElement | null>(null)
const fireworkLottie2 = ref<HTMLDivElement | null>(null)

// Helper function to load animation from public folder
const loadAnimation = (fileName: string) => {
    return new Promise((resolve, reject) => {
        fetch(`/animations/${fileName}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${fileName}`)
                }
                return response.json()
            })
            .then(data => resolve(data))
            .catch(reject)
    })
}

onMounted(async () => {
    // Trigger entrance animation
    setTimeout(() => {
        animateIn.value = true
    }, 100)

    try {
        // Load animations from public folder
        const confettiData = await loadAnimation('Confetti.json')
        const fireworkData = await loadAnimation('Firework.json')

        // Start Confetti Animation
        if (confettiLottie.value) {
            confettiInstance = lottie.loadAnimation({
                container: confettiLottie.value,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                animationData: confettiData
            })

            // Stop after 4 seconds
            setTimeout(() => {
                if (confettiInstance) {
                    confettiInstance.stop()
                }
            }, 4000)
        }

        // Start Firework Animation (Center)
        if (fireworkLottie.value) {
            const startFirework = () => {
                if (fireworkLottie.value) {
                    const firework = lottie.loadAnimation({
                        container: fireworkLottie.value!,
                        renderer: 'svg',
                        loop: false,
                        autoplay: true,
                        animationData: fireworkData
                    })
                    setTimeout(() => {
                        firework.destroy()
                    }, 1000)
                    return firework
                }
                return null
            }

            // Start first firework
            fireworkInstance = startFirework()

            // Restart firework every 1.5 seconds for 4 seconds
            let count = 0
            const interval = setInterval(() => {
                if (count < 3) {
                    startFirework()
                    count++
                } else {
                    clearInterval(interval)
                }
            }, 1500)
            intervals.push(interval)

            setTimeout(() => {
                if (fireworkInstance) {
                    fireworkInstance.destroy()
                }
            }, 10000)
        }

        // Start Second Firework Animation (Offset)
        if (fireworkLottie2.value) {
            const startFirework2 = () => {
                if (fireworkLottie2.value) {
                    const firework2 = lottie.loadAnimation({
                        container: fireworkLottie2.value!,
                        renderer: 'svg',
                        loop: false,
                        autoplay: true,
                        animationData: fireworkData
                    })
                    setTimeout(() => {
                        firework2.destroy()
                    }, 4000)
                    return firework2
                }
                return null
            }

            // Start first firework
            firework2Instance = startFirework2()

            // Restart second firework every 1.8 seconds
            let count = 0
            const interval2 = setInterval(() => {
                if (count < 2) {
                    startFirework2()
                    count++
                } else {
                    clearInterval(interval2)
                }
            }, 1800)
            intervals.push(interval2)

            setTimeout(() => {
                if (firework2Instance) {
                    firework2Instance.destroy()
                }
            }, 4000)
        }
    } catch (error) {
        console.error('Error loading animations:', error)
    }
})

onUnmounted(() => {
    // Clean up animations
    if (confettiInstance) {
        confettiInstance.destroy()
    }
    if (fireworkInstance) {
        fireworkInstance.destroy()
    }
    if (firework2Instance) {
        firework2Instance.destroy()
    }
    // Clear all intervals
    intervals.forEach(interval => clearInterval(interval))
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=The+Nautigal:wght@700&family=Work+Sans:wght@600;700;900&display=swap');

.congratulations-page {
    position: relative;
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    box-sizing: border-box;
}

/* Lottie Animations Container */
.animations-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
}

.lottie-animation {
    position: absolute;
    pointer-events: none;
}

.confetti-lottie {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.firework-lottie {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    height: 400px;
}

.firework-lottie-2 {
    top: 30%;
    left: 20%;
    width: 300px;
    height: 300px;
}

/* Main Container Animation */
.congrats-container {
    position: relative;
    z-index: 15;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 90vw;
    max-width: 1200px;
    gap: clamp(16px, 2.5vh, 32px);
    margin-top: 17vh;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.congrats-container.animate-in {
    opacity: 1;
    transform: scale(1);
}

/* Congratulations title */
.congrats-title-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: clamp(8px, 1.5vh, 20px);
}

.congrats-img {
    height: clamp(100px, 16vh, 220px);
    width: auto;
    max-width: 85vw;
    object-fit: contain;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
}

/* Winner profile */
.winner-profile {
    width: clamp(130px, 16vh, 240px);
    height: clamp(130px, 16vh, 240px);
    border-radius: 20px;
    border: 4px solid #ffffff;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #1a1a1a;
    flex-shrink: 0;
    transition: transform 0.3s ease;
}

.congrats-container.animate-in .winner-profile {
    animation: profilePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

@keyframes profilePop {
    0% {
        transform: scale(0);
        opacity: 0;
    }

    50% {
        transform: scale(1.1);
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

/* Winner details */
.winner-details {
    display: flex;
    flex-direction: column;
    gap: clamp(6px, 1vh, 14px);
}

.winner-name {
    font-family: 'Work Sans', sans-serif;
    font-size: clamp(16px, 3.5vw, 44px);
    font-weight: 700;
    color: #ffffff;
    margin: 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
    line-height: 1.15;
}

.congrats-container.animate-in .winner-name {
    animation: slideUpFade 0.5s ease-out 0.3s both;
}

.winner-phone {
    font-family: 'Work Sans', sans-serif;
    font-size: clamp(18px, 2.5vw, 44px);
    font-weight: 600;
    color: #ffffff;
    opacity: 0.95;
    margin: 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
    letter-spacing: 2px;
}

.congrats-container.animate-in .winner-phone {
    animation: slideUpFade 0.5s ease-out 0.4s both;
}

@keyframes slideUpFade {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* ==================== RESPONSIVE STYLES ==================== */

/* Large TV screens */
@media (min-width: 1920px) {
    .congrats-container {
        gap: clamp(20px, 2.5vh, 36px);
    }

    .congrats-img {
        height: clamp(160px, 18vh, 300px);
    }

    .winner-profile {
        width: clamp(180px, 18vh, 300px);
        height: clamp(180px, 18vh, 300px);
        border-radius: 28px;
        border-width: 5px;
    }

    .winner-name {
        font-size: clamp(40px, 3.5vw, 80px);
    }

    .winner-phone {
        font-size: clamp(28px, 2.5vw, 56px);
    }

    .firework-lottie {
        width: 600px;
        height: 600px;
    }
}

/* 4K-screens */
@media (min-width: 2560px) {
    .congrats-container {
        gap: clamp(24px, 2.5vh, 44px);
    }

    .congrats-img {
        height: clamp(200px, 20vh, 380px);
    }

    .winner-profile {
        width: clamp(220px, 20vh, 360px);
        height: clamp(220px, 20vh, 360px);
        border-radius: 32px;
        border-width: 6px;
    }

    .winner-name {
        font-size: clamp(52px, 3.5vw, 100px);
    }

    .winner-phone {
        font-size: clamp(36px, 2.5vw, 72px);
    }

    .firework-lottie {
        width: 800px;
        height: 800px;
    }
}

/* Tablets */
@media (max-width: 1024px) {
    .congrats-container {
        gap: clamp(12px, 2vh, 24px);
    }

    .congrats-img {
        height: clamp(90px, 14vh, 170px);
    }

    .winner-profile {
        width: clamp(130px, 16vh, 200px);
        height: clamp(130px, 16vh, 200px);
    }

    .firework-lottie {
        width: 300px;
        height: 300px;
    }

    .firework-lottie-2 {
        width: 250px;
        height: 250px;
    }
}

/* Mobile phones */
@media (max-width: 768px) {
    .congrats-container {
        gap: clamp(10px, 1.8vh, 18px);
    }

    .congrats-img {
        height: clamp(70px, 12vh, 130px);
    }

    .winner-profile {
        width: clamp(110px, 18vh, 160px);
        height: clamp(110px, 18vh, 160px);
        border-radius: 16px;
        border-width: 3px;
    }

    .winner-name {
        font-size: clamp(20px, 6vw, 36px);
    }

    .winner-phone {
        font-size: clamp(14px, 4.5vw, 24px);
    }

    .firework-lottie {
        width: 150px;
        height: 250px;
    }

    .firework-lottie-2 {
        display: none;
    }
}
</style>