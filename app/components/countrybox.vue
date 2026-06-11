<template>
  <div class="country-wrapper">
    <!-- White outlined card matching Figma mockup -->
    <div class="country-card">
      <div class="flag-placeholder">
        <div v-if="flagSvg" class="flag-svg-container" v-html="flagSvg"></div>
        <img v-else-if="customFlagImg" :src="customFlagImg" alt="flag" class="flag-img" />
        <img v-else src="" alt="flag fallback" class="flag-img" />
      </div>
    </div>
    <!-- Country name rendered below card -->
    <h3 class="country-text">{{ name }}</h3>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import * as flags from 'country-flag-icons/string/3x2'

// Initialize the iso countries language
countries.registerLocale(enLocale)

const props = defineProps({
  name: {
    type: String,
    default: 'MEXICO'
  }
})

const countryCode = computed(() => {
  if (!props.name) return null;

  // Convert country name to ISO alpha-2 code
  let code = countries.getAlpha2Code(props.name, 'en')

  // Custom fallbacks for common alternative names that might come from the API
  const lowerName = props.name.toLowerCase()
  if (lowerName === 'usa' || lowerName === 'united states') code = 'US'
  if (lowerName === 'uk' || lowerName === 'england') code = 'GB'
  if (lowerName === 'south korea') code = 'KR'
  // Register Curaçao mapping
  if (lowerName === 'curacao' || lowerName === 'curaçao') code = 'CW'

  return code
})

const flagSvg = computed(() => {
  const code = countryCode.value
  if (code && (flags as any)[code]) {
    return (flags as any)[code]
  }
  return null
})

const customFlagImg = computed(() => {
  const code = countryCode.value
  // Manually added asset because CW is missing from country-flag-icons
  if (code === 'CW') {
    return '/flags/cw.svg'
  }
  return null
})
</script>

<style scoped>
/* Wrapper aligning card and name vertically */
.country-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  /* reduced vertical gap */
  flex: 0 1 auto;
}

/* Country Flag Card - stylized as white outlined glassmorphic card */
.country-card {
  width: clamp(160px, 18vw, 400px);
  aspect-ratio: 3 / 2;
  border: 4px solid #ffffff;
  border-radius: 18px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.04);
  box-shadow:
    0 2px 18px rgba(0, 0, 0, 0.7),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  position: relative;
  transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.25s ease;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.country-card:hover {
  transform: scale(1.05);
  box-shadow:
    0 16px 35px rgba(0, 0, 0, 0.8),
    inset 0 0 25px rgba(255, 255, 255, 0.2),
    0 0 15px rgba(255, 255, 255, 0.3);
}

/* Flag placeholder inside the card */
.flag-placeholder {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 0%, rgba(0, 150, 255, 0.1) 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.flag-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: opacity 0.3s ease-in-out;
}

/* Country Name styling underneath card using user's new attributes */
.country-text {
  font-family: 'Work Sans', sans-serif;
  font-weight: 500;

  font-style: normal;
  font-size: clamp(18px, 2.5vw, 38px);
  line-height: 1.2;
  text-align: center;
  text-transform: uppercase;
  color: #ffffff;
  text-shadow: 0 3px 8px rgba(0, 0, 0, 0.65);
  margin: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .country-card {
    border-width: 2px;
    width: clamp(120px, 30vw, 180px);
  }

  .country-wrapper {
    gap: 0.5rem;
  }
}

.flag-svg-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flag-svg-container :deep(svg) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>