<template>
     <div style="display: flex; flex-direction: column; justify-content: center; height: 100%;">
      <h1 style="text-align: center; padding: 40px">The U.S. and the Oil Price Crash</h1>
      <p>
        In 2015, falling oil prices at <span class="data-highlight" style="background-color: #f7f7f7;">$40 per barrel</span>  
        lowered fuel costs but hit U.S. producers hard.  

        Despite cheap oil, imports stayed at <span class="data-highlight warning">4.6 million barrels per day</span>,  
        far below 2000s levels. Fracking had boosted domestic production  
        <span class="data-highlight positive">75%</span> in five years, reducing reliance on imports.  

        But low prices made fracking unprofitable, causing layoffs in the energy sector.  
        The unemployment rate in oil regions rose, though nationwide it stayed at  
        <span class="data-highlight positive">5.3%</span>, as cheaper energy boosted other industries.  

    </p>
    <div class="scroll-svg">
      <img src="../../assets/scroll-down-right.svg" alt="Scroll Icon">
    </div>
    </div>
</template>
  
<script>
  export default {
    name: "Section2015a",
  };
</script>
<style>
p {
  text-align: center;
}

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