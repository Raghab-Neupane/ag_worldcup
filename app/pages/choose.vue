<template>
  <div class="choose-page">
    <!-- Background stadium canvas layer -->
    <Background />

    <!-- Predictor page container -->
    <main class="prediction-container">
      <h2 class="group-title">GROUP A</h2>

      <div class="match-box">
        <Countrybox name="MEXICO" flagSrc="" />

        <div class="vs-container">
          <img src="/vs.svg" alt="vs" class="vs-svg" />
        </div>

        <Countrybox name="SOUTH AFRICA" flagSrc="" />
      </div>

      <!-- View Winner CTA Button -->
      <div class="button-wrapper">
        <ViewWinnerButton @click="showWinner" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Background from '../components/background.vue'
import Countrybox from '../components/countrybox.vue'
import ViewWinnerButton from '../components/button.vue'
import { goToWinner } from '../router/router.vue'

const showWinner = () => {
  goToWinner()
}
</script>

<style scoped>
.choose-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
}

/* Prediction container alignment details */
.prediction-container {
  position: relative;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 260px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
  padding-bottom: 2rem;
}

/* GROUP A Title Header */
.group-title {
  font-family: 'Work Sans', sans-serif;
  padding-top: 20px;
  font-weight: 700;
  font-size: 60px;
  color: #ffffff;
  margin: 0 0 1.5rem 0;
  letter-spacing: 0px;
  text-transform: uppercase;
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.65);
  padding-bottom: 24px;
}

/* Flex row containing cards and VS graphic */
.match-box {
  display: flex;
  margin-top:50px;
  align-items: center;
  justify-content: center;
  gap: clamp(1.5rem, 10vw, 13.5rem); /* Increased gap to push cards away from the center VS icon */
  width: 100%;
  padding: 0 1.5rem;
  box-sizing: border-box;
  margin-bottom: 3.5rem;
}

/* VS Graphic Placement Container */
.vs-container {
  width: 170px;
  height: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
  
}

.vs-container img{
    height: 290px;
}


/* Winner CTA Button Centering Layout */
.button-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 59px;
}

@media (max-width: 600px) {
  .match-box {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .vs-container {
    transform: rotate(90deg);
    margin: 0.5rem 0;
  }
}
</style>
