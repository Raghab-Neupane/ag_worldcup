<template>
    <section class="logo-intro">
        <div class="middle-logo">
            <video ref="introVideoEl" src="/intro.mp4" playsinline muted class="intro-video"></video>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { setIntroPlaying } from '~/stores/audio'

const introVideoEl = ref<HTMLVideoElement | null>(null)

onMounted(() => {
    // Tell the audio store that intro is now playing (pause/defer audio)
    setIntroPlaying(true)

    const video = introVideoEl.value
    if (!video) return

    // Start muted so the browser allows playback
    video.muted = true

    const playPromise = video.play()
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            // Fallback: if play fails (rare), we'll try again on user click,
            // but we're not relying on that – we prefer the automatic approach.
        })
    }

    // Once the video starts playing, unmute it after a short delay
    video.addEventListener('playing', () => {
        setTimeout(() => {
            video.muted = false
        }, 200)
    }, { once: true })

    // If the video is already playing (readyState >= 3), unmute immediately
    if (video.readyState >= 3) {
        setTimeout(() => {
            video.muted = false
        }, 200)
    }
})

onUnmounted(() => {
    // Intro ended – allow audio to play
    setIntroPlaying(false)
})
</script>

<style scoped>
/* ... (your existing styles unchanged) ... */
.logo-intro {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.middle-logo {
    position: relative;
    width: 100%;
    height: 100%;
}

.intro-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 2;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 0.6;
        transform: translateX(-50%) scale(1);
    }

    50% {
        opacity: 1;
        transform: translateX(-50%) scale(1.05);
    }
}
</style>