import { defineStore } from 'pinia'

export const useIntroStore = defineStore('intro', {
  state: () => ({
    selectedCountry: 'China',
  }),
  
  actions: {
    setSelectedCountry(country) {
      this.selectedCountry = country
    },
  }
}) 