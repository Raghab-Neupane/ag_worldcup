<template>
    <section class="congratulations-page" :class="{ 'overlay-mode': isOverlay, 'pre-reveal': isOverlay && !visible }">
        <Background v-if="!isOverlay" />

        <audio src="/Cheering.mp3" autoplay></audio>
        <audio src="/Fireworks 2.mp3" autoplay loop></audio>
        <audio src="/Fireworks.mp3" autoplay loop></audio>

        <!-- Lottie Animations Container -->
        <div class="animations-container">
            <!-- Confetti: left, center, right -->
            <div ref="confettiLottieLeft" class="lottie-animation confetti-lottie-left"></div>
            <div ref="confettiLottieCenter" class="lottie-animation confetti-lottie-center"></div>
            <div ref="confettiLottieRight" class="lottie-animation confetti-lottie-right"></div>

            <!-- Fireworks: left, center, right -->
            <div ref="fireworkLottieLeft" class="lottie-animation firework-lottie-left"></div>
            <div ref="fireworkLottieCenter" class="lottie-animation firework-lottie-center"></div>
            <div ref="fireworkLottieRight" class="lottie-animation firework-lottie-right"></div>
        </div>

        <div class="congrats-container" :class="{ 'animate-in': animateIn }">
            <!-- Congratulations title -->
            <div class="congrats-title-wrapper">
                <img v-if="hasWinner" src="/Congratulations.png" id="winner-case" class="congrats-img" />
                <img v-else src="/Oops.png" id="draw-case" class="congrats-img" />
            </div>

            <!-- Winner card, standing on the stage, framed by the gold wreath -->
            <!-- NOTE: the actual winner card is NOT rendered here — it's the
                 same WinnerReveal card from winner.vue, smoothly docked into
                 this exact slot (see card-dock-anchor) so there's no swap/cut. -->
            <div class="stage-wrapper" v-if="hasWinner" ref="stageWrapperEl" :style="stageStyle">
                <img src="/stage.png" alt="Stage" class="stage-image" @load="onStageImgLoad" />
                <img src="/crops.png" alt="Crop" class="crop-image" @load="onStageImgLoad" />
                <!-- Invisible anchor marking exactly where the card should sit on the stage -->
                <div ref="cardDockAnchor" class="card-dock-anchor"></div>
            </div>

            <!-- Draw/Oops Fallback Case -->
            <div class="draw-container" v-else>
                <div class="winner-profile">
                    <img :src="winnerImage" @error="handleImageError" alt="Winner photo" />
                </div>
                <div class="winner-details">
                    <h2 class="winner-name">{{ winnerName }}</h2>
                    <h3 class="winner-phone">{{ winnerPhone }}</h3>
                </div>
            </div>
        </div>

        <div class="footer">
            <img src="/bl.png" />
            <img src="/mid.png" />
            <img src="/br.png" />
            <div class="footer-text"><span class="trophy">🏆</span> THANK YOU FOR PARTICIPATING! <span
                    class="trophy">🏆</span></div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, onUnmounted, watch, nextTick } from 'vue'
import lottie from 'lottie-web'
import Background from '../components/background.vue'

const props = withDefaults(defineProps<{
    isOverlay?: boolean
    visible?: boolean
    winner?: {
        name: string
        photo?: string
        mobile_number?: string
    } | null
}>(), {
    isOverlay: false,
    visible: true,
    winner: undefined
})

interface Winner {
    customer_id: string
    name: string
    photo: string
    point: number
    mobile_number: string
}

const animateIn = ref(false)
let confettiLeftInstance: any = null
let confettiCenterInstance: any = null
let confettiRightInstance: any = null
let fireworkLeftInstance: any = null
let fireworkCenterInstance: any = null
let fireworkRightInstance: any = null
const intervals: number[] = []

