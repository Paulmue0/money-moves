<template>
  <div style="display: flex; flex-direction: column; justify-content: center; height: 100%;">
    <h1 style="text-align: center; padding: 40px">{{ countryData ? selectedCountry + "'s Story" : "Select a Country" }}</h1>

    <div v-if="countryData" class="country-profile">
      <div class="impact-summary">
        <h3>Economic Impact Overview</h3>
        <div class="stat-grid">
          <div class="stat-item">
            <span class="stat-label">GDP Change (2008-2009)</span>
            <span class="stat-value" :class="getChangeClass(calculateGDPChange())">
              {{ calculateGDPChange() }}%
              <span class="trend-arrow">{{ getChangeArrow(calculateGDPChange()) }}</span>
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">2009 GDP</span>
            <span class="stat-value">
              ${{ formatNumber(countryData.gdp2008) }} billion
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Unemployment Rate</span>
            <span class="stat-value" :class="getUnemploymentClass(countryData.unemployment2008)">
              {{ formatNumber(countryData.unemployment2008) }}%
            </span>
          </div>
        </div>
      </div>

      <div class="crisis-narrative">
        <h3 style="font-size: 2em; margin-left: 20px;">Crisis Impact Analysis</h3>
        <p>
          In {{ selectedCountry }}, the 2008 financial crisis manifested with 
          <span :class="getChangeClass(calculateGDPChange())">
            {{ getImpactDescription() }}
          </span>. 
          The unemployment situation {{ getUnemploymentDescription() }}.
        </p>
        <!--
        <p>
          This represented a {{ Math.abs(calculateGDPChange()) }}% 
          {{ calculateGDPChange() < 0 ? 'contraction' : 'growth' }} 
          from the previous year's GDP of ${{ formatNumber(countryData.gdp2007) }} billion.
        </p>
        -->
      </div>

      <div class="recovery-metrics">
        <h3 style="font-size: 2em; margin-left: 20px;">Key Recovery Indicators</h3>
        <ul>
          <!--
          <li>GDP Per Capita: ${{ formatNumber(countryData.gdpPerCapita2008) }}</li>
          -->
          <li>Employment Change: {{ formatNumber(getEmploymentChange()) }}%</li>
          <li>Economic Resilience Score: {{ calculateResilienceScore() }}/10</li>
        </ul>
      </div>
    </div>

    <div v-else class="no-data">
      <p>Select a country on the globe to view its specific impact during the 2008 financial crisis.</p>
    </div>
    <div class="scroll-svg">
      <img src="../../assets/scroll-down-left.svg" alt="Scroll Icon">
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useCountryStore } from '../../stores/countryStore';
import { useEconomicDataStore } from '../../stores/economicDataStore';
import { storeToRefs } from 'pinia';

