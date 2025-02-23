<template>
  <div ref="visualizationContainer" style="flex: 1; position: relative;">
    <!-- Dynamische Visualisierung -->
    <component 
      :is="currentVisualization" 
      v-bind="config" 
      style="
        background-color: #f0eee6; 
        border: 1px solid #0001; 
        margin: 20px; 
        border-radius: 35px; 
        width: calc(100% - 40px) !important; 
        height: calc(100% - 40px); 
        box-shadow: 0 5px 20px #0001;"/>
  </div>
</template>
  
<script>
  import SPLOMChart from "./visualizations/SPLOMChart.vue";
  import TimeseriesWrapper from "./visualizations/TimeseriesWrapper.vue";
  import FallingDollars from "./visualizations/FallingDollars.vue"
  import D3Globe from "./visualizations/D3Globe.vue";
  import Barchartrace from "./visualizations/Barchartrace.vue";
  import Sankey from "./visualizations/Sankey.vue"

  export default {
    name: "VisualizationManager",
    components: {
      SPLOMChart,
      TimeseriesWrapper,
      D3Globe,
      Barchartrace,
      FallingDollars,
      Sankey
    },
    props: {
      visualization: {
        type: String,
        required: true,
      },
      config: {
        type: Object,
        required: false, // Config ist optional, falls nicht jede Visualisierung sie benötigt
        default: () => ({}), // Standard: leeres Objekt
      },
    },
    computed: {
      currentVisualization() {
        switch (this.visualization) {
          case "Globe":
            return "D3Globe";
          case "SPLOM":
            return "SPLOMChart";
          case "LineChart":
            return "TimeseriesWrapper";
          case "BarChartRace": 
            return "Barchartrace";
          case "FallingDollars": 
            return "FallingDollars";
          case "SankeyDiagram": 
            return "Sankey";
          
          default:
            console.warn(`Unknown visualization type: ${this.visualization}`);
            return null; // Fallback: Keine Visualisierung
        }
      },
    },
  };
</script>