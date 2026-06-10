<script setup lang="ts">
await navigateTo('/choose')
</script>

<template>
  <div class="redirecting">
    Redirecting to prediction dashboard...
  </div>
</template>

<style scoped>
.redirecting {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  color: #ffffff;
  font-family: sans-serif;
  font-size: 1.2rem;
}
</style>
