<template>
    <section class="winner-page">
        <Background />

        <!-- Lottie Celebration Canvas -->
        <canvas ref="lottieCanvas" class="lottie-canvas"></canvas>

        <div v-if="participantsError" class="error-container">
            <div class="error-box">
                <div class="caution-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="80" height="80" fill="none"
                        stroke="#FF3B30" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="triangle-svg">
                        <path
                            d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                            fill="rgba(255, 59, 48, 0.1)"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </div>
                <div class="error-message-text">
                    Error loading data: {{ participantsError }}
                </div>
            </div>
        </div>
        <div class="winner-placeholder" v-else>
            <div class="winner-card" :class="{ 'entered': hasEntered, 'finished': isFinished }">
                <div class="winner-card-inner">
                    <div class="winner-content">
                        <Transition name="slide" mode="out-in">
                            <div :key="currentIndex" class="slide-item">
                                <h4 class="winner-name">{{ currentItem.name }}</h4>
                                <h4 class="winner-phone">{{ formatPhone(currentItem.mobile_number) }}</h4>
                            </div>
                        </Transition>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import Background from '../components/background.vue'
import { goToCongratulations } from '../router/router'
import lottie, { type AnimationItem } from 'lottie-web'
import participantsData from '../../participants.json'

interface Participant {
    customer_id: string
    name: string
    photo: string
    point: number
    mobile_number: string
}

const config = useRuntimeConfig()
const postId = sessionStorage.getItem('selectedPostId')
const { data: winnerDataFromApi } = await useFetch<Participant>(`${config.public.winnersEndpoint}?post_id=${postId}`)
const winnerFromJson: Participant | null = (winnerDataFromApi?.value as any)?.winner || winnerDataFromApi?.value || participantsData.winner || null

// Extract data from JSON as default fallback
let allParticipants: Participant[] = participantsData.participants || []

// Extract participants list from the single winners endpoint payload response
if (winnerDataFromApi.value) {
    const apiVal = winnerDataFromApi.value as any
    if (apiVal.correct_participants || apiVal.partial_participants) {
        const correct = apiVal.correct_participants || []
        const partial = apiVal.partial_participants || []
        allParticipants = [...correct, ...partial]
    } else if (apiVal.participants) {
        allParticipants = apiVal.participants
    }
}

// Build the scrolling array: ONLY other participants (excluding the winner)
const scrollingList = ref<Participant[]>([])

// Error handling
const participantsError = ref<string | null>(null)

if (allParticipants.length > 0) {
    if (winnerFromJson) {
        const otherParticipants = allParticipants.filter(
            p => p.customer_id !== winnerFromJson.customer_id
        )
        scrollingList.value = otherParticipants
    } else {
        scrollingList.value = [...allParticipants]
    }
}

// Fallback if there are no other participants (so the wheel has something to show)
if (scrollingList.value.length === 0 && winnerFromJson) {
    scrollingList.value = [winnerFromJson]
}

// Set the final winner directly
const finalWinnerValue = winnerFromJson || null

// Validate we have data to show
if (scrollingList.value.length === 0) {
    participantsError.value = 'No valid participant data available'
}

// Store winner in sessionStorage for congratulations page
if (finalWinnerValue) {
    sessionStorage.setItem('winner', JSON.stringify(finalWinnerValue))
}

// ─── CONFIGURABLE TIMING FOR LOTTERY-STYLE SCROLLING ──────────────────
const totalDuration = 18000  // 18 seconds total
const minDelay = 630          // Fastest scroll speed (very fast at start)
const maxDelay = 900         // Slowest scroll speed (sudden slow at end)
// ─────────────────────────────────────────────────────────────────────

const currentIndex = ref(0)
const finalWinner = ref<Participant | null>(finalWinnerValue)
const isFinished = ref(false)
const hasEntered = ref(false)
let navigationTimeout: ReturnType<typeof setTimeout> | null = null

// Lottie canvas ref & animation instance
const lottieCanvas = ref<HTMLCanvasElement | null>(null)
let lottieAnim: AnimationItem | null = null

