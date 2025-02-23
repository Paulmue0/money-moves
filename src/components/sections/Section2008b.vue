<template>
  <div style="display: flex; flex-direction: column; justify-content: center; height: 100%;">
    <h1 style="text-align: center; padding: 40px">The European Impact</h1>
    
    <p>The crisis hit Europe's financial sector hard. Banks exposed to U.S. mortgage-backed securities faced instability, leading to major bailouts.</p>

    <div class="europe-impact">
      <h3>Key Developments:</h3>
      <ul>
        <li><strong>Banking Crisis:</strong> RBS and Northern Rock neared collapse, requiring government intervention.</li>
        <li><strong>Recession:</strong> The Eurozone's GDP fell <span class="data-highlight negative">4.5%</span> in 2009.</li>
        <li><strong>Market Crash:</strong> European stocks lost <span class="data-highlight negative">€1 trillion</span> in October 2008 alone.</li>
      </ul>
    </div>

    <p>Germany, Europe's largest economy, faced its worst recession since WWII. Export-heavy industries collapsed, prompting a <span class="data-highlight warning">€50 billion</span> stimulus, including the "cash for clunkers" program.
      The UK saw its first bank run in 150 years at Northern Rock, leading to nationalizations and <span class="data-highlight warning">£500 billion</span> in bailouts.</p>
    <!--
    <div class="policy-response">
      <h3>Policy Response:</h3>
      <ul>
        <li>The ECB slashed interest rates.</li>
        <li>Governments launched stimulus packages.</li>
        <li>Financial regulations were tightened.</li>
        <li>Stronger banking oversight was enforced.</li>
      </ul>
    </div>
    -->
    <div class="scroll-svg">
      <img src="../../assets/scroll-down-horizontal.svg" alt="Scroll Icon">
    </div>
  </div>
</template>

<script>
export default {
  name: "Section2008b"
};
</script>

<style scoped>
.europe-impact, .policy-response {
  background-color: #faf9f5;
  padding: 0 20px;
  margin: 20px 0;
  border-radius: 25px;
  border: 1px solid rgba(0, 0, 0, 0.147);
  border-left: 4px solid #007bff;
  font-size: 1.3em;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

ul {
  list-style-type: none;
  padding-left: 0;
}

li {
  margin: 10px 0;
  padding-left: 20px;
  position: relative;
}

li:before {
  content: "•";
  color: #007bff;
  font-weight: bold;
  position: absolute;
  left: 0;
}

h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}

strong {
  color: #2c3e50;
}
</style>