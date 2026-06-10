<template>
  <div class="country-wrapper">
    <!-- White outlined card matching Figma mockup -->
    <div class="country-card">
      <div class="flag-placeholder">
        <!-- Renders image if flagSrc is passed, otherwise hides it gracefully -->
        <img 
          :src="flagSrc || ''" 
          :alt="name || 'Country flag'" 
          class="flag-img" 
          :style="{ opacity: flagSrc ? 1 : 0 }" 
        />
      </div>
    </div>
    <!-- Country name rendered below card -->
    <span class="country-name">{{ name || 'COUNTRY' }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps({
  flagSrc: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: 'COUNTRY'
  }
})
</script>

<style scoped>
/* Wrapper aligning card and name vertically */
.country-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  flex: 0 1 auto;
}

/* Country Flag Card - stylized as white outlined glassmorphic card */
.country-card {
  width: clamp(170px, 18vw, 250px);
  aspect-ratio: 3 / 2;
  border: 4px solid #ffffff;
  border-radius: 18px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.04);
  box-shadow: 
    0 12px 28px rgba(0, 0, 0, 0.7),
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

/* Country Name styling underneath card */
.country-name {
  font-family: 'Kanit', sans-serif;
  font-weight: 800;
  font-size: clamp(1.1rem, 1.8vw, 1.5rem);
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  text-shadow: 0 3px 8px rgba(0, 0, 0, 0.65);
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .country-card {
    border-width: 3px;
  }
}
</style>