export default {
  name: "Section2008c",
  setup() {
    const countryStore = useCountryStore();
    const economicStore = useEconomicDataStore();
    const { selectedCountry } = storeToRefs(countryStore);
    const countryData = ref(null);

    const updateCountryData = () => {
      if (!selectedCountry.value) return;

      const data2007 = economicStore.getCountryDataForYear(selectedCountry.value, 2008);
      const data2008 = economicStore.getCountryDataForYear(selectedCountry.value, 2009);

      if (data2007 && data2008) {
        countryData.value = {
          gdp2007: data2007.gdp,
          gdp2008: data2008.gdp,
          unemployment2008: data2008.unemployment,
          gdpPerCapita2008: data2008.gdpPerCapita
        };
      }
    };

    const formatNumber = (num) => {
      if (num === null || num === undefined || isNaN(num)) return 'N/A';
      return num.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
      });
    };

    const calculateGDPChange = () => {
      if (!countryData.value?.gdp2007 || !countryData.value?.gdp2008) return 'N/A';
      const change = ((countryData.value.gdp2008 - countryData.value.gdp2007) / countryData.value.gdp2007) * 100;
      return change.toLocaleString(undefined, { maximumFractionDigits: 2 });
    };

    const getChangeClass = (change) => {
      if (change === 'N/A') return '';
      const numChange = parseFloat(change);
      return {
        'positive': numChange > 0,
        'negative': numChange < 0
      };
    };

    const getUnemploymentClass = (rate) => {
      if (!rate || isNaN(rate)) return '';
      return {
        'warning': rate > 5,
        'severe': rate > 10
      };
    };

    const getChangeArrow = (change) => {
      if (change === 'N/A') return '';
      const numChange = parseFloat(change);
      return numChange > 0 ? '↑' : '↓';
    };

    const getImpactDescription = () => {
      const change = parseFloat(calculateGDPChange());
      if (!change || isNaN(change)) return 'unkonwn changes';
      if (change <= -5) return 'severe economic contraction';
      if (change < 0) return 'moderate economic decline';
      if (change < 2) return 'relative economic stability';
      return 'economic growth despite global challenges';
    };

    const getUnemploymentDescription = () => {
      const rate = countryData.value?.unemployment2008;
      if (!rate || isNaN(rate)) return 'here is missing Data';
      if (rate > 10) return 'reached critical levels';
      if (rate > 7) return 'showed concerning elevation';
      if (rate > 5) return 'showed moderate increase';
      return 'remained relatively stable';
    };

    const getEmploymentChange = () => {
      // Simplified calculation - in real app would compare with previous year
      return ((10 - (countryData.value?.unemployment2008 || 5)) / 10) * 100;
    };

    const calculateResilienceScore = () => {
      if (!countryData.value) return 'N/A';
      const gdpChange = parseFloat(calculateGDPChange());
      const unemployment = countryData.value.unemployment2008;
      
      if (isNaN(gdpChange) || isNaN(unemployment)) return 'N/A';
      
      // Simple scoring algorithm
      let score = 5; // Base score
      score += gdpChange > 0 ? 2 : gdpChange > -3 ? 1 : 0;
      score += unemployment < 5 ? 3 : unemployment < 8 ? 2 : unemployment < 10 ? 1 : 0;
      
      return Math.min(10, Math.max(1, Math.round(score)));
    };

    watch(selectedCountry, () => {
      updateCountryData();
    });

    onMounted(() => {
      updateCountryData();
    });

    return {
      selectedCountry,
      countryData,
      formatNumber,
      calculateGDPChange,
      getChangeClass,
      getUnemploymentClass,
      getChangeArrow,
      getImpactDescription,
      getUnemploymentDescription,
      getEmploymentChange,
      calculateResilienceScore
    };
  }
};
</script>

<style scoped>
.country-profile {
  max-width: 800px;
  margin: 0 auto;
}

.impact-summary {
  background-color: #faf9f5;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.stat-grid {
  display: grid;
  width: calc(100% + 40px);
  transform: translate(-20px, 0);
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.stat-item {
  background: #faf9f5;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #0003;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
}

.stat-label {
  display: block;
  font-size: 1.0em;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 1.5em;
  font-weight: bold;
}

.crisis-narrative {
  background-color: #faf9f5;
  padding: 0 20px;
  border: 1px solid rgba(0, 0, 0, 0.147);
  border-left: 4px solid #007bff;
  margin-bottom: 30px;
  border-radius: 25px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.recovery-metrics {
  background-color: #faf9f5;
  padding: 0 20px;
  border: 1px solid rgba(0, 0, 0, 0.147);
  border-radius: 25px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.recovery-metrics ul {
  list-style-type: none;
  padding-left: 20px;
  font-size: 1.5em;
}

.recovery-metrics li {
  margin: 10px 0;
  padding-left: 20px;
  position: relative;
}

.recovery-metrics li:before {
  content: "•";
  color: #007bff;
  position: absolute;
  left: 0;
}

.positive {
  color: #28a745;
  border-radius: 10px;
  padding: 0px 5px;
  border: 1px solid #0001;
}

.negative {
  color: #dc3545;
  border-radius: 10px;
  padding: 0px 5px;
  border: 1px solid #0001;
}

.warning {
  color: #ffc107;
  border-radius: 10px;
  padding: 0px 5px;
  border: 1px solid #0001;
}

.severe {
  color: #dc3545;
  border-radius: 10px;
  padding: 0px 5px;
  border: 1px solid #0001;
  background-color: #ffecee;
}

.trend-arrow {
  margin-left: 4px;
}

.no-data {
  text-align: center;
  padding: 40px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-top: 20px;
}

h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}
</style> 