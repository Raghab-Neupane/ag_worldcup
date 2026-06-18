<template>
    <div class="card-container" :class="{ 'flipped': isFlipped }">
        <div class="card-inner">
            <!-- Front Face -->
            <div class="card-face card-front">
                <div class="outer-layer">
                    <div class="inner-layer">
                        <img src="/logo.png" alt="logo" class="fifa-logo">
                    </div>
                </div>
            </div>
            <!-- Back Face (Winner) -->
            <div class="card-face card-back">
                <div class="outer-layer">
                    <div class="inner-layer winner-inner">
                        <div class="winner-badge">WINNER</div>
                        <div class="winner-photo">
                            <img :src="winnerImage || '/default-avatar.png'" alt="winner">
                        </div>
                        <div class="winner-name">{{ winnerName }}</div>
                        <div class="winner-phone">{{ maskedPhone }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    isFlipped?: boolean
    winnerName?: string
    winnerPhone?: string
    winnerImage?: string
}

const props = withDefaults(defineProps<Props>(), {
    isFlipped: false,
    winnerName: 'Winner Name',
    winnerPhone: '98******67',
    winnerImage: ''
})

const maskedPhone = computed(() => {
    const phone = props.winnerPhone
    if (phone.length <= 4) return phone
    return phone.slice(0, 2) + '******' + phone.slice(-2)
})
</script>

<style scoped>
.card-container {
    width: var(--card-width, 180px);
    height: var(--card-height, 258px);
    perspective: 1000px;
    flex-shrink: 0;
}

.card-inner {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.card-container.flipped .card-inner {
    transform: rotateY(180deg);
}

.card-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
}

.card-back {
    transform: rotateY(180deg);
}

/* ─── Front Card Styling ────────────────────────────────────── */
.front-card,
.card-front {
    display: flex;
    align-items: center;
    justify-content: center;
}

.outer-layer {
    width: 100%;
    height: 100%;
    border-radius: 16px;

    padding: 16px;
    background: linear-gradient(135deg, #ffd700 0%, #ff8c00 50%, #ff6b00 100%);
}

.inner-layer {
    width: 100%;
    height: 100%;
    background: #2b2d42;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.fifa-logo {
    width: 55%;
    object-fit: contain;
    opacity: 0.85;
}

/* ─── Winner Back Face Styling ──────────────────────────────── */
.winner-inner {
    flex-direction: column;
    padding: 12px;
    gap: 8px;
    background: linear-gradient(135deg, #1a1c2e 0%, #2b2d42 100%);
}

.winner-badge {
    background: linear-gradient(90deg, #ff0000 0%, #cc0000 100%);
    color: white;
    font-weight: 900;
    font-size: 0.85rem;
    padding: 4px 16px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 2px 8px rgba(255, 0, 0, 0.4);
}

.winner-photo {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid rgba(255, 215, 0, 0.5);
    box-shadow: 0 0 12px rgba(255, 215, 0, 0.3);
}

.winner-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.winner-name {
    color: #ffd700;
    font-weight: 700;
    font-size: 0.9rem;
    text-align: center;
}

.winner-phone {
    color: #a0a0a0;
    font-size: 0.75rem;
    text-align: center;
}
</style>