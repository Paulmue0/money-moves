<template>
    <div class="falling-dollars-container">
      <div
        v-for="(dollar, index) in fallingDollars"
        :key="index"
        class="falling-dollar"
        :style="getDollarStyle(index)"
      >
        <img src="../../assets/dollar.svg" alt="Dollar Icon" />
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "FallingDollars",
    data() {
      return {
        fallingDollars: Array.from({ length: 20 }),
      };
    },
    mounted() {
        
    },
    methods: {
      getDollarStyle(index) {
        const delay = Math.random() * 5;
        const duration = 5 + Math.random() * 5;
        const startX = Math.random() * 100;
        const rotation = Math.random() * 360;
        const size = (Math.random() * 70 - 30) + 100; // Größe zwischen 10px und 20px
        return {
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          left: `${startX}%`,
          top: `-150px`,
          transform: `rotate(${rotation}deg)`,
          width: `${size}px`, // Breite
          height: `${size}px`, // Höhe
        };
      },
    },
  };
  </script>
  
  <style scoped>
  .falling-dollars-container {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100vh;
    background-color: #f5f5f5;
  }
  
  .falling-dollar {
    position: absolute;
    animation: fall infinite, rotate infinite;
  }
  
  img {
    display: block;
  }
  @keyframes fall {
    0% {
      top: -50px;
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    100% {
      top: 100vh;
      opacity: 0;
    }
  }
  
  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  </style>