// Track repeated celebration intervals
let celebrationReplayInterval: ReturnType<typeof setInterval> | null = null
let celebrationStopTimeout: ReturnType<typeof setTimeout> | null = null

const currentItem = computed(() => {
    if (isFinished.value && finalWinner.value) return finalWinner.value
    return scrollingList.value[currentIndex.value] || { name: '', mobile_number: '', customer_id: '', photo: '', point: 0 }
})

const formatPhone = (phone: string) => {
    if (!phone) return ''
    const p = phone.trim()
    if (p.length <= 4) return p
    return p.slice(0, 2) + '*'.repeat(p.length - 4) + p.slice(-2)
}

// Strong easing function for dramatic slowdown (like a lottery wheel)
// This creates a "fast fast fast then suddenly slow" effect
const easeOutElastic = (x: number): number => {
    const c4 = (2 * Math.PI) / 3
    return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1
}

const easeOutBack = (x: number): number => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

// Combined easing for best lottery effect: fast start, dramatic slowdown
const easeLottery = (x: number): number => {
    if (x < 0.7) {
        // First 70% of time: very fast scrolling (linear or slight acceleration)
        return x * 0.3 // Stays in low delay range
    } else {
        // Last 30%: dramatic slowdown
        const slowProgress = (x - 0.7) / 0.3
        return 0.3 + easeOutBack(slowProgress) * 0.7
    }
}

// Function to calculate dynamic delay based on progress
const calculateDelay = (progress: number): number => {
    // Use lottery easing for dramatic effect
    const easedProgress = easeLottery(progress)
    // Delay ranges from minDelay (fast) to maxDelay (slow)
    // This creates the "fast fast fast then sudden slow" effect
    return minDelay + (maxDelay - minDelay) * easedProgress
}

// setTimeout-based animation with lottery-style scrolling
let timeoutId: ReturnType<typeof setTimeout> | null = null
let cycleCount = 0

const startLotteryAnimation = () => {
    const startTimeRef = Date.now()
    let previousDelay = minDelay
    cycleCount = 0

    const runCycle = () => {
        const elapsed = Date.now() - startTimeRef

        if (elapsed >= totalDuration) {
            // Stop the animation and show winner
            if (timeoutId) clearTimeout(timeoutId)
            timeoutId = null

            currentIndex.value = 0
            isFinished.value = true

            // Start celebration
            startCelebration()

            // Navigate to congratulations after celebration
            navigationTimeout = setTimeout(() => {
                navigateToCongratulations()
            }, 1500)

            return
        }

        const progress = Math.min(1, elapsed / totalDuration)
        const delay = calculateDelay(progress)

        // Log speed changes for debugging (can remove in production)
        if (Math.abs(delay - previousDelay) > 50) {
            console.log(`Speed change: ${previousDelay}ms → ${delay}ms at ${Math.round(progress * 100)}%`)
            previousDelay = delay
        }

        // Cycle through participants
        currentIndex.value = (currentIndex.value + 1) % scrollingList.value.length
        cycleCount++

        timeoutId = setTimeout(runCycle, delay)
    }

    runCycle()
}

// Start celebration animation
const startCelebration = () => {
    if (!lottieCanvas.value) return

    if (lottieAnim) {
        lottieAnim.destroy()
        lottieAnim = null
    }

    lottieAnim = lottie.loadAnimation({
        container: lottieCanvas.value as unknown as Element,
        renderer: 'canvas',
        loop: false,
        autoplay: true,
        path: '/firework_burst_confetti.json',
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice',
            clearCanvas: true,
        }
    })

    // Replay celebration every 1.5 seconds for 4 seconds
    celebrationReplayInterval = setInterval(() => {
        if (lottieAnim) {
            lottieAnim.goToAndPlay(0, true)
        }
    }, 1500)

    celebrationStopTimeout = setTimeout(() => {
        if (celebrationReplayInterval) {
            clearInterval(celebrationReplayInterval)
            celebrationReplayInterval = null
        }
        if (lottieAnim) {
            lottieAnim.addEventListener('complete', () => {
                if (lottieAnim) {
                    lottieAnim.destroy()
                    lottieAnim = null
                }
            })
        }
    }, 4000)
}

