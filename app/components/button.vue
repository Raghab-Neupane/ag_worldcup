<template>
  <button class="winner-btn" :class="{ 'is-pressed': isPressed }" @mousedown="isPressed = true"
    @mouseup="isPressed = false" @mouseleave="isPressed = false" @click="handleClick">
    <!-- Glossy shine overlay -->
    <span class="shine" aria-hidden="true"></span>

    <!-- Inner border highlight -->
    <span class="inner-border" aria-hidden="true"></span>

    <!-- Trophy Icon -->
    <svg class="trophy-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.74 4.39 4.94A5.01 5.01 0 0 0 11 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 0 0 3.61-2.96C19.08 12.74 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
      <circle cx="12" cy="8" r="2.5" fill="#4da6ff" />
    </svg>

    <!-- Text -->
    <span class="btn-text">{{ label }}</span>

    <!-- Arrow Circle -->
    <span class="arrow-circle" aria-hidden="true">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
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
  justify-content: center;
  gap: 18px;

  padding: 16px 24px;
  min-height: 78px;

  border: none;
  border-radius: 999px;

  background: linear-gradient(180deg,
      #5db8ff 0%,
      #3798ff 45%,
      #156dff 100%);

  color: #fff;
  cursor: pointer;
  overflow: hidden;

  font-family: 'Segoe UI', sans-serif;
  font-size: clamp(18px, 1.2vw, 32px);
  font-weight: 900;
  letter-spacing: 1px;
  text-transform: uppercase;

  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.35),
    inset 0 -3px 0 rgba(0, 0, 0, 0.18),
    0 0 0 3px #0d5cff,
    0 0 0 6px rgba(68, 152, 255, 0.18),
    0 12px 25px rgba(0, 0, 0, 0.18);

  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  outline: none;
  -webkit-tap-highlight-color: transparent;
}

/* Glossy top shine */
.shine {
  position: absolute;
  top: 4px;
  left: 4px;
  right: 4px;
  height: 52%;

  border-radius: 999px;

  background:
    radial-gradient(ellipse at center top,
      rgba(255, 255, 255, 0.55) 0%,
      rgba(255, 255, 255, 0.18) 40%,
      rgba(255, 255, 255, 0) 100%);

  pointer-events: none;
}

/* Inner border */
.inner-border {
  position: absolute;
  inset: 4px;

  border-radius: inherit;
  border: 2px solid rgba(255, 255, 255, 0.28);

  pointer-events: none;
}

/* Trophy icon */
.trophy-icon {
  position: relative;
  z-index: 2;

  width: 40px;
  height: 40px;

  flex-shrink: 0;
  fill: #ffffff;

  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
}

/* Text */
.btn-text {
  position: relative;
  z-index: 2;

  color: #fff;
  font-weight: 900;
  letter-spacing: 1px;

  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.18);

  white-space: nowrap;
}

/* White arrow circle */
.arrow-circle {
  position: relative;
  z-index: 2;

  width: 42px;
  height: 42px;

  border-radius: 50%;
  background: #fff;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.12);
}

.arrow-circle svg {
  width: 22px;
  height: 22px;

  fill: #156dff;
}

/* Hover */
.winner-btn:hover {
  transform: translateY(-2px);

  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.4),
    inset 0 -3px 0 rgba(0, 0, 0, 0.18),
    0 0 0 3px #0d5cff,
    0 0 0 8px rgba(68, 152, 255, 0.22),
    0 16px 32px rgba(0, 0, 0, 0.2);
}

/* Active */
.winner-btn:active,
.winner-btn.is-pressed {
  transform: translateY(2px);

  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.25),
    inset 0 -2px 0 rgba(0, 0, 0, 0.15),
    0 0 0 3px #0d5cff,
    0 0 0 6px rgba(68, 152, 255, 0.15);
}

/* Focus */
.winner-btn:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.8);
  outline-offset: 4px;
}

/* Mobile */
@media (max-width: 768px) {
  .winner-btn {
    min-height: 64px;
    padding: 14px 20px;
    gap: 14px;
    font-size: 16px;
  }

  .trophy-icon {
    width: 24px;
    height: 24px;
  }

  .arrow-circle {
    width: 36px;
    height: 36px;
  }

  .arrow-circle svg {
    width: 18px;
    height: 18px;
  }
}
</style>