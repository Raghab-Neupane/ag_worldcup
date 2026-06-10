<template>
  <div class="choose-page">
    <!-- Background stadium canvas layer -->
    <Background />

    <!-- Predictor page container -->
    <main class="prediction-container">
      <h2 class="group-title">GROUP A</h2>

      <div class="match-box">
        <Countrybox />

        <div class="vs-container">
          <img src="/vs.svg" alt="vs" class="vs-svg" />
        </div>

        <Countrybox />
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
  margin-top: 50px;
  align-items: center;
  justify-content: center;
  gap: clamp(1.5rem, 10vw, 13.5rem);
  /* Increased gap to push cards away from the center VS icon */
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

.vs-container img {
  height: 290px;
}

/* Winner CTA Button Centering Layout */
.button-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 59px;
}

/* LAPTOPS WITH SHORTER SCREEN HEIGHTS (e.g. MacBook 13") */
@media (max-height: 900px) and (min-width: 1024px) {
  .prediction-container {
    padding-top: 140px;
  }

  .group-title {
    font-size: 48px;
    padding-bottom: 12px;
    margin-bottom: 1rem;
  }

  .match-box {
    margin-top: 20px;
    margin-bottom: 1.5rem;
  }

  .vs-container img {
    height: 220px;
  }

  .button-wrapper {
    margin-top: 20px;
  }
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

/* RESPONSIVE SCALING FOR LAPTOPS TO BIG TV SCREENS */
@media (min-width: 1200px) {
  .prediction-container {
    max-width: 1400px;
    padding-top: 280px;
  }

  .group-title {
    font-size: 80px;
  }

  .vs-container img {
    height: 350px;
  }

  .match-box {
    margin-top: 60px;
    margin-bottom: 5rem;
  }
}

@media (min-width: 1920px) {
  .prediction-container {
    max-width: 1800px;
    padding-top: 320px;
  }

  .group-title {
    font-size: 110px;
  }

  .vs-container img {
    height: 460px;
  }

  .match-box {
    margin-top: 80px;
    margin-bottom: 7rem;
  }
}

@media (min-width: 2560px) {
  .prediction-container {
    max-width: 2400px;
    padding-top: 400px;
  }

  .group-title {
    font-size: 150px;
  }

  .vs-container img {
    height: 600px;
  }

  .match-box {
    margin-top: 100px;
    margin-bottom: 9rem;
  }
}
</style>
