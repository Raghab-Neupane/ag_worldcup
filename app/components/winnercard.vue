<template>
    <div class="winner-card">
        <div class="winner-card-inner">

            <div class="winner-badge">
                <img src="/Winner_badge.png" alt="Winner Badge">
            </div>

            <div class="winner-photo">
                <img :src="winner.image || '/profile.svg'" @error="handleImageError" alt="Winner">
            </div>

            <div class="winner-name">
                {{ winner.name }}
            </div>

            <div class="winner-phone">
                {{ maskedPhone }}
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
    winnerName?: string
    winnerPhone?: string
    winnerImage?: string
}>()

const config = useRuntimeConfig()

interface Winner {
    name: string
    phone: string
    image: string
}

const localWinner = ref<Winner>({
    name: 'Winner',
    phone: '',
    image: ''
})

const winner = computed(() => {
    let name = props.winnerName || localWinner.value.name
    if (!name || name === 'null' || name === 'undefined' || name === 'Winner') {
        name = 'No correct guess.'
    }

    let image = props.winnerImage || localWinner.value.image
    if (!image || image === 'photo' || image === 'dummy' || image === 'null' || image === 'undefined') {
        image = '/profile.svg'
    }

    return {
        name,
        phone: props.winnerPhone || localWinner.value.phone,
        image
    }
})

const fetchWinner = async () => {
    try {
        const postId = sessionStorage.getItem('selectedPostId')
        const response = await fetch(
            `${config.public.winnersEndpoint}?post_id=${postId}`
        )

        if (!response.ok) {
            throw new Error(
                `Request failed: ${response.status}`
            )
        }

        const data = await response.json()
        const winnerInfo = data && typeof data === 'object' && 'winner' in data ? data.winner : data

        if (winnerInfo && typeof winnerInfo === 'object' && winnerInfo.name && winnerInfo.name !== 'null') {
            localWinner.value = {
                name: winnerInfo.name ?? 'Winner',
                phone: winnerInfo.mobile_number ?? winnerInfo.phone ?? '',
                image: winnerInfo.photo ?? winnerInfo.image ?? ''
            }
        } else {
            localWinner.value = {
                name: 'No correct guess.',
                phone: '',
                image: ''
            }
        }
    } catch (error) {
        console.error(
            'Failed to fetch winner:',
            error
        )
    }
}

const maskedPhone = computed(() => {
    const phone = winner.value.phone

    if (!phone) {
        return ''
    }

    if (phone.length <= 4) {
        return phone
    }

    return (
        phone.slice(0, 2) +
        '*'.repeat(phone.length - 4) +
        phone.slice(-2)
    )
})

const handleImageError = (event: Event) => {
    (event.target as HTMLImageElement).src = '/profile.svg'
}

onMounted(() => {
    fetchWinner()
})
</script>

<style scoped>
.winner-card {
    width: var(--card-width);
    height: var(--card-height);

    padding: calc(var(--card-width) * 0.046);

    border-radius: 22px;

    background:
        linear-gradient(180deg,
            #f8d64e 0%,
            #f5c62b 40%,
            #ef9600 100%);

    box-sizing: border-box;
    box-shadow: 0 0 25px rgba(245, 198, 43, 0.75), 0 0 50px rgba(239, 150, 0, 0.45);
    border: 2px solid rgba(248, 214, 78, 0.85);
}

.winner-card-inner {
    width: 100%;
    height: 100%;

    border-radius: 16px;

    border: 3px solid rgba(255,
            255,
            255,
            0.4);

    display: flex;
    flex-direction: column;
    align-items: center;

    padding: calc(var(--card-width) * 0.08) calc(var(--card-width) * 0.053);

    box-sizing: border-box;
    overflow: hidden;
}

.winner-badge {
    width: calc(100% + 32px);
    margin-top: calc(var(--card-width) * 0.046);
    margin-bottom: calc(var(--card-width) * 0.053);
}

.winner-badge img {
    width: 100%;
    display: block;
}

.winner-photo {
    width: calc(var(--card-width) * 0.4);
    height: calc(var(--card-width) * 0.4);
    overflow: hidden;
    border-radius: 12px;
    border: 3px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    margin-bottom: calc(var(--card-width) * 0.053);
}

.winner-photo img {
    width: 100%;
    height: 100%;

    object-fit: cover;
}

.winner-name {
    font-weight: 700;
    font-size: calc(var(--card-width) * 0.11);
    line-height: 100%;
    text-align: center;
    font-family: 'Work Sans', sans-serif;

    color: rgba(41, 43, 58, 1);
}

.winner-phone {
    margin-top: calc(var(--card-width) * 0.026);

    font-family: 'Work Sans', sans-serif;
    font-size: calc(var(--card-width) * 0.08);
    font-weight: 500;

    color: rgba(41, 43, 58, 1);
}
</style>