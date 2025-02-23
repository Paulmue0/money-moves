<template>
  <div class="introduction-container">
    <h1 style="text-align: center; padding: 40px">Following the Money Trail</h1>
    <p>
      Zooming in gives us valuable details—but zooming out reveals patterns. By normalizing GDP and tracking rates of change, we uncover key moments where economies surged, stalled, or reversed course.

      Three turning points stand out. What happened? Let's explore the bigger picture.
    </p>
    <div class="scroll-svg">
      <img src="../../assets/scroll-down.svg" alt="Scroll Icon" class="bounce">
    </div>
  </div>
</template>

<script>
export default {
  name: "IntroductionC",
};
</script>

<style scoped>
.introduction-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  overflow: hidden;
}

p {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
  line-height: 1.6;
}

.bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-15px);
  }
  60% {
    transform: translateY(-7px);
  }
}
</style>