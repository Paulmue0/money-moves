<template>
  <div>
    <div style="display: flex; height: 100vh; width: 100vw;overflow: hidden;"
      :style="{
          color: scene.color,
          backgroundColor: scene.background,
          transition: 'background-color 0.5s ease, color 0.5s ease'
        }"
    >
      <!-- Text-Komponente -->
      <TextNode @scroll-status-change="handleScrollStatusChange" />
      <!-- Visualisierungsmanager -->
      <VisualizationManager :visualization="visualization" :config="config" />
    </div>
  </div>
</template>

<script>
import TextNode from "./components/TextNode.vue";
import VisualizationManager from "./components/VisualizationManager.vue";
import TimeseriesWrapper from "./components/visualizations/TimeseriesWrapper.vue";
import SPLOMChart from "./components/visualizations/SPLOMChart.vue";
import Barchartrace from "./components/visualizations/Barchartrace.vue";
import Sankey from "./components/visualizations/Sankey.vue";

export default {
  name: "App",
  components: {
    TimeseriesWrapper,
    TextNode,
    VisualizationManager,
    SPLOMChart,
    Barchartrace,
    Sankey
  },
  data() {
    return {
      visualization: "FallingDollars", //Start Visualisierung
      config: {               //Start Konfiguration
        activeYear: 1999,     // Startjahr
        activeCountry: "USA"  // Startland
      },
      scene: {
        color: "#333",
        background: "#faf9f5"
      }
    };
  },
  methods: {
    handleScrollStatusChange(visualization, config, scene) {
      // Aktualisiere das aktive Jahr basierend auf dem Scrollstatus
      this.visualization = visualization;
      this.config = config;
      this.scene = scene.scene;
    },
  },
};
</script>