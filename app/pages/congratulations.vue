<template>
    <section class="congratulations-page" :class="{ 'overlay-mode': isOverlay, 'pre-reveal': isOverlay && !visible }">
        <Background v-if="!isOverlay" />

        <!-- Lottie Animations Container -->
        <div class="animations-container">
            <div ref="confettiLottie" class="lottie-animation confetti-lottie"></div>
            <div ref="fireworkLottie" class="lottie-animation firework-lottie"></div>
            <div ref="fireworkLottie2" class="lottie-animation firework-lottie-2"></div>
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
            <div class="footer-text">🏆 THANK YOU FOR PARTICIPATING! 🏆</div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, onUnmounted, watch, nextTick } from 'vue'
import lottie from 'lottie-web'
import Background from '../components/background.vue'

const props = withDefaults(defineProps<{
    isOverlay?: boolean
    // When true (default), the page renders normally. When used as the
    // winner.vue overlay, this starts false — the stage is mounted and
    // measurable (images loaded, anchor laid out) but invisible, so the
    // card can morph to the real dock size before anything is shown.
    // Parent flips this true once the hold ends, fading everything in.
    visible?: boolean
    // When provided (winner already known from the reel/flip step), skip
    // the page's own fetch and just use this — avoids double-fetching and
    // any chance the overlay shows a different winner than the card that's
    // mid-flight onto the stage.
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
let confettiInstance: any = null
let fireworkInstance: any = null
let firework2Instance: any = null
const intervals: number[] = []

const confettiLottie = ref<HTMLDivElement | null>(null)
const fireworkLottie = ref<HTMLDivElement | null>(null)
const fireworkLottie2 = ref<HTMLDivElement | null>(null)
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

// Stage wrapper style: scales with card width, keeping proportions.
// No hard maxWidth cap — on an 8K TV the stage should genuinely get big,
// not stall out at a tiny fixed pixel ceiling meant for laptop screens.
//
// NOTE: height multiplier bumped 1.25 -> 1.35 to give the now-larger
// card-dock-anchor enough vertical headroom so the bigger card doesn't
// get visually cropped against the top of this wrapper.
const stageStyle = computed(() => ({
    width: `${cardWidth.value * 1.5}px`,   // stage wider than card
    height: `${cardHeight.value * 1.35}px`, // enough space for card + stage elements
    margin: '0 auto'
}))

// Same width+height-based sizing as winner.vue, so a short laptop screen
// doesn't get cards sized only off its width, and a big TV can scale up.
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
    // Winner handed down from winner.vue — already resolved, no fetch needed.
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
    return '/profile.webp'
})

const handleImageError = (event: Event) => {
    (event.target as HTMLImageElement).src = '/profile.svg'
}

// ─── Trigger the entrance fade-in ─────────────────────────────
// Gated on `visible` instead of firing unconditionally on mount: when
// used as the winner.vue overlay, the component mounts early (invisible)
// purely so its stage can be measured — this only plays once the parent
// actually reveals it. For non-overlay usage `visible` defaults true, so
// this fires immediately exactly like before.
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

// ─── Exposed: where should the WinnerReveal card land on the stage? ──
const stageImagesLoadedCount = ref(0)
const onStageImgLoad = () => {
    stageImagesLoadedCount.value += 1
}

// Resolves once both stage images have fired @load AND a couple of
// animation frames have passed (so layout/paint has actually settled).
// Reading getBoundingClientRect before this is what was causing the
// card to land at the wrong spot/size — the stage hadn't finished
// loading its images yet, so its box was still 0/garbage.
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

// Returns the dock anchor's REAL on-screen box — center point (for
// positioning) and actual pixel width/height (for sizing). No relative
// scale math: the caller morphs the card directly to width/height, so
// there's no approximation to drift out of sync with what's really
// rendered.
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

            if (confettiLottie.value) {
                confettiInstance = lottie.loadAnimation({
                    container: confettiLottie.value,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    animationData: confettiData
                })
            }
            if (fireworkLottie.value) {
                fireworkInstance = lottie.loadAnimation({
                    container: fireworkLottie.value,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    animationData: fireworkData
                })
            }
            if (fireworkLottie2.value) {
                firework2Instance = lottie.loadAnimation({
                    container: fireworkLottie2.value,
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
    confettiInstance?.destroy()
    fireworkInstance?.destroy()
    firework2Instance?.destroy()
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

/* Mounted-but-not-revealed state: stays in the layout (so images load
   and the dock anchor is measurable) but is fully invisible and inert
   until the parent flips `visible` to true. */
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
    width: min(50vw, 500px);
    height: min(50vw, 500px);
}

.firework-lottie-2 {
    top: 20%;
    left: 10%;
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

/* Invisible marker — purely a geometry anchor read via getBoundingClientRect
   so winner.vue knows exactly where to dock the incoming card. Sits where
   the card should visually rest on the stage.
   width/bottom bumped up from 48%/14% so the docked card grows tall
   enough that its top edge reaches the white line/wreath crossover —
   aspect-ratio is locked to the card's native shape, so height scales
   automatically with width. Nudge these two values to fine-tune. */
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

    .firework-lottie {
        width: 40vw;
        height: 40vw;
    }

    .firework-lottie-2 {
        display: none;
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

    .firework-lottie {
        width: 50vw;
        height: 50vw;
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