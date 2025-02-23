<template>
    <div style="display: flex; flex-direction: column; justify-content: center; height: 100%;">
      <h1 style="text-align: center; padding: 40px">Russia's Economic Stress Test</h1>
      <p>
        In 2015, Russia faced a double crisis. The <span class="data-highlight" style="background-color: #f7f7f7;">$40 per barrel</span>  
        oil price crash slashed revenues, while Western sanctions over Crimea restricted global market access.  

        Inflation soared past <span class="data-highlight negative">15%</span>, the ruble lost value, and imports became more expensive.  
        Russia's economy shrank by <span class="data-highlight negative">2%</span>, exposing its reliance on energy exports.  

        The chart shows another key fact: Russia does not import oil. While the U.S. benefited from lower prices,  
        Russia plunged into an economic downturn.
    </p>
      <div class="scroll-svg">
      <img src="@/assets/scroll-down-left.svg" alt="Scroll Icon">
    </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "Section2015r",
  };
  </script>

<style>
.data-highlight {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: bold;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
  margin: 0 5px 0 2px;
}

.data-highlight:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.positive {
  color: #28a745;
  background-color: #e8f5e9;
}

.negative {
  color: #dc3545;
  background-color: #ffebee;
}

.warning {
  color: #ffc107;
  background-color: #fff3e0;
}
</style>