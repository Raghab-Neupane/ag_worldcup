<template>
    <section class="winner-page">
        <Background />

        <div class="scroll-div">
            <h5></h5>
        </div>
    </section>
</template>

<script setup lang="ts">
import Background from '../components/background.vue'
</script>

<style scoped>
.winner-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.scroll-div {
  width: 526.92px;
  height: 152.07px;
  background: linear-gradient(180deg, #FFE36C 0%, #FFC200 33%, #F5A800 66%, #E58200 100%);
  border: 8px solid #ffffff;
  border-radius: 40px;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.5), 
    inset 0 4px 10px rgba(255, 255, 255, 0.4);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
}
</style>