<template>
  <div style="display: flex; flex-direction: column; justify-content: center; height: 100%;">
    <h1 style="text-align: center; padding: 40px">Year 2008: Impact on {{ selectedCountry }}</h1>

    <p>
      The 2008 global financial crisis sent shockwaves across economies. In {{ selectedCountry }}, GDP stood at
      <span class="data-highlight" :class="{ 'positive': isPositive(countryData?.gdp2007) }">
        ${{ formatNumber(countryData?.gdp2007) }} billion
      </span>
      in 2008, but the following year brought drastic changes.
    </p>

    <div v-if="countryData" class="country-stats">
      <p style="margin: 0;">Key economic shifts in {{ selectedCountry }}:</p>
      <ul>
        <li>
          <div class="stat-container">
            <span class="stat-label">GDP (2009):</span>
            <span class="stat-value" :class="{ 'positive': isPositive(countryData.gdp2008) }">
              ${{ formatNumber(countryData.gdp2008) }} billion
            </span>
          </div>
        </li>
        <li>
          <div class="stat-container">
            <span class="stat-label">GDP Change:</span>
            <span class="stat-value" :class="getChangeClass(calculateGDPChange())">
              {{ calculateGDPChange() }}%
              <span class="trend-arrow">{{ getChangeArrow(calculateGDPChange()) }}</span>
            </span>
          </div>
        </li>
        <li>
          <div class="stat-container">
            <span class="stat-label">Unemployment:</span>
            <span class="stat-value" :class="getUnemploymentClass(countryData.unemployment2008)">
              {{ formatNumber(countryData.unemployment2008) }}%
              <span class="pulse-dot"></span>
            </span>
          </div>
        </li>
      </ul>
    </div>

    <p>
      A pivotal moment came in September 2008, when Lehman Brothers collapsed, triggering panic in global markets.
      In {{ selectedCountry }}, GDP 
      <span class="data-highlight" :class="getChangeClass(calculateGDPChange())">
        {{ getGDPChangeText() }}
      </span>
      while unemployment rose to
      <span class="data-highlight warning">
        {{ formatNumber(countryData?.unemployment2008) }}%
      </span>.
    </p>
    <div class="scroll-svg" style="margin-top: -130px;">
      <img src="../../assets/scroll-down-right.svg" alt="Scroll Icon">
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useCountryStore } from '@/stores/countryStore';
import { useEconomicDataStore } from '@/stores/economicDataStore';
import { storeToRefs } from 'pinia';

export default {
  name: "Section2008a",
  setup() {
    const countryStore = useCountryStore();
    const economicStore = useEconomicDataStore();
    const { selectedCountry } = storeToRefs(countryStore);
    // Einmaliger Wert aus dem Store, der nicht reaktiv weiter aktualisiert wird:
    const initialCountry = ref(selectedCountry.value);
    
    const countryData = ref(null);

    const updateCountryData = () => {
      if (!initialCountry.value) return;

      const data2007 = economicStore.getCountryDataForYear(initialCountry.value, 2008);
      const data2008 = economicStore.getCountryDataForYear(initialCountry.value, 2009);

      countryData.value = {
        gdp2007: data2007?.gdp || null,
        gdp2008: data2008?.gdp || null,
        unemployment2008: data2008?.unemployment || null
      };
    };


    const formatNumber = (num) => {
      if (num === null || num === undefined || isNaN(num)) return 'N/A';

      // For GDP values, which are typically in billions
      if (num > 1000) {
        return num.toLocaleString(undefined, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2
        });
      }

      // For smaller numbers (like unemployment rates)
      return num.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
      });
    };

    const calculateGDPChange = () => {
      const gdp2007 = countryData.value?.gdp2007;
      const gdp2008 = countryData.value?.gdp2008;

      if (!gdp2007 || !gdp2008 || isNaN(gdp2007) || isNaN(gdp2008)) return 'N/A';

      const change = ((gdp2008 - gdp2007) / gdp2007) * 100;
      return change.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
      });
    };

    const getGDPChangeText = () => {
      const gdp2007 = countryData.value?.gdp2007;
      const gdp2008 = countryData.value?.gdp2008;

      if (!gdp2007 || !gdp2008 || isNaN(gdp2007) || isNaN(gdp2008)) {
        return 'changed significantly';
      }

      const change = ((gdp2008 - gdp2007) / gdp2007) * 100;
      if (change > 0) {
        return `surprisingly increased to $${formatNumber(gdp2008)} billion`;
      } else {
        return `fell to $${formatNumber(gdp2008)} billion`;
      }
    };

    const isPositive = (value) => {
      if (value === null || value === undefined || isNaN(value)) return false;
      return value > 0;
    };

    const getChangeClass = (change) => {
      if (change === 'N/A') return '';
      const numChange = parseFloat(change.replace(/,/g, ''));
      if (isNaN(numChange)) return '';
      return {
        'positive': numChange > 0,
        'negative': numChange < 0
      };
    };

    const getUnemploymentClass = (rate) => {
      if (rate === null || rate === undefined || isNaN(rate)) return '';
      return {
        'warning': rate > 5,
        'severe': rate > 10
      };
    };

    const getChangeArrow = (change) => {
      if (change === 'N/A') return '';
      const numChange = parseFloat(change.replace(/,/g, ''));
      if (isNaN(numChange)) return '';
      return numChange > 0 ? '↑' : '↓';
    };

    // Watch for changes in the store's selected country
    //watch(selectedCountry, () => {
    //  updateCountryData();
    //});

    onMounted(async () => {
      await economicStore.loadData();
      updateCountryData();
    });

    return {
      // Gib den initialen Wert zurück statt des reaktiven selectedCountry
      selectedCountry: initialCountry,
      countryData,
      formatNumber,
      calculateGDPChange,
      getGDPChangeText,
      isPositive,
      getChangeClass,
      getUnemploymentClass,
      getChangeArrow
    };
  }
};
</script>

<style scoped>
.country-selector {
  margin: 20px 0;
}

.country-selector select {
  padding: 8px;
  font-size: 16px;
  border-radius: 4px;
  margin-left: 10px;
}

.country-stats {
  background-color: #faf9f5;
  padding: 15px;
  border-radius: 25px;
  border: 1px solid rgba(0, 0, 0, 0.147);
  margin: 20px 0;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.country-stats ul {
  list-style-type: none;
  padding: 0;
}

.country-stats li {
  margin: 15px 0;
  font-size: 1.1em;
}

.stat-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: white;
  border-radius: 12px;
  border: 1px solid #0003;
  transition: all 0.3s ease;
}

.stat-container:hover {
  transform: translateX(5px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-weight: bold;
  color: #666;
}

.stat-value {
  font-size: 1.2em;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.data-highlight {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: bold;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
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

.severe {
  color: #dc3545;
  background-color: #ffebee;
}

.trend-arrow {
  margin-left: 4px;
  font-size: 1.2em;
}

.pulse-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
  margin-left: 8px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(255, 82, 82, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 82, 82, 0);
  }
}
</style>