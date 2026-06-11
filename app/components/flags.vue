<!-- components/FlagBunting.vue -->
<template>
    <div class="flag-bunting">
        <div class="bunting-string"></div>
        <div class="flags-container">
            <div v-for="(flag, i) in flags" :key="i" class="flag-pennant" :style="{ animationDelay: `${i * 0.15}s` }">
                <div class="flag-face" :style="{ background: flag.gradient }">
                    <!-- Flag patterns using CSS -->
                    <div v-if="flag.pattern === 'cross'" class="pattern-cross" :style="{ color: flag.accent }"></div>
                    <div v-if="flag.pattern === 'stripes-v'" class="pattern-stripes-v"
                        :style="{ '--c1': flag.colors[0], '--c2': flag.colors[1], '--c3': flag.colors[2] }"></div>
                    <div v-if="flag.pattern === 'stripes-h'" class="pattern-stripes-h"
                        :style="{ '--c1': flag.colors[0], '--c2': flag.colors[1], '--c3': flag.colors[2] }"></div>
                    <div v-if="flag.pattern === 'sun'" class="pattern-sun" :style="{ color: flag.accent }"></div>
                    <div v-if="flag.pattern === 'union'" class="pattern-union"></div>
                    <div v-if="flag.pattern === 'circle'" class="pattern-circle" :style="{ color: flag.accent }"></div>
                    <div v-if="flag.pattern === 'diamond'" class="pattern-diamond" :style="{ color: flag.accent }">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const flags = [
    { gradient: 'linear-gradient(90deg, #fff 33%, #fff 33%, #fff 66%, #fff 66%)', pattern: 'cross', accent: '#cf142b', colors: [] }, // England
    { gradient: 'linear-gradient(90deg, #239f40 33%, #fff 33%, #fff 66%, #da0000 66%)', pattern: 'emblem', accent: '#da0000', colors: ['#239f40', '#fff', '#da0000'] }, // Iran
    { gradient: 'linear-gradient(90deg, #aa151b 25%, #f1bf00 25%, #f1bf00 75%, #aa151b 75%)', pattern: 'emblem', accent: '#aa151b', colors: ['#aa151b', '#f1bf00', '#aa151b'] }, // Spain
    { gradient: 'linear-gradient(90deg, #fff 33%, #0038a8 33%, #0038a8 66%, #fff 66%)', pattern: 'sun', accent: '#fcd116', colors: ['#fff', '#0038a8', '#fff'] }, // Uruguay
    { gradient: 'linear-gradient(180deg, #75aadb 33%, #fff 33%, #fff 66%, #75aadb 66%)', pattern: 'sun', accent: '#fcd116', colors: ['#75aadb', '#fff', '#75aadb'] }, // Argentina
    { gradient: 'linear-gradient(90deg, #012169 25%, #fff 25%, #fff 75%, #012169 75%)', pattern: 'union', accent: '#c8102e', colors: ['#012169', '#fff', '#012169'] }, // Australia
    { gradient: 'linear-gradient(180deg, #009739 33%, #f1c40f 33%, #f1c40f 66%, #002776 66%)', pattern: 'diamond', accent: '#fff', colors: ['#009739', '#f1c40f', '#002776'] }, // Brazil
    { gradient: 'linear-gradient(90deg, #000 33%, #ffd700 33%, #ffd700 66%, #ed2939 66%)', pattern: 'stripes-v', accent: '#000', colors: ['#000', '#ffd700', '#ed2939'] }, // Belgium
]
</script>

<style scoped>
.flag-bunting {
    position: relative;
    width: 100%;
    height: 120px;
    overflow: hidden;
}

.bunting-string {
    position: absolute;
    top: 0;
    left: -5%;
    width: 110%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #c0c0c0 10%, #c0c0c0 90%, transparent);
    transform: rotate(-1deg);
    z-index: 2;
}

.flags-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 8px;
    padding-top: 1px;
    transform: rotate(-2deg);
}

.flag-pennant {
    width: 60px;
    height: 80px;
    position: relative;
    transform-origin: top center;
    animation: sway 3s ease-in-out infinite;
}

.flag-face {
    width: 100%;
    height: 100%;
    clip-path: polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%);
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* England - St George's Cross */
.pattern-cross::before,
.pattern-cross::after {
    content: '';
    position: absolute;
    background: currentColor;
}

.pattern-cross::before {
    width: 100%;
    height: 20%;
    top: 40%;
    left: 0;
}

.pattern-cross::after {
    width: 20%;
    height: 100%;
    top: 0;
    left: 40%;
}

/* Vertical stripes */
.pattern-stripes-v {
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, var(--c1) 33%, var(--c2) 33%, var(--c2) 66%, var(--c3) 66%);
}

/* Horizontal stripes */
.pattern-stripes-h {
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, var(--c1) 33%, var(--c2) 33%, var(--c2) 66%, var(--c3) 66%);
}

/* Sun of May */
.pattern-sun::before {
    content: '☀';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 28px;
    color: currentColor;
}

/* Simplified Union Jack pattern */
.pattern-union {
    width: 100%;
    height: 100%;
    background:
        linear-gradient(90deg, transparent 40%, #c8102e 40%, #c8102e 60%, transparent 60%),
        linear-gradient(180deg, transparent 40%, #c8102e 40%, #c8102e 60%, transparent 60%),
        linear-gradient(45deg, transparent 45%, #fff 45%, #fff 55%, transparent 55%),
        linear-gradient(-45deg, transparent 45%, #fff 45%, #fff 55%, transparent 55%);
    background-color: #012169;
}

/* Circle (Japan-style) */
.pattern-circle::before {
    content: '';
    position: absolute;
    width: 50%;
    height: 50%;
    background: currentColor;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

/* Diamond (Brazil-style) */
.pattern-diamond::before {
    content: '';
    position: absolute;
    width: 60%;
    height: 60%;
    background: currentColor;
    transform: translate(-50%, -50%) rotate(45deg);
    top: 50%;
    left: 50%;
}

@keyframes sway {

    0%,
    100% {
        transform: rotate(-3deg);
    }

    50% {
        transform: rotate(3deg);
    }
}
</style>