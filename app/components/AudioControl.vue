<template>
    <div class="controls-wrapper" v-if="!isIntroPlaying">
        <!-- Home Button -->
        <button @click="goHome" class="control-btn home-btn" title="Go to Home">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12L12 3L21 12" stroke="white" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                <path d="M5 10V20H19V10" stroke="white" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                <path d="M10 20V14H14V20" stroke="white" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
            </svg>
        </button>

        <!-- Audio Toggle Button -->
        <button @click="toggle" class="control-btn audio-btn" :title="isPlaying ? 'Pause music' : 'Play music'">
            <svg v-if="isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M3 10V14H7L12 19V5L7 10H3Z" stroke="white" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                <path d="M16 8C17.5 9.5 17.5 14.5 16 16" stroke="white" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                <path d="M19 5C22 8 22 16 19 19" stroke="white" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 10V14H7L12 19V5L7 10H3Z" stroke="white" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                <path d="M18 9L21 12M21 12L24 15M21 12L18 15M21 12L24 9" stroke="white" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </button>
    </div>
</template>

<script setup lang="ts">
import { isPlaying, toggleTechno, isIntroPlaying } from '~/stores/audio'

const toggle = () => {
    toggleTechno()
}

const goHome = () => {
    // Navigate to the home URL
    if (typeof window !== 'undefined') {
        window.location.href = 'http://localhost:3000'
    }
}
</script>

<style scoped>
.controls-wrapper {
    position: fixed;
    bottom: 24px;
    right: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 9999;
}

.control-btn {
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
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    transition: transform 0.2s, background 0.2s;
    user-select: none;
    padding: 0;
}

.control-btn:hover {
    transform: scale(1.08);
    background: rgba(0, 0, 0, 0.8);
}

.control-btn:active {
    transform: scale(0.92);
}

.control-btn svg {
    display: block;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
}

@media (max-width: 640px) {
    .controls-wrapper {
        bottom: 16px;
        right: 16px;
        gap: 10px;
    }

    .control-btn {
        width: 44px;
        height: 44px;
    }

    .control-btn svg {
        width: 20px;
        height: 20px;
    }
}
</style>