<template>
  <div style="display: flex; flex-direction: column; justify-content: center; height: 100%;">
    <h1 style="text-align: center; padding: 40px">When The Global Economy Went Off The Rails</h1>
    <p>
      Every data point tells a story. This journey dives into the biggest economic shifts of the century.
      Follow along as we uncover the trends and shocks that shaped GDP worldwide.
    </p>
    <div class="scroll-svg">
      <img src="@/assets/scroll-down.svg" alt="Scroll Icon" class="bounce">
    </div>
  </div>
</template>

<script>
export default {
  name: "IntroductionA",
};
</script>

<style>
p {
  text-align: center;
}

.scroll-svg {
  text-align: center;
  animation: scroll-svg-fade 2s infinite;
  pointer-events: none; /* Verhindert, dass das SVG das Scrollen blockiert */
  transform: translate(0, 10svh);
}

.bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

/* Fade animation */
@keyframes scroll-svg-fade {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>