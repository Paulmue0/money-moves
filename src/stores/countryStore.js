import { defineStore } from 'pinia'

export const useCountryStore = defineStore('country', {
  state: () => ({
    selectedCountry: 'United States',
    activeYear: 2008
  }),
  
  actions: {
    setSelectedCountry(country) {
      this.selectedCountry = country
    },
    setActiveYear(year) {
      this.activeYear = year
    }
  }
}) 