const confettiLottieLeft = ref<HTMLDivElement | null>(null)
const confettiLottieCenter = ref<HTMLDivElement | null>(null)
const confettiLottieRight = ref<HTMLDivElement | null>(null)
const fireworkLottieLeft = ref<HTMLDivElement | null>(null)
const fireworkLottieCenter = ref<HTMLDivElement | null>(null)
const fireworkLottieRight = ref<HTMLDivElement | null>(null)
const stageWrapperEl = ref<HTMLDivElement | null>(null)
const cardDockAnchor = ref<HTMLDivElement | null>(null)

// ─── Responsive card size (same as winner page) ──────────────
const ASPECT_RATIO = 485.79 / 337.94
const MIN_CARD_WIDTH = 110
const MAX_CARD_WIDTH = 520

const cardWidth = ref(220)
const cardHeight = computed(() => cardWidth.value * ASPECT_RATIO)

const cardSizeVars = computed(() => ({
    '--card-width': `${cardWidth.value}px`,
    '--card-height': `${cardHeight.value}px`
}))

const stageStyle = computed(() => ({
    width: `${cardWidth.value * 1.5}px`,
    height: `${cardHeight.value * 1.35}px`,
    margin: '0 auto'
}))

const updateCardWidth = () => {
    const widthTarget = window.innerWidth / 6.5
    const heightTarget = window.innerHeight / 2.2
    const target = Math.min(widthTarget, heightTarget)
    cardWidth.value = Math.min(MAX_CARD_WIDTH, Math.max(MIN_CARD_WIDTH, target))
}

// ─── Winner data ───────────────────────────────────────────────
const config = useRuntimeConfig()

const winnerData = ref<Winner | null>(null)

if (props.winner !== undefined) {
    watch(() => props.winner, (val) => {
        winnerData.value = val ? (val as Winner) : null
    }, { immediate: true })
} else {
    const postId = sessionStorage.getItem('selectedPostId')
    const { data: winnerDataFromApi } = await useFetch<Winner>(
        `${config.public.winnersEndpoint}?post_id=${postId}`
    )

    watch(winnerDataFromApi, (newVal) => {
        if (newVal) {
            if (typeof newVal === 'object' && 'winner' in newVal && (newVal as any).winner === null) {
                winnerData.value = null
            } else {
                winnerData.value = typeof newVal === 'object' ? ((newVal as any).winner || newVal) : null
            }
        }
    }, { immediate: true })
}

const hasWinner = computed(() => {
    if (!winnerData.value) return false
    const name = winnerData.value.name
    return !!(name && name !== 'null' && name !== 'undefined')
})

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
    return '/profile.png'
})

const handleImageError = (event: Event) => {
    (event.target as HTMLImageElement).src = '/profile.png'
}

// ─── Trigger the entrance fade-in ─────────────────────────────
watch(() => props.visible, (v) => {
    if (v) setTimeout(() => { animateIn.value = true }, 100)
}, { immediate: true })

