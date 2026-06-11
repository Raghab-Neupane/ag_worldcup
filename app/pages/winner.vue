<template>
    <section class="winner-page">
        <Background />

        <!-- Confetti Canvas -->
        <canvas ref="confettiCanvas" class="confetti-canvas"></canvas>

        <!-- Firework Canvas -->
        <canvas ref="fireworkCanvas" class="firework-canvas"></canvas>

        <div v-if="participantsError || matchError" class="error-message"
            style="position: relative; z-index: 10; color: white; text-align: center; margin-top: 20vh; font-size: 2rem;">
            Error fetching data: {{ participantsError?.message || matchError?.message }}
        </div>
        <div v-else class="winner-card" :class="{ 'entered': hasEntered, 'popping': isPopping }"
            @click="handleCardClick" style="cursor: pointer;">
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
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
import { useFetch } from '#app'
import Background from '../components/background.vue'
import { goToCongratulations } from '../router/router.vue'

interface Winner {
    name: string
    phone: string
    image?: string
}

// Get runtime config
const config = useRuntimeConfig()

// Fetch participants from backend
const { data: participants, error: participantsError } = await useFetch<Winner[]>(`${config.public.apiBase}/participants`)
const namesList = ref<Winner[]>(participants.value || [])
watch(participants, (val) => {
    if (val) namesList.value = val
})

// Fetch the currently selected match to get its match_no
const { data: selectedMatch, error: matchError } = await useFetch<any>(`${config.public.apiBase}/matches/selectedmatch`)

// ─── CONFIGURABLE TIMING ───────────────────────────────────────────
const totalDuration = 18000  // 8 seconds total
const startDelay = 30      // Slower at start (400ms per item)
const endDelay = 2800       // Very slow at end (1200ms per item)
// ──────────────────────────────────────────────────────────────────

const currentIndex = ref(0)
const finalWinner = ref<Winner | null>(null)
const isFinished = ref(false)
const hasEntered = ref(false)
const isPopping = ref(false)
let animationComplete = false

// Confetti and Firework refs
const confettiCanvas = ref<HTMLCanvasElement | null>(null)
const fireworkCanvas = ref<HTMLCanvasElement | null>(null)
let confettiInterval: number | null = null
let fireworkInterval: number | null = null

const currentItem = computed(() => {
    if (isFinished.value && finalWinner.value) return finalWinner.value
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

// Easing function for smooth deceleration
const easeOutCubic = (x: number): number => {
    return 1 - Math.pow(1 - x, 3)
}

// Confetti Animation
const startConfetti = () => {
    if (!confettiCanvas.value) return

    const canvas = confettiCanvas.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: any[] = []
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#ff44cc']

    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 8 + 4,
            speedX: (Math.random() - 0.5) * 3,
            speedY: Math.random() * 5 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10
        })
    }

    const animate = () => {
        if (!ctx || !canvas) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        let allFinished = true
        for (let p of particles) {
            if (p.y < canvas.height + 100) {
                allFinished = false
                p.x += p.speedX
                p.y += p.speedY
                p.rotation += p.rotationSpeed

                ctx.save()
                ctx.translate(p.x, p.y)
                ctx.rotate(p.rotation * Math.PI / 180)
                ctx.fillStyle = p.color
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
                ctx.restore()
            }
        }

        if (!allFinished) {
            requestAnimationFrame(animate)
        } else {
            if (confettiCanvas.value) {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
            }
        }
    }

    animate()
}

// Firework Animation
const startFirework = () => {
    if (!fireworkCanvas.value) return

    const canvas = fireworkCanvas.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: any[] = []
    const colors = ['#ff4444', '#ff8844', '#ffff44', '#44ff44', '#44ffff', '#ff44ff']

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    for (let i = 0; i < 80; i++) {
        const angle = (Math.PI * 2 * i) / 80
        const speed = Math.random() * 8 + 4
        particles.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 4 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1,
            gravity: 0.2
        })
    }

    const animate = () => {
        if (!ctx || !canvas) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        let anyAlive = false
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i]
            p.x += p.vx
            p.y += p.vy
            p.vy += p.gravity
            p.life -= 0.02

            if (p.life > 0 && p.y < canvas.height + 100) {
                anyAlive = true
                ctx.globalAlpha = p.life
                ctx.fillStyle = p.color
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                ctx.fill()
            } else {
                particles.splice(i, 1)
            }
        }

        if (anyAlive) {
            requestAnimationFrame(animate)
        } else {
            if (fireworkCanvas.value) {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
            }
        }
    }

    animate()
}

const startCelebration = () => {
    startConfetti()
    setTimeout(() => {
        startFirework()
    }, 200)

    // Repeated bursts for more celebration effect
    confettiInterval = setInterval(() => {
        startConfetti()
    }, 800) as unknown as number

    fireworkInterval = setInterval(() => {
        startFirework()
    }, 1200) as unknown as number

    // Stop after 4 seconds
    setTimeout(() => {
        if (confettiInterval) clearInterval(confettiInterval)
        if (fireworkInterval) clearInterval(fireworkInterval)
    }, 4000)
}

const navigateToCongratulations = async () => {
    if (!animationComplete) return

    startCelebration()

    const winner = finalWinner.value || currentItem.value

    // Update backend with the selected winner
    if (selectedMatch.value?.match_no) {
        try {
            await $fetch(`${config.public.apiBase}/matches/selectedmatch/${selectedMatch.value.match_no}`, {
                method: 'PATCH',
                body: { winner: winner.name, phone: winner.phone }
            })
        } catch (e) {
            console.error('Failed to post winner:', e)
        }
    }

    // Wait for celebration to start then navigate
    setTimeout(() => {
        goToCongratulations()
    }, 500)
}

const handleCardClick = () => {
    // Lock the screen - prevent any further action
    if (!animationComplete) return

    // Add popping animation
    isPopping.value = true

    // Start celebration and navigate
    navigateToCongratulations()
}

onMounted(() => {
    requestAnimationFrame(() => { hasEntered.value = true })
    selectFinalWinner()

    const startTime = Date.now()
    let timeoutId: number | null = null

    const runCycle = () => {
        const elapsed = Date.now() - startTime

        if (elapsed >= totalDuration) {
            isFinished.value = true
            animationComplete = true
            return
        }

        currentIndex.value = (currentIndex.value + 1) % namesList.value.length

        const progress = Math.min(1, elapsed / totalDuration)
        const easedProgress = easeOutCubic(progress)
        const delay = startDelay + (endDelay - startDelay) * easedProgress

        timeoutId = setTimeout(runCycle, delay) as unknown as number
    }

    runCycle()
})

onUnmounted(() => {
    if (confettiInterval) clearInterval(confettiInterval)
    if (fireworkInterval) clearInterval(fireworkInterval)
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

.winner-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 50%;
    margin-bottom: 10px;
    display: block;
    margin-left: auto;
    margin-right: auto;
}

.confetti-canvas,
.firework-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
}

.firework-canvas {
    z-index: 11;
}

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
    transform: scale(0.3) translateY(60px);
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: pointer;
}

.winner-card.entered {
    transform: scale(1) translateY(0);
}

/* Balloon Pop Animation */
.winner-card.popping {
    animation: balloonPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes balloonPop {
    0% {
        transform: scale(1);
        opacity: 1;
    }

    30% {
        transform: scale(1.3);
        opacity: 1;
    }

    100% {
        transform: scale(0);
        opacity: 0;
    }
}

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
    transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease-out;
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