import { defineStore } from 'pinia';
import { ref } from 'vue';

const baseUrl = import.meta.env.BASE_URL // This will give you '/money-moves/'

export const useEconomicDataStore = defineStore('economicData', () => {
  const economicData = ref([]);
  const countries = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  const loadData = async () => {
    if (economicData.value.length > 0) return; // Data already loaded
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${baseUrl}data/combined_data.csv`);
      const csvText = await response.text();
      const rows = csvText.split('\n')
        .filter(row => row.trim() !== '')
        .map(row => {
          const values = row.split(';').map(value => value.trim().replace(/^"|"$/g, ''));
          return values;
        });
        console.log(rows);
        

      // Helper function to parse numbers with commas
      const parseNumberWithComma = (str) => {
        if (!str) return null;
        return parseFloat(str.replace(/,/g, ''));
      };

      // Extract unique countries
      countries.value = [...new Set(rows.slice(1).map(row => row[0]))].sort();

      // Convert CSV to array of objects with proper number parsing
      economicData.value = rows.slice(1)
        .filter(row => row.length >= 5)
        .map(row => ({
          country: row[0],
          year: parseInt(row[1]) || null,
          gdp: parseNumberWithComma(row[2]),
          unemployment: parseNumberWithComma(row[3]),
          emission: parseNumberWithComma(row[4])
        }))
        .filter(d => d.year !== null && d.country);
    } catch (err) {
      error.value = err.message;
      console.error('Error loading economic data:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const getCountryDataForYear = (country, year) => {
    return economicData.value.find(d => 
      d.country === country && d.year === year
    );
  };

  return {
    economicData,
    countries,
    isLoading,
    error,
    loadData,
    getCountryDataForYear
  };
}); 