// ─── Load Lottie animations ──────────────────────────────────
const loadAnimation = (fileName: string) => {
    return new Promise((resolve, reject) => {
        fetch(`/animations/${fileName}`)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load ${fileName}`)
                return response.json()
            })
            .then(data => resolve(data))
            .catch(reject)
    })
}

// ─── Exposed: card dock position ─────────────────────────────
const stageImagesLoadedCount = ref(0)
const onStageImgLoad = () => {
    stageImagesLoadedCount.value += 1
}

const waitForStageReady = () => {
    return new Promise<void>((resolve) => {
        const check = () => {
            if (stageImagesLoadedCount.value >= 2) {
                requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
            } else {
                setTimeout(check, 30)
            }
        }
        check()
    })
}

const getCardDockRect = () => {
    if (!cardDockAnchor.value) return null
    const rect = cardDockAnchor.value.getBoundingClientRect()
    return {
        top: `${rect.top + rect.height / 2}px`,
        left: `${rect.left + rect.width / 2}px`,
        width: rect.width,
        height: rect.height
    }
}

defineExpose({ getCardDockRect, waitForStageReady })

onMounted(async () => {
    updateCardWidth()
    window.addEventListener('resize', updateCardWidth)

    await nextTick()

    try {
        if (hasWinner.value) {
            const [confettiData, fireworkData] = await Promise.all([
                loadAnimation('Confetti.json'),
                loadAnimation('Firework.json')
            ])

            // Confetti left
            if (confettiLottieLeft.value) {
                confettiLeftInstance = lottie.loadAnimation({
                    container: confettiLottieLeft.value,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    animationData: confettiData
                })
            }
            // Confetti center
            if (confettiLottieCenter.value) {
                confettiCenterInstance = lottie.loadAnimation({
                    container: confettiLottieCenter.value,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    animationData: confettiData
                })
            }
            // Confetti right
            if (confettiLottieRight.value) {
                confettiRightInstance = lottie.loadAnimation({
                    container: confettiLottieRight.value,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    animationData: confettiData
                })
            }
            // Firework left
            if (fireworkLottieLeft.value) {
                fireworkLeftInstance = lottie.loadAnimation({
                    container: fireworkLottieLeft.value,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    animationData: fireworkData
                })
            }
            // Firework center
            if (fireworkLottieCenter.value) {
                fireworkCenterInstance = lottie.loadAnimation({
                    container: fireworkLottieCenter.value,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    animationData: fireworkData
                })
            }
            // Firework right
            if (fireworkLottieRight.value) {
                fireworkRightInstance = lottie.loadAnimation({
                    container: fireworkLottieRight.value,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    animationData: fireworkData
                })
            }
        }
    } catch (error) {
        console.error('Error loading animations:', error)
    }
})

onUnmounted(() => {
    window.removeEventListener('resize', updateCardWidth)
    confettiLeftInstance?.destroy()
    confettiCenterInstance?.destroy()
    confettiRightInstance?.destroy()
    fireworkLeftInstance?.destroy()
    fireworkCenterInstance?.destroy()
    fireworkRightInstance?.destroy()
    intervals.forEach(clearInterval)
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

.congratulations-page.overlay-mode {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    z-index: 15;
    transition: opacity 0.5s ease;
}

.congratulations-page.overlay-mode.pre-reveal {
    opacity: 0;
    pointer-events: none;
}

/* ─── Lottie animations ─────────────────────────────────────── */
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

/* Confetti – left, center, right */
.confetti-lottie-left {
    top: 0;
    left: 0;
    width: 40%;
    height: 100%;
}

.confetti-lottie-center {
    top: 0;
    left: 30%;
    width: 40%;
    height: 100%;
}

.confetti-lottie-right {
    top: 0;
    right: 0;
    width: 40%;
    height: 100%;
}

/* Fireworks – left, center, right */
.firework-lottie-left {
    top: 20%;
    left: 3%;
    width: min(30vw, 300px);
    height: min(30vw, 300px);
}

.firework-lottie-center {
    top: 10%;
    left: 50%;
    transform: translateX(-50%);
    width: min(35vw, 350px);
    height: min(35vw, 350px);
}

.firework-lottie-right {
    top: 20%;
    right: 3%;
    width: min(30vw, 300px);
    height: min(30vw, 300px);
}

/* ─── Main container ─────────────────────────────────────────── */
.congrats-container {
    position: relative;
    z-index: 15;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    margin-top: 52px;
    text-align: center;
    width: 90vw;
    max-width: 1200px;
    height: 100vh;
    gap: clamp(20px, 4vh, 60px);
    padding: clamp(140px, 18vh, 220px) 0 clamp(100px, 12vh, 160px);
    box-sizing: border-box;
    opacity: 0;
    transition: opacity 0.8s ease-out;
}

.congrats-container.animate-in {
    opacity: 1;
}

.congrats-title-wrapper {
    position: absolute;
    top: calc(11vh + clamp(60px, 8vw, 150px));
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
}

.congrats-img {
    width: clamp(180px, 30vw, 550px);
    height: auto;
    max-width: 85vw;
    object-fit: contain;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
}

#draw-case {
    width: clamp(120px, 18vw, 300px);
}

/* ─── Stage + card composition ──────────────────────────────── */
.stage-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    width: 100%;
    max-width: 1100px;
    height: calc(var(--card-height, 300px) * 1.45);
    margin: 0 auto;
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

.card-dock-anchor {
    position: absolute;
    z-index: 3;
    left: 50%;
    bottom: 10%;
    width: 65%;
    aspect-ratio: 337.94 / 485.79;
    transform: translateX(-50%);
    pointer-events: none;
    visibility: hidden;
}

/* ─── Footer ─────────────────────────────────────────────────── */
.footer {
    position: absolute;
    bottom: clamp(15px, 3.5vh, 45px);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(280px, 55vw, 750px);
    z-index: 20;
}

.footer img {
    height: clamp(26px, 4.5vh, 50px);
    display: block;
    object-fit: fill;
}

.footer img[src*="bl.png"],
.footer img[src*="br.png"] {
    flex: 0 0 auto;
    width: auto;
}

.footer img[src*="mid.png"] {
    flex: 1 1 0;
    width: 0;
}

.footer-text {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 25;
    color: #ffffff;
    font-family: 'Work Sans', sans-serif;
    font-weight: 400;
    font-size: clamp(11px, 1.2vw, 24px);
    letter-spacing: clamp(1px, 0.1vw, 2px);
    white-space: nowrap;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
    pointer-events: none;
}

.trophy {
    display: inline-block;
    animation: trophyPulse 2s ease-in-out infinite;
}

.trophy:nth-child(1) {
    animation-delay: 0s;
}

.trophy:nth-child(2) {
    animation-delay: 1s;
}

@keyframes trophyPulse {

    0%,
    100% {
        transform: scale(1);
        opacity: 1;
    }

    50% {
        transform: scale(1.6);
        opacity: 1;
    }
}

/* ─── Responsive fine‑tuning ────────────────────────────────── */
@media (max-width: 768px) {
    .congrats-container {
        gap: clamp(8px, 1.5vh, 12px);
        padding-top: clamp(40px, 8vh, 80px);
    }

    .congrats-img {
        width: clamp(140px, 35vw, 220px);
    }

    .stage-wrapper {
        max-width: 280px;
    }

    .stage-image {
        max-width: 240px;
    }

    .crop-image {
        max-width: 300px;
        bottom: 6%;
    }

    /* Adjust firework sizes on tablets */
    .firework-lottie-left,
    .firework-lottie-right {
        width: 25vw;
        height: 25vw;
        top: 15%;
    }

    .firework-lottie-center {
        width: 30vw;
        height: 30vw;
        top: 8%;
    }
}

@media (max-width: 480px) {
    .congrats-img {
        width: clamp(100px, 40vw, 160px);
    }

    .stage-wrapper {
        max-width: 200px;
    }

    .stage-image {
        max-width: 180px;
    }

    .crop-image {
        max-width: 220px;
    }

    /* Fireworks smaller on phones */
    .firework-lottie-left,
    .firework-lottie-right {
        width: 30vw;
        height: 30vw;
        top: 10%;
        left: 2%;
        right: 2%;
    }

    .firework-lottie-center {
        width: 35vw;
        height: 35vw;
        top: 5%;
    }
}

/* Draw/Oops Fallback Case Styles */
.draw-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(15px, 3vh, 35px);
}

.winner-profile {
    width: clamp(140px, 20vh, 220px);
    height: clamp(140px, 20vh, 220px);
    border-radius: 20px;
    border: 4px solid #ffffff;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #1a1a1a;
    flex-shrink: 0;
}

.winner-profile img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.winner-details {
    display: flex;
    flex-direction: column;
    gap: clamp(6px, 1vh, 14px);
    align-items: center;
}

.winner-name {
    font-family: 'Work Sans', sans-serif;
    font-size: clamp(24px, 3.5vw, 44px);
    font-weight: 700;
    color: #ffffff;
    margin: 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
    line-height: 1.15;
}

.winner-phone {
    font-family: 'Work Sans', sans-serif;
    font-size: clamp(16px, 2.5vw, 28px);
    font-weight: 600;
    color: #e1750a;
    margin: 0;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    line-height: 1.15;
}
</style>