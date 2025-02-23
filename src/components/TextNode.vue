<template>
  <div
    ref="scrollableText"
    @scroll="handleVerticalScroll"
    style="
      width: 50%;
      overflow-y: auto;
      scroll-snap-type: y mandatory;
      scroll-behavior: smooth;
      scrollbar-width: none;
      height: 100vh;
    "
  >
    <!-- Äußere Schleife über die Jahre -->
    <div
      v-for="(yearObj, yIndex) in years"
      :key="yearObj.key"
      :data-year="yearObj.key"
      style="
        margin-bottom: 100vh;
        padding: 20px;
        scroll-snap-align: start;
        display: flex;
        flex-direction: column;
      "
    >
      

      <div
        ref="horizontalScroll"
        class="horizontal-container"
        style="
          display: flex;
          flex-direction: row;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          white-space: nowrap;
          width: 100%;
          height: calc(100vh - 100px);
        "
        @scroll="handleHorizontalScroll"
      >
        <div
          v-for="(section, sIndex) in yearObj.sections"
          :key="section.key"
          class="section-container"
          style="
            flex: 0 0 100%;
            scroll-snap-align: start;
            box-sizing: border-box;
            padding: 20px;
            text-align: justify;
          "
        >
          <component :is="section.component"></component>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import IntroductionA from "./sections/IntroductionA.vue";
import IntroductionB from "./sections/IntroductionB.vue";
import IntroductionC from "./sections/IntroductionC.vue";
import Section2008a from "./sections/Section2008a.vue";
import Section2008b from "./sections/Section2008b.vue";
import Section2015America from "./sections/Section2015America.vue";
import Section2015Russia from "./sections/Section2015Russia.vue";
import Section2024a from "./sections/Section2024a.vue";
import Section2008c from "./sections/Section2008c.vue";
import Section2021 from "./sections/Section2021.vue";

import { useIntroStore } from '@/stores/introductionBStore'
import { storeToRefs } from 'pinia'

var selectedYear = "-1";

