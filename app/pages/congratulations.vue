<template>
    <section class="congratulations-page">
        <Background />

        <div class="congrats-container">
            <div class="congrats-title-wrapper">
                <img src="/congratulations.png">
            </div>

            <div class="winner-profile">
                <!-- <img :src="winnerImage" alt="winner profile" class="profile-img"> -->
            </div>

            <div class="winner-details">
                <h2 class="winner-name">{{ winnerName }}</h2>
                <h3 class="winner-phone">{{ winnerPhone }}</h3>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import Background from '../components/background.vue'

const route = useRoute()
const winnerName = computed(() => route.query.name || 'Sanjay Koirala')
const winnerPhone = computed(() => {
    const rawPhone = (route.query.phone as string) || '98******67'
    if (rawPhone === '98******67') return rawPhone
    const p = rawPhone.trim()
    if (p.length <= 4) return p
    return p.slice(0, 2) + '*'.repeat(p.length - 4) + p.slice(-2)
})
const winnerImage = computed(() => '/profile.png') // default profile picture
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
    padding-top: 140px;
    /* Offset to not cover page title from Background.vue */
    box-sizing: border-box;
}

.congrats-container {
    position: relative;
    z-index: 5;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 24px;
    width: 90vw;
    max-width: 1200px;
    padding: 20px;
    box-sizing: border-box;
}

.congrats-title-wrapper {
    display: inline-flex;
    justify-content: center;
    align-items: center;

    padding: 20px 48px;
}

.congrats-title-wrapper img {
    height: 180px;
}


.winner-profile {
    width: 180px;
    height: 180px;
    border-radius: 20px;
    border: 3px solid #ffffff;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #111;
}

.profile-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.winner-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.winner-name {
    font-family: 'Work Sans', sans-serif;
    font-size: clamp(32px, 4.5vw, 80px);
    font-weight: 700;
    color: #ffffff;
    margin: 0;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}

.winner-phone {
    font-family: 'Work Sans', sans-serif;
    font-size: clamp(24px, 3.5vw, 60px);
    font-weight: 600;
    color: #ffffff;
    opacity: 0.9;
    margin: 0;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}

/* LAPTOPS WITH SHORTER SCREEN HEIGHTS (e.g. MacBook 13") */
@media (max-height: 900px) and (min-width: 1024px) {
    .congratulations-page {
        padding-top: 90px;
    }

    .congrats-container {
        gap: 16px;
    }

    .congrats-title-wrapper {
        padding: 10px 24px;
    }

    .congrats-title-wrapper img {
        height: 120px;
    }

    .winner-profile {
        width: 140px;
        height: 140px;
        border-width: 3px;
        border-radius: 16px;
    }

    .winner-name {
        font-size: 36px;
    }

    .winner-phone {
        font-size: 26px;
    }
}

/* RESPONSIVE SCALING FOR LAPTOPS TO BIG TV SCREENS */
@media (min-width: 1200px) {
    .congrats-container {
        gap: 36px;
    }

    .winner-profile {
        width: 240px;
        height: 240px;
        border-width: 4px;
        border-radius: 28px;
    }

    .congrats-title-wrapper img {
        height: 190px;
    }
}

@media (min-width: 1920px) {
    .congrats-container {
        gap: 48px;
    }

    .winner-profile {
        width: 320px;
        height: 320px;
        border-width: 6px;
        border-radius: 36px;
    }

    .congrats-title-wrapper img {
        height: 250px;
    }
}

@media (min-width: 2560px) {
    .congrats-container {
        gap: 64px;
    }

    .winner-profile {
        width: 400px;
        height: 400px;
        border-width: 8px;
        border-radius: 44px;
    }

    .congrats-title-wrapper img {
        height: 320px;
    }
}
</style>