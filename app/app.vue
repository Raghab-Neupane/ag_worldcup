<template>
  <div>
    <NuxtPage />
    <!-- Only show audio control when intro is NOT playing -->
    <AudioControl v-if="!isIntroPlaying" />
  </div>
</template>

<script setup lang="ts">
import { isIntroPlaying } from '~/stores/audio'
import AudioControl from '~/components/AudioControl.vue'
</script>