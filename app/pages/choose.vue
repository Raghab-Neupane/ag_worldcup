<template>
  <div class="choose-page" :class="{ 'exiting': isExiting }">

    <Background />



    <div v-if="error" class="error-container">
      <div class="error-box">
        <div class="caution-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="80" height="80" fill="none"
            stroke="#FF3B30" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="triangle-svg">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              fill="rgba(255, 59, 48, 0.1)"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div class="error-message-text">
          Error fetching match: {{ error.message }}
        </div>
      </div>
    </div>
    <main v-else class="prediction-container">
      <div class="prediction-container-wrapper">
        <h2 class="group-title">{{ selectedMatch?.stage }}</h2>

        <div class="match-box">
          <div class="team-wrapper team-left">
            <Countrybox :name="selectedMatch?.team1" />
          </div>

          <div class="vs-container">
            <img src="/vs.svg" alt="vs" class="vs-svg" />
          </div>

          <div class="team-wrapper team-right">
            <Countrybox :name="selectedMatch?.team2" />
          </div>
        </div>
      </div>

      <div class="button-wrapper">
        <ViewWinnerButton @click="showWinner" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFetch } from '#app'

const config = useRuntimeConfig()
const { data: selectedMatch, error } = await useFetch<any>(`${config.public.apiBase}/matches/selectedmatch`)
if (selectedMatch.value?.post_id) {
  sessionStorage.setItem('selectedPostId', selectedMatch.value.post_id)
}

import Background from '../components/background.vue'
import Countrybox from '../components/countrybox.vue'
import ViewWinnerButton from '../components/button.vue'
import { goToWinner } from '../router/router'

const isExiting = ref(false)

const showWinner = () => {
  isExiting.value = true
  setTimeout(() => {
    goToWinner()
  }, 800) // Increased from 600ms to 1200ms
}
</script>

<style scoped>
.choose-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
}

/* ========== EXIT ANIMATIONS — SLOWER ========== */

.choose-page.exiting .team-left {
  transform: translateX(-150vw);
  opacity: 0;
}

.choose-page.exiting .team-right {
  transform: translateX(150vw);
  opacity: 0;
}

.choose-page.exiting .vs-container {
  transform: scale(0) rotate(180deg);
  opacity: 0;
}

.choose-page.exiting .group-title {
  transform: translateY(-100px);
  opacity: 0;
}

.choose-page.exiting .button-wrapper {
  transform: translateY(100px) scale(0.8);
  opacity: 0;
}

/* Slower transition: 1.2s instead of 0.6s */
.team-left,
.team-right,
.vs-container,
.group-title,
.button-wrapper {
  transition: all 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* ========== BASE STYLES ========== */

.prediction-container {
  position: relative;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  padding: 33vh 4vw 5vh;
}

.prediction-container-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 1vh;
}

.group-title {
  font-family: 'Work Sans', sans-serif;
  font-weight: 700;
  font-size: clamp(14px, 3.5vw, 70px);
  color: #ffffff;
  margin: 0 0 6vh 0;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.65);
}

.match-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(1rem, 5vw, 20rem);
  width: 100%;
  max-width: 80vw;
  margin: 0 auto 5vh auto;
  box-sizing: border-box;
}

.team-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.vs-container {
  width: clamp(60px, 10vw, 500px);
  height: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
}

.vs-container img {
  height: clamp(80px, 15vw, 800px);
}

.button-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: clamp(2vh, 2vw, 15vh);
  transition: all 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Responsive */
@media (max-width: 1024px) {
  .prediction-container {
    padding-top: 25vh;
  }

  .match-box {
    max-width: 95vw;
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .prediction-container {
    padding-top: 22vh;
    justify-content: flex-start;
  }

  .match-box {
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .vs-container {
    transform: rotate(90deg);
    margin: 1.5rem 0;
    height: auto;
  }

  .vs-container img {
    height: 100px;
  }

  .button-wrapper {
    margin-top: 1rem;
  }

  .choose-page.exiting .team-left {
    transform: translateX(-100vw) translateY(-50px);
  }

  .choose-page.exiting .team-right {
    transform: translateX(100vw) translateY(-50px);
  }
}

/* Error Showcase Styling */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  margin-top: 15vh;
  padding: 20px;
  width: 100%;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}

.caution-icon {
  margin-bottom: 24px;
  filter: drop-shadow(0 4px 12px rgba(255, 59, 48, 0.3));
  animation: errorShake 0.5s ease-in-out;
}

@keyframes errorShake {

  0%,
  100% {
    transform: translateX(0);
  }

  20%,
  60% {
    transform: translateX(-6px);
  }

  40%,
  80% {
    transform: translateX(6px);
  }
}

.triangle-svg {
  display: block;
}

.error-box {
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  width: 100%;
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 32px 24px;
  box-sizing: border-box;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.error-box-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}

.error-title {
  color: #1a202c;
  font-family: 'Work Sans', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
}

.error-message-text {
  color: #e53e3e;
  font-family: 'Work Sans', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  border-top: 1.5px dashed #edf2f7;
  padding-top: 20px;
  width: 100%;
  word-break: break-word;
}
</style>