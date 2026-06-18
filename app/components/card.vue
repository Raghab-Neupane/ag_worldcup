<template>
    <div class="front-card">
        <div class="outer-layer">
            <div class="inner-layer">
                <img src="/logo.png" alt="logo" class="fifa-logo">
            </div>
        </div>
    </div>
</template>

<style scoped>
.front-card {
    width: var(--card-width, 180px);
    height: var(--card-height, 258px);
    display: flex;
    align-items: center;
    justify-content: center;
}

.outer-layer {
    width: 100%;
    height: 100%;
    border-radius: 16px;
    /* the glow */
    box-shadow:
        0 0 14px 4px rgba(255, 176, 32, 0.55),
        0 0 30px 12px rgba(255, 140, 0, 0.35);
    padding: 6px;
    /* creates the visible border thickness */
}

.inner-layer {
    width: 100%;
    height: 100%;
    background: #2b2d42;
    /* dark navy card body */
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.fifa-logo {
    width: 55%;
    object-fit: contain;
    opacity: 0.85;
    /* matches the slightly washed-out look in the design */
}
</style>