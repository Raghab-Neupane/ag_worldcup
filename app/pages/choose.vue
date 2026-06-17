<template>
  <div class="choose-page" :class="{ 'exiting': isExiting }">

    <Background />



    <div v-if="error" class="error-container">
      <img src="/error-img.jpg" alt="Error fetching match" class="error-image" />
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
  letter-spacing: -0.5px;
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

}

.group-title {
  font-family: 'Work Sans', sans-serif;
  font-weight: 700;
  font-size: clamp(10px, 2.8vw, 50px);
  color: #ffffff;
  margin: 0 0 6vh 0;
  letter-spacing: -0.5px;
  text-transform: uppercase;
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.65);
}

.match-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(1rem, 7vw, 30rem);
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
  margin-top: 38vh;
  padding: 0;
  width: 90%;
  max-width: 400px;
  aspect-ratio: 3 / 4;
  margin-left: auto;
  margin-right: auto;
}

.error-image {
  width: 100%;
  height: 100%;
  max-width: 100%;
  border-radius: 24px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  border: 4px solid #ffffff;
  object-fit: cover;
  animation: errorFadeIn 0.6s ease-out;
}

@keyframes errorFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive Error Container for Tablets and Mobile */
@media (max-width: 768px) {
  .error-container {
    width: 82%;
    max-width: 340px;
    margin-top: 28vh;
    padding: 0;
  }

  .error-image {
    border-radius: 16px;
    border-width: 3px;
  }
}

/* Responsive Error Container for Large TV screens */
@media (min-width: 1920px) {
  .error-container {
    max-width: 460px;
    margin-top: 32vh;
  }

  .error-image {
    border-radius: 36px;
    border-width: 6px;
    box-shadow: 0 25px 55px rgba(0, 0, 0, 0.35);
  }
}

/* Responsive Error Container for 4K screens */
@media (min-width: 2560px) {
  .error-container {
    max-width: 580px;
    margin-top: 30vh;
  }

  .error-image {
    border-radius: 48px;
    border-width: 8px;
    box-shadow: 0 35px 75px rgba(0, 0, 0, 0.4);
  }
}
</style>