export default {
  name: "TextNode",
  setup() {
    const introStore = useIntroStore()
    const { selectedCountry } = storeToRefs(introStore)
    return { selectedCountry }
  },
  data() {
    return {
      years: [
      {
          key: "IntroductionA",
          sections: [
            { key: "IntroductionA", component: IntroductionA, visualization: "FallingDollars", config: {}, scene: {color: "#333", background: "#faf9f5"} },
          ],
        },
        {
          key: "IntroductionB",
          sections: [
            { key: "IntroductionB", component: IntroductionB, visualization: "BarChartRace", config: {highlighted: this.selectedCountry, highlightColor: "#edc127"}, scene: {color: "#333", background: "#faf9f5"} },
          ],
        },
        {
          key: "IntroductionC",
          sections: [
            { key: "IntroductionC", component: IntroductionC, visualization: "LineChart", config: {}, scene: {color: "#333", background: "#faf9f5"} },
          ],
        },
        {
          key: 2009,
          sections: [
            { key: "2008a", component: Section2008a, visualization: "Globe", config: {activeCountry: "United States", activeYear: 2009}, scene: {color: "#333", background: "#faf9f5"} },
            { key: "2008b", component: Section2008b, visualization: "Globe", config: {activeCountry: "Germany", activeYear: 2009}, scene: {color: "#333", background: "#faf9f5"} },
            { key: "2008c", component: Section2008c, visualization: "Globe", config: {activeYear: 2009}, scene: {color: "#333", background: "#faf9f5"} },
          ],
        },
        /*{
          key: 2010,
          sections: [
            { key: "2010a", component: Section2010a, visualization: "Globe", config: {activeCountry: "Russia", activeYear: 2010}, scene: {color: "#333", background: "#faf9f5"} },
          ],
        },*/
        {
          key: 2015,
          sections: [
            { key: "2015a", component: Section2015America, visualization: "SPLOM", config: {selectedCountry: "United States", activeYear: 2015}, scene: {color: "#333", background: "#faf9f5"}},
            { key: "2015r", component: Section2015Russia, visualization: "SPLOM", config: {selectedCountry: "Russian Federation", activeYear: 2015}, scene: {color: "#333", background: "#faf9f5"}},

          ]
        },
        {
          key: "2021",
          sections: [
            { key: "2021", component: Section2021, visualization: "SankeyDiagram", config: {highlightColor: "#edc127"}, scene: {color: "#333", background: "#faf9f5"}}
          ]
        }
      ],
      currentVerticalIndex: 0,
      horizontalIndices: [], // Vorläufig leer
    };
  },
  created() {
    // Initialisiere horizontalIndices basierend auf der Länge von years
    this.horizontalIndices = Array.from({ length: this.years.length }, () => 0);
  },
  computed: {
    selectedCountry() {
      const store = useIntroStore()
      console.log("TextNode computed - Store country:", store.selectedCountry) // Debug log
      return store.selectedCountry
    },
  },
  watch: {
    selectedCountry(newVal) {
      console.log("TextNode watch - Country changed to:", newVal)
      // Find the IntroductionB section and update its config
      const introSection = this.years.find(y => y.key === "IntroductionB")?.sections[0];
      if (introSection) {
        introSection.config = {
          highlighted: newVal,
          highlightColor: "#edc127"
        };
        // Emit the change to update visualization
        this.$emit("scroll-status-change", introSection.visualization, 
          {config: introSection.config}, 
          {scene: introSection.scene}
        );
      }
    }
  },
  methods: {
    handleVerticalScroll() {
      const scrollableText = this.$refs.scrollableText;
      const scrollTop = scrollableText.scrollTop;
      const scrollHeight = scrollableText.scrollHeight;
      const clientHeight = scrollableText.clientHeight;

      const totalYears = this.years.length;
      const sectionIndex = Math.floor(
        (scrollTop / (scrollHeight - clientHeight)) * totalYears
      );

      const activeYearIndex = Math.min(sectionIndex, totalYears - 1);
      if(activeYearIndex == this.currentVerticalIndex)
        return;

      // Wenn gewünscht, kannst du hier auch den aktiven Abschnitt innerhalb dieses Jahres bestimmen.
      // Z.B. den ersten Abschnitt als Default nehmen, wenn kein horizontales Scrollen stattfand.
      const visualization = this.years[activeYearIndex].sections[this.horizontalIndices[activeYearIndex]].visualization;
      const config = this.years[activeYearIndex].sections[this.horizontalIndices[activeYearIndex]].config;
      const scene = this.years[activeYearIndex].sections[this.horizontalIndices[activeYearIndex]].scene;
      this.selectedYear = activeYearIndex;
      this.currentVerticalIndex = activeYearIndex;
      this.$emit("scroll-status-change", visualization, {config: config}, {scene: scene});
    },
    handleHorizontalScroll() {
      const container = this.$refs.horizontalScroll[this.selectedYear];
      const scrollLeft = container.scrollLeft;
      const containerWidth = container.clientWidth;
      
      // Identifiziere das Jahr basierend auf dem nächstgelegenen `data-year`
      const parentYearDiv = container.closest("[data-year]");
      if (!parentYearDiv) return;

      const yearKey = parseInt(parentYearDiv.getAttribute("data-year"), 10);
      const yearObj = this.years.find((y) => y.key === yearKey);
      if (!yearObj) return;

      // Ermitteln des sichtbaren Abschnitts
      const sectionIndex = Math.round(scrollLeft / containerWidth);

      // Aktiver Abschnitt
      const activeSection = yearObj.sections[sectionIndex];
      this.horizontalIndices[this.currentVerticalIndex] = sectionIndex;
      if (activeSection) {
        const { key, visualization, config, scene, component } = activeSection;

        // Event auslösen
        this.$emit("scroll-status-change", visualization, {config: config}, {scene: scene});
      }
    },
  },
};
</script>

<style scoped>
.horizontal-container::-webkit-scrollbar {
  display: none;
}

.section-container {
  width: 100%;
  max-width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

.horizontal-container {
  scroll-snap-type: x mandatory;
  white-space: normal !important;
}
</style>