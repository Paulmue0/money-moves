<template>
  <div class="introduction-container">
    <h1 style="text-align: center; padding: 40px">
      {{ titleText }}
    </h1>
    
    <p class="subtitle">Big trends can be overwhelming, but every number tells a story. By focusing on a single country, we uncover hidden narratives—moments of crisis, resilience, or growth that might get lost in the global picture.</p>
    
    <div class="content-box">
      <p>Look at 
        <select v-model="selectedCountry" @change="updateHighlight" class="inline-select">
          <option v-for="country in countries" :key="country" :value="country">
            {{ country }}
          </option>
        </select> 
        – their economy <span v-html="growthDescription"></span> since 1999.
      </p>

      <p>Pick different countries to explore their unique journeys through the chaos.</p>
    </div>
    
    <div class="scroll-svg">
      <img src="../../assets/scroll-down.svg" alt="Scroll Icon" class="bounce">
    </div>
  </div>
</template>

<script>
import { useIntroStore } from '../../stores/IntroductionBStore'
import { onMounted, ref } from 'vue'

export default {
  name: "IntroductionB",
  setup() {
    const introStore = useIntroStore()
    return { introStore }
  },
  data() {
    const store = useIntroStore()
    return {
      selectedCountry: store.selectedCountry,
      countries: [
        "China", "United States", "Japan", "Germany", "United Kingdom", 
        "France", "India", "Italy", "Brazil", "Canada"
      ],
      gdpData: []
    }
  },
  async created() {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}data/gdp_data.csv`)
      const csvText = await response.text()
      
      // Improved CSV parsing
      const lines = csvText.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''))
      
      this.gdpData = lines.slice(1).map(line => {
        // Handle commas within quoted strings correctly
        const values = []
        let inQuotes = false
        let currentValue = ''
        
        for (let char of line) {
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === ',' && !inQuotes) {
            values.push(currentValue.trim())
            currentValue = ''
          } else {
            currentValue += char
          }
        }
        values.push(currentValue.trim())
        
        const row = {}
        headers.forEach((header, index) => {
          const value = values[index]?.replace(/"/g, '') || ''
          row[header] = value
        })
        return row
      })
    } catch (error) {
      console.error('Error loading GDP data:', error)
    }
  },
  computed: {
    growthRate() {
      const countryData = this.gdpData.find(row => row.Country === this.selectedCountry)
      if (!countryData) return 0
      
      // Remove commas from the numbers before parsing
      const startGDP = parseFloat(countryData['1999']?.replace(/,/g, '')) || 
                      parseFloat(countryData['2000']?.replace(/,/g, ''))
      const endGDP = parseFloat(countryData['2022']?.replace(/,/g, ''))
      
      if (!startGDP || !endGDP || isNaN(startGDP) || isNaN(endGDP)) return 0
      
      const growth = ((endGDP - startGDP) / startGDP) * 100
      return Math.round(growth)
    },
    growthClass() {
      return this.growthRate > 0 ? 'positive' : 'negative'
    },
    growthDescription() {
      if (this.growthRate === 0) return 'remained stable'
      if (this.growthRate > 0) {
        return `powered ahead by <span class="data-highlight positive">${this.growthRate}%</span>`
      }
      return `faced challenges, declining by <span class="data-highlight negative">${Math.abs(this.growthRate)}%</span>`
    },
    titleText() {
      const globalGrowth = 168
      if (this.growthRate > globalGrowth) {
        return `Through Crisis and Recovery: ${this.selectedCountry} Surged ${this.growthRate - globalGrowth}% Above Global Growth`
      } else if (this.growthRate < 0) {
        return `Weathering the Storm: How ${this.selectedCountry} Navigated Global Shifts`
      } else {
        return `Resilience Through Change: ${this.selectedCountry}'s Economic Journey`
      }
    }
  },
  methods: {
    updateHighlight() {
      this.introStore.setSelectedCountry(this.selectedCountry)
      
      this.$emit('update:config', {
        highlighted: this.selectedCountry,
        highlightColor: "#edc127"
      });
    }
  }
};
</script>

<style scoped>
.introduction-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.title {
  text-align: center;
  padding: 40px;
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.3;
  background: linear-gradient(45deg, #007bff, #00a6ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 20px;
}

.subtitle {
  text-align: center;

  color: #555;
  margin: 0 auto 30px;
}

.content-box {
  background: linear-gradient(145deg, #ffffff, #faf9f5);
  padding: 30px 40px;
  margin: 20px 0;
  border-radius: 25px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-left: 4px solid #007bff;
  font-size: 1.1em;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
  max-width: 800px;
}

.content-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
}

p {
  text-align: left;
  margin: 15px 0;
  line-height: 1.6;
}

.data-highlight {
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.data-highlight.positive {
  background-color: rgba(40, 167, 69, 0.15);
  color: #28a745;
}

.data-highlight.negative {
  background-color: rgba(220, 53, 69, 0.15);
  color: #dc3545;
}

.inline-select {
  display: inline-block;
  font-size: inherit;
  font-family: inherit;
  padding: 4px 12px;
  margin: 0 4px;
  border: none;
  border-bottom: 2px solid #edc127;
  border-radius: 4px;
  background-color: rgba(237, 193, 39, 0.1);
  cursor: pointer;
  color: #edc127;
  font-weight: 600;
  transition: all 0.3s ease;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23edc127%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 0.7em top 50%;
  background-size: 0.65em auto;
  padding-right: 2em;
}

.inline-select:hover, .inline-select:focus {
  background-color: rgba(0, 123, 255, 0.1);
  border-bottom-color: #007bff;
  color: #007bff;
  outline: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007bff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
}

.scroll-svg {
  margin-top: 0px;
}

.scroll-svg img {
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
    padding: 20px;
  }
  
  .subtitle {
    font-size: 1.2rem;
  }
  
  .content-box {
    padding: 20px;
    font-size: 1.1em;
  }
}
</style>