<!-- <template>
    <section class="logo-intro">
        <div class="middle-logo">
            <video ref="introVideoEl" src="/intro.mp4" loop playsinline muted class="intro-video"></video>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const introVideoEl = ref<HTMLVideoElement | null>(null)

onMounted(() => {
    const video = introVideoEl.value
    if (!video) return

    // 1. Start playing muted (autoplay will work)
    video.muted = true

    // 2. When the video starts playing, unmute after a short delay
    video.addEventListener('playing', () => {
        // Wait a tiny bit, then unmute – this often bypasses the autoplay restriction
        setTimeout(() => {
            video.muted = false
        }, 200)
    }, { once: true }) // only run once

    // 3. If the 'playing' event doesn't fire (e.g. already playing), try unmuting anyway
    if (video.readyState >= 3) { // HAVE_FUTURE_DATA or more
        setTimeout(() => {
            video.muted = false
        }, 200)
    }
})
</script>

<style scoped>
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
</style> -->

<template>
    <section class="logo-intro">
        <div class="middle-logo">
            <video ref="introVideoEl" src="/intro.mp4" playsinline muted class="intro-video"></video>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const introVideoEl = ref<HTMLVideoElement | null>(null)

onMounted(() => {
    const video = introVideoEl.value
    if (!video) return

    // Start muted so the browser allows playback
    video.muted = true

    // Play the video once (no loop)
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
</script>

<style scoped>
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