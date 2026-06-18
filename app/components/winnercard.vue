<template>
    <div class="winner-card">
        <div class="winner-card-inner">
            <div class="winner-badge">
                WINNER
            </div>

            <div class="winner-photo">
                <img :src="winnerImage || '/default-avatar.png'" alt="Winner">
            </div>

            <div class="winner-name">
                {{ winnerName }}
            </div>

            <div class="winner-phone">
                {{ maskedPhone }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    winnerName?: string
    winnerPhone?: string
    winnerImage?: string
}

const props = withDefaults(defineProps<Props>(), {
    winnerName: 'Sanjay Koirala',
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
.winner-card {
    width: var(--card-width, 280px);
    height: var(--card-height, 400px);

    padding: 14px;

    border-radius: 22px;

    background: linear-gradient(180deg,
            #f8d64e 0%,
            #f5c62b 40%,
            #ef9600 100%);

    box-sizing: border-box;

    box-shadow:
        0 10px 25px rgba(0, 0, 0, 0.25),
        inset 0 2px 0 rgba(255, 255, 255, 0.4);
}

.winner-card-inner {
    width: 100%;
    height: 100%;

    border: 3px solid rgba(255, 255, 255, 0.55);
    border-radius: 16px;

    display: flex;
    flex-direction: column;
    align-items: center;

    padding: 26px 18px;

    box-sizing: border-box;
}

.winner-badge {
    background: #d60000;

    color: white;

    font-weight: 900;
    font-size: 2rem;
    line-height: 1;

    padding: 10px 22px;

    margin-bottom: 36px;

    letter-spacing: 1px;
}

.winner-photo {
    width: 150px;
    height: 150px;

    border-radius: 12px;

    overflow: hidden;

    border: 3px solid white;

    margin-bottom: 24px;
}

.winner-photo img {
    width: 100%;
    height: 100%;

    object-fit: cover;
}

.winner-name {
    font-size: 2rem;
    font-weight: 800;

    color: #1e2858;

    text-align: center;

    margin-bottom: 8px;
}

.winner-phone {
    font-size: 1.75rem;
    font-weight: 600;

    color: #1e2858;

    text-align: center;
}
</style>