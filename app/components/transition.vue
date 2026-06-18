<template>
    <section class="backgroundOverlay">
        <div class="background">
            <div class="bg-img">
                <img class="bg" src="/stadium.webp" alt="stadium">
            </div>

            <div class="left-logo">
                <img src="/logo.png" alt="logo">
            </div>
            <div class="tittle-wrapper">
                <div class="header">
                    <img src="/pagetittle.png">
                </div>
            </div>
            <img src="/AGLogo.png" class="AGLogo" alt="">
            <div class="righttop-white-overlay">

                <img src="/rtoverlay.png" alt="">
            </div>

            <div class="leftbottom-white-overlay">
                <img src="/ltoverlay.png" alt="">
            </div>
        </div>
    </section>
</template>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:ital,wght@1,900&display=swap');

html,
body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #020712;
    font-family: 'Kanit', sans-serif;
}

.backgroundOverlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    z-index: 999;
    background-color: #020712;
}

.background {
    position: relative;
    width: 100%;
    height: 100%;
}

/* Stadium background image styling with custom vignette & dark gradient overlays */
.bg-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.bg-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.bg-img::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* Radial vignette to darken edges & add dramatic center lighting, plus linear dark fade to grass */
    background:
        radial-gradient(circle at 50% 30%, rgba(3, 16, 38, 0.4) 0%, rgba(1, 5, 13, 0.85) 80%),
        linear-gradient(to bottom, rgba(1, 5, 13, 0.8) 0%, transparent 30%, transparent 60%, rgba(1, 5, 13, 0.95) 100%);
    z-index: 2;
}

.AGLogo {
    position: absolute;
    width: 200px;
    height: auto;
    top: 30px;
    right: 30px;
    z-index: 100;
}

/* White halftone dot matrices positioning and blend styling */
.righttop-white-overlay {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 3;
    pointer-events: none;
    opacity: 2;
}

.righttop-white-overlay img {
    width: clamp(450px, 20vw, 550px);
    height: auto;
    display: block;
}

.leftbottom-white-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 3;
    pointer-events: none;
    opacity: 0.35;
}

.leftbottom-white-overlay img {
    width: clamp(150px, 20vw, 350px);
    height: auto;
    display: block;
}

.tittle-wrapper {
    position: absolute;
    top: 50vh;
    transform: translateY(-50%);
    /* Start at center */
    width: 100%;
    left: 0;
    z-index: 10;
    animation: titleScrollUp 2.2s cubic-bezier(0.25, 1, 0.3, 1) forwards;
}

/* Logo placement top left */
.left-logo {
    position: absolute;
    top: clamp(1rem, 3vw, 2.5rem);
    left: clamp(1rem, 3vw, 2.5rem);
    z-index: 10;
}

.left-logo img {
    height: auto;
    width: clamp(50px, 6vw, 300px);
    /* Scales linearly on huge TVs */
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
}

/* Header container and centered glow effect */
.header {
    position: relative;
    /* Change to relative within tittle-wrapper */
    width: 100%;
    text-align: center;
    padding: 0 1.5rem;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
}

.header img {
    width: 100%;
    max-width: clamp(350px, 45vw, 2500px);
    /* Scales to fill 45% of an 8K screen */
    height: auto;
    display: block;
    filter: drop-shadow(-4px 4px 8px rgba(0, 0, 0, 0.5));
}

/* Atmospheric center aura glow behind the text */
.header::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: clamp(250px, 40vw, 2000px);
    height: clamp(80px, 12vw, 800px);
    background: radial-gradient(circle, rgba(0, 150, 255, 0.35) 0%, rgba(0, 100, 255, 0.08) 55%, transparent 75%);
    filter: blur(30px);
    z-index: -1;
    pointer-events: none;
}

@keyframes titleScrollUp {
    0% {
        top: 50vh;
        transform: translateY(-50%) scale(1.15);
    }

    25% {
        top: 50vh;
        transform: translateY(-50%) scale(1.15);
    }

    100% {
        top: 11vh;
        transform: translateY(0) scale(1);
    }
}
</style>
