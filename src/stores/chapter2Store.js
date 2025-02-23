import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useChapter2DataStore = defineStore('chapter2Data', () => {
  const chapter2Data = ref([]);
  const countries = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  const loadData = async () => {
    if (chapter2Data.value.length > 0) return; // Daten bereits geladen
  
    isLoading.value = true;
    error.value = null;
  
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}data/chapter_2_data.csv`);
      const csvText = await response.text();
      const rows = csvText.split('\n')
        .filter(row => row.trim() !== '') // Entfernt leere Zeilen
        .map(row => {
          const values = row.split(',').map(value => value.trim().replace(/^"|"$/g, '')); // Verwende ',' statt ';'
          return values;
        });
  
      // Helper function to parse numbers with commas
      const parseNumberWithComma = (str) => {
        if (!str) return null;
        return parseFloat(str.replace(/,/g, '').replace('.', '.')); // Entfernt Tausendertrennzeichen
      };
  
      // Extract unique countries
      countries.value = [...new Set(rows.slice(1).map(row => row[0]))].sort();
  
      // Convert CSV to array of objects with proper number parsing
      chapter2Data.value = rows.slice(1) // Überspringt Header-Zeile
        .map(row => ({
          country: row[0],
          gdpChange: parseNumberWithComma(row[1]), // Ignoriere Spalte 2
          unemployment: parseNumberWithComma(row[3]),
          inflation: parseNumberWithComma(row[4]),
          oilImportsDollars: parseNumberWithComma(row[5]),
          oilImportsKg: parseNumberWithComma(row[6])
        }))
        .filter(d => d.country); // Entfernt ungültige Einträge
  
      console.log('Chapter 2 Data:', chapter2Data.value);
    } catch (err) {
      error.value = err.message;
      console.error('Error loading chapter 2 data:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const getCountryData = (country) => {
    return chapter2Data.value.filter(d => d.country === country);
  };

  return {
    chapter2Data,
    countries,
    isLoading,
    error,
    loadData,
    getCountryData
  };
});