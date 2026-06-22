<template>
    <button @click="toggle" class="audio-toggle" :title="isPlaying ? 'Pause music' : 'Play music'">
        <!-- Unmuted (playing) – speaker with sound waves -->
        <svg v-if="isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 10V14H7L12 19V5L7 10H3Z" stroke="white" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            <path d="M16 8C17.5 9.5 17.5 14.5 16 16" stroke="white" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            <path d="M19 5C22 8 22 16 19 19" stroke="white" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
        </svg>

        <!-- Muted (paused) – speaker with cross -->
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 10V14H7L12 19V5L7 10H3Z" stroke="white" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            <path d="M18 9L21 12M21 12L24 15M21 12L18 15M21 12L24 9" stroke="white" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    </button>
</template>

<script setup lang="ts">
import { isPlaying, toggleTechno } from '~/stores/audio'

const toggle = () => {
    toggleTechno() // now also triggers Fire
}
</script>

<style scoped>
/* same as before */
.audio-toggle {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: white;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 9999;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    transition: transform 0.2s, background 0.2s;
    user-select: none;
    padding: 0;
}

.audio-toggle:hover {
    transform: scale(1.08);
    background: rgba(0, 0, 0, 0.8);
}

.audio-toggle:active {
    transform: scale(0.92);
}

.audio-toggle svg {
    display: block;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
}

@media (max-width: 640px) {
    .audio-toggle {
        bottom: 16px;
        right: 16px;
        width: 44px;
        height: 44px;
    }

    .audio-toggle svg {
        width: 20px;
        height: 20px;
    }
}
</style>