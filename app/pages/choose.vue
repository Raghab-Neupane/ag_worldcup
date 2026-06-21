<template>
  <div class="choose-page" :class="{ 'exiting': isExiting }">

    <Transition name="fade">
      <IntroTransition v-if="showIntro" />
    </Transition>

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
            <img src="/animations/spark1.gif" class="ani1" alt="">
            <img src="/animations/spark2.gif" class="ani2" alt="">
            <img src="/animations/electric.gif" class="ani3" alt="">
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
import { ref, onMounted } from 'vue'
import { useFetch } from '#app'

const config = useRuntimeConfig()
const { data: selectedMatch, error } = await useFetch<any>(`${config.public.apiBase}/matches/selectedmatch`)
if (selectedMatch.value?.post_id) {
  sessionStorage.setItem('selectedPostId', selectedMatch.value.post_id)
}

import Background from '../components/background.vue'
import IntroTransition from '../components/transition.vue'
import Countrybox from '../components/countrybox.vue'
import ViewWinnerButton from '../components/button.vue'
import { goToWinner } from '../router/router'

const isExiting = ref(false)
const showIntro = ref(true)

onMounted(() => {
  setTimeout(() => {
    showIntro.value = false
  }, 1000)
})

const showWinner = () => {
  isExiting.value = true
  setTimeout(() => {
    goToWinner()
  }, 800)
}
</script>

<style scoped>
/* ── Global reset / base ── */
.choose-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

/* ── Fade transition for Intro ── */
.fade-leave-active {
  transition: opacity 2.5s ease-in-out;
}

.fade-leave-to {
  opacity: 0;
}

/* ── EXIT ANIMATIONS ── */
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
  transform: translateY(100px);
  letter-spacing: -0.5px;
  opacity: 0;
}

.choose-page.exiting .button-wrapper {
  transform: translateY(100px) scale(0.8);
  opacity: 0;
}

.team-left,
.team-right,
.vs-container,
.group-title,
.button-wrapper {
  transition: all 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* ── MAIN CONTAINER ── */
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
  padding: 28vh 4vw 5vh;
  /* base – will be overridden by responsive */
  opacity: 0;
  animation: fadeInContent 0.8s ease-out forwards;
  animation-delay: 1.6s;
}

@keyframes fadeInContent {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── TITLE ── */
.group-title {
  font-family: 'Work Sans', sans-serif;
  font-weight: 700;
  font-size: clamp(1.2rem, 3.2vw, 4.5rem);
  color: #ffffff;
  margin: 0 0 5vh 0;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.65);
  text-align: center;
}

/* ── MATCH BOX ── */
.match-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(1.5rem, 8vw, 12rem);
  width: 100%;
  max-width: 85vw;
  margin: 0 auto 4vh auto;
  box-sizing: border-box;
  flex-wrap: wrap;
  /* allows stacking on small screens */
}

/* ── TEAM WRAPPERS ── */
.team-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 1 auto;
  min-width: 0;
  /* prevent overflow */
}

/* ── VS CONTAINER ── */
.vs-container {
  position: relative;
  width: clamp(80px, 12vw, 240px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  aspect-ratio: 1 / 1;
}

.vs-svg {
  position: relative;
  z-index: 2;
  width: 100%;
  height: auto;
  animation: pulse 1.5s ease-in-out infinite;
}

.ani1,
.ani2,
.ani3 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  pointer-events: none;
  mix-blend-mode: screen;
  opacity: 0.8;
}

.ani1 {
  width: 170%;
  height: auto;
}

.ani2 {
  width: 260%;
  top: 30%;
  left: 90%;
}

.ani3 {
  width: 150%;
  top: 30%;
  left: 90%;
}

/* ── BUTTON ── */
.button-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: clamp(1.5rem, 4vh, 4rem);
  transition: all 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* ── RESPONSIVE PADDING & STACKING ── */
@media (max-width: 1024px) {
  .prediction-container {
    padding-top: 20vh;
  }

  .match-box {
    max-width: 95vw;
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .prediction-container {
    padding-top: 15vh;
    justify-content: flex-start;
  }

  .match-box {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .vs-container {
    transform: rotate(90deg);
    margin: 1.5rem 0;
    width: clamp(80px, 20vw, 140px);
  }

  .vs-container .vs-svg {
    width: 100%;
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

@media (min-width: 1400px) {
  .prediction-container {
    padding-top: 30vh;
  }

  .match-box {
    max-width: 70vw;
    gap: 10vw;
  }

  .group-title {
    font-size: clamp(2.5rem, 3.5vw, 5rem);
  }
}

@media (min-width: 2560px) {
  .prediction-container {
    padding-top: 28vh;
  }

  .match-box {
    max-width: 60vw;
    gap: 12vw;
  }

  .group-title {
    font-size: clamp(3.5rem, 4vw, 6rem);
    margin-bottom: 6vh;
  }

  .vs-container {
    width: clamp(150px, 14vw, 300px);
  }
}

/* ── ERROR CONTAINER – FULLY RESPONSIVE ── */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  margin: 0 auto;
  padding: 0;
  width: min(80%, 400px);
  aspect-ratio: 3 / 4;
  margin-top: clamp(20vh, 30vh, 35vh);
}

.error-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  border: 2px solid #ffffff;
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

/* Error container – tablet */
@media (max-width: 768px) {
  .error-container {
    width: min(75%, 340px);
    margin-top: 22vh;
  }

  .error-image {
    border-radius: 16px;
    border-width: 3px;
  }
}

/* Error container – large screens (TV) */
@media (min-width: 1920px) {
  .error-container {
    width: min(60%, 460px);
    margin-top: 28vh;
  }

  .error-image {
    border-radius: 36px;
    border-width: 6px;
    box-shadow: 0 25px 55px rgba(0, 0, 0, 0.35);
  }
}

/* Error container – 4K */
@media (min-width: 2560px) {
  .error-container {
    width: min(55%, 580px);
    margin-top: 25vh;
  }

  .error-image {
    border-radius: 48px;
    border-width: 8px;
    box-shadow: 0 35px 75px rgba(0, 0, 0, 0.4);
  }
}

/* Error container – 8K */
@media (min-width: 5120px) {
  .error-container {
    width: min(45%, 700px);
    margin-top: 22vh;
  }

  .error-image {
    border-radius: 64px;
    border-width: 10px;
    box-shadow: 0 45px 95px rgba(0, 0, 0, 0.5);
  }
}

/* ── UTILITY ANIMATIONS ── */
@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.12);
  }

  100% {
    transform: scale(1);
  }
}
</style>