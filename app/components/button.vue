<template>
  <button
    class="winner-btn"
    :class="{ 'is-pressed': isPressed }"
    @mousedown="isPressed = true"
    @mouseup="isPressed = false"
    @mouseleave="isPressed = false"
    @click="handleClick"
  >
    <!-- Glossy shine overlay -->
    <span class="shine" aria-hidden="true"></span>
    
    <!-- Inner border highlight -->
    <span class="inner-border" aria-hidden="true"></span>

    <!-- Trophy Icon -->
    <svg class="trophy-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.74 4.39 4.94A5.01 5.01 0 0 0 11 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 0 0 3.61-2.96C19.08 12.74 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
      <circle cx="12" cy="8" r="2.5" fill="#4da6ff"/>
    </svg>

    <!-- Text -->
    <span class="btn-text">{{ label }}</span>

    <!-- Arrow Circle -->
    <span class="arrow-circle" aria-hidden="true">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
      </svg>
    </span>
  </button>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: 'VIEW WINNER'
  }
})

const emit = defineEmits(['click'])

const isPressed = ref(false)

const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
.winner-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 16px;
  padding: 18px 32px 18px 28px;
  background: linear-gradient(180deg, #4da6ff 0%, #1a75ff 40%, #0066ff 100%);
  border: none;
  border-radius: 50px;
  color: #ffffff;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 
    0 8px 0 #0a0a0a,
    0 12px 20px rgba(0, 0, 0, 0.4);
  transition: all 0.15s ease;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

/* Glossy shine effect */
.shine {
  position: absolute;
  top: 0;
  left: -10%;
  right: -10%;
  height: 55%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.45) 0%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  border-radius: 50px 50px 40% 40% / 30px 30px 100% 100%;
  pointer-events: none;
}

/* Inner highlight border */
.inner-border {
  position: absolute;
  inset: 3px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-radius: 50px;
  pointer-events: none;
}

/* Trophy icon */
.trophy-icon {
  position: relative;
  z-index: 1;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  fill: #ffffff;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

/* Center text */
.btn-text {
  position: relative;
  z-index: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Arrow circle */
.arrow-circle {
  position: relative;
  z-index: 1;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 4px;
}

.arrow-circle svg {
  width: 18px;
  height: 18px;
  fill: #0066ff;
}

/* Hover state */
.winner-btn:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 10px 0 #0a0a0a,
    0 14px 24px rgba(0, 0, 0, 0.45);
  background: linear-gradient(180deg, #5cb3ff 0%, #2a85ff 40%, #1a75ff 100%);
}

/* Active/pressed state */
.winner-btn:active,
.winner-btn.is-pressed {
  transform: translateY(6px);
  box-shadow: 
    0 2px 0 #0a0a0a,
    0 4px 8px rgba(0, 0, 0, 0.3);
}

/* Focus state for accessibility */
.winner-btn:focus-visible {
  outline: 3px solid #0066ff;
  outline-offset: 4px;
}
</style>