<template>
  <div style="display: flex; justify-content: center; height: 100vh; max-width: 100%">
    <TimeseriesLineChart
      v-if="deflatedGdpData.length > 0"
      :data="deflatedGdpData"
      categoryKey="Country"
      :selectedCategories="['United States', 'China', 'Russia', 'Germany', 'United Kingdom']"
      :colors="['#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b']"
      xAxisLabel="Year"
      yAxisLabel="GDP Growth Rate"
      :showConfidenceInterval="true"
      :width="chartWidth"
      :height="500"
      style="margin: auto -20px auto -20px; width: 90%;"
    />
    <p v-else>No data available to display the chart.</p>
  </div>
</template>

<script>
import TimeseriesLineChart from './TimeseriesLineChart.vue';
import * as d3 from 'd3';

export default {
  name: "TimeseriesWrapper",
  components: { TimeseriesLineChart },
  data() {
    return {
      deflatedGdpData: [],
      chartWidth: window.innerWidth * 0.4 // Initial chart width (80% of window width)
    };
  },
  methods: {
    updateChartWidth() {
      this.chartWidth = window.innerWidth * 0.4; // Update the chart width
    }
  },
  async created() {
    // Add event listener for window resize
    window.addEventListener('resize', this.updateChartWidth);

    // Load the CSV data
    const rawData = await d3.csv(`${import.meta.env.BASE_URL}data/dataset_gdp_feb_2025.csv`);

    // Transform the data into the required format and filter out rows with NaN values
    this.deflatedGdpData = rawData.map(row => {
      const countryData = { Country: row.Country };
      Object.entries(row).forEach(([key, value]) => {
        if (key !== 'Country') {
          countryData[key] = parseFloat(value);
        }
      });
      return countryData;
    }).filter(countryData => {
      // Filter out rows that contain any NaN values
      return Object.entries(countryData).every(([key, value]) => 
        key === 'Country' || !isNaN(value)
      );
    }).filter(countryData => {
      // Filter out rows where all GDP values are zero
      return Object.entries(countryData).some(([key, value]) => 
        key !== 'Country' && value !== 0
      );
    });

    console.log(this.deflatedGdpData);
  },
  beforeDestroy() {
    // Remove event listener when component is destroyed
    window.removeEventListener('resize', this.updateChartWidth);
  }
};
</script>

<style scoped>

</style>