// Navigation to congratulations
const navigateToCongratulations = async () => {
    const winner = finalWinner.value || currentItem.value
    // Store winner data before navigating
    if (winner) {
        sessionStorage.setItem('winner', JSON.stringify(winner))
    }
    // Small delay to ensure sessionStorage is written
    setTimeout(() => {
        goToCongratulations()
    }, 100)
}

// Lifecycle
onMounted(() => {
    requestAnimationFrame(() => { hasEntered.value = true })

    if (scrollingList.value.length === 0) {
        console.error('No participants data available')
        return
    }

    // Setup canvas
    if (lottieCanvas.value) {
        lottieCanvas.value.width = window.innerWidth
        lottieCanvas.value.height = window.innerHeight
    }

    // Handle window resize
    const onResize = () => {
        if (lottieCanvas.value) {
            lottieCanvas.value.width = window.innerWidth
            lottieCanvas.value.height = window.innerHeight
            if (lottieAnim) lottieAnim.resize()
        }
    }
    window.addEventListener('resize', onResize)

    // Start lottery-style animation
    startLotteryAnimation()

    // Debug logging
    console.log('Scrolling List:', scrollingList.value)
    console.log('Final Winner:', finalWinner.value)
    console.log('Total participants:', scrollingList.value.length)
    console.log('Lottery-style scrolling started - fast then sudden slow!')

        // Store resize handler for cleanup
        ; (window as any).__winnerPageResizeHandler = onResize
})

onUnmounted(() => {
    // Clear all timeouts and intervals
    if (timeoutId) clearTimeout(timeoutId)
    if (navigationTimeout) clearTimeout(navigationTimeout)
    if (celebrationReplayInterval) clearInterval(celebrationReplayInterval)
    if (celebrationStopTimeout) clearTimeout(celebrationStopTimeout)

    // Destroy Lottie instance
    if (lottieAnim) {
        lottieAnim.destroy()
        lottieAnim = null
    }

    // Remove resize listener
    const handler = (window as any).__winnerPageResizeHandler
    if (handler) {
        window.removeEventListener('resize', handler)
        delete (window as any).__winnerPageResizeHandler
    }
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

.lottie-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
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
}

.winner-card.entered {
    transform: scale(1) translateY(0);
}

.winner-card.finished {
    animation: winnerPulse 0.5s ease-in-out 3;
}

@keyframes winnerPulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
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

/* SLIDE TRANSITION - Enhanced for sequential flow */
.slide-enter-active,
.slide-leave-active {
    transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.slide-enter-from {
    transform: translateY(100%);
    opacity: 0;
}

.slide-leave-to {
    transform: translateY(-100%);
    opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
    transform: translateY(0);
    opacity: 1;
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

/* Error Showcase Styling */
.error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 10;
    margin-top: 15vh;
    padding: 20px;
    width: 100%;
    max-width: 480px;
    margin-left: auto;
    margin-right: auto;
}

.caution-icon {
    margin-bottom: 24px;
    filter: drop-shadow(0 4px 12px rgba(255, 59, 48, 0.3));
    animation: errorShake 0.5s ease-in-out;
}

@keyframes errorShake {

    0%,
    100% {
        transform: translateX(0);
    }

    20%,
    60% {
        transform: translateX(-6px);
    }

    40%,
    80% {
        transform: translateX(6px);
    }
}

.triangle-svg {
    display: block;
}

.error-box {
    background: #ffffff;
    border-radius: 24px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    width: 100%;
    min-height: 260px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 32px 24px;
    box-sizing: border-box;
    border: 1px solid rgba(0, 0, 0, 0.08);
}

.error-box-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 10px;
}

.error-title {
    color: #1a202c;
    font-family: 'Work Sans', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    text-align: center;
}

.error-message-text {
    color: #e53e3e;
    font-family: 'Work Sans', sans-serif;
    font-size: 1rem;
    font-weight: 500;
    text-align: center;
    border-top: 1.5px dashed #edf2f7;
    padding-top: 20px;
    width: 100%;
    word-break: break-word;
}
</style>