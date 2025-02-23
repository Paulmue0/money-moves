<template>
  <div ref="map" style="width: 50vw; height: 100vh; position: relative;">
    <!-- Tooltip -->
    <div
      ref="tooltip"
      style="
        position: absolute;
        background-color: white;
        border: 1px solid #ccc;
        padding: 5px;
        font-size: 12px;
        display: none;
        pointer-events: none;
        border-radius: 4px;
      "
    ></div>
  </div>
</template>
  
<script>
import * as d3 from "d3";

export default {
  name: "D3Map",
  props: {
    year: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      svg: null,
      projection: null,
      path: null,
      tooltip: null,
      geojson: null,
      gdpData: null,
      countryNameMapping: {
        "Afghanistan": "Afghanistan, Rep. of.",
        "American Samoa": "Samoa",
        "Bahamas": "Bahamas, The",
        "Brunei": "Brunei Darussalam",
        "Congo": "Congo, Democratic Republic of",
        "Iran": "Iran, Islamic Republic of",
        "Macedonia": "Macedonia, Former Yugoslav Republic of",
        "Hong Kong": "Hong Kong SAR",
        "Syria": "Syrian Arab Republic",
        "Timor-Leste": "Timor-Leste, Dem. Rep. of",
        "Taiwan": "Taiwan Province of China",
        "Yemen": "Yemen, Republic of",
        "Czech Rep.": "Czech Republic",
      },
    };
  },
  watch: {
    year: "updateMap", // Aktualisiere Karte bei Änderung des Jahres
  },
  mounted() {
    this.$nextTick(() => {
      console.log("SVG Element:", d3.select(this.$refs.map).select("svg"));
      this.initializeMap();
    });
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.resizeMap); // Event Listener entfernen
  },
  methods: {
    initializeMap() {
      if (!this.$refs.map) {
        console.warn("Map element is not available.");
        return;
      }

       const { width, height } = this.getDimensions();

      // Projektion dynamisch skalieren
      const scale = Math.min(width / 6.3, height / 3);
      this.projection = d3.geoMercator().scale(scale).translate([width / 2, height / 2]);

      this.path = d3.geoPath().projection(this.projection);

      console.log("Projection Scale:", scale);
      console.log("Projection Translate:", [width / 2, height / 2]);

      // Tooltip-Element
      this.tooltip = d3.select(this.$refs.tooltip);

      // SVG erstellen
      this.svg = d3
        .select(this.$refs.map)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

      // Geodaten und GDP-Daten laden
      Promise.all([
        d3.json(`${import.meta.env.BASE_URL}countries.geojson`),
        d3.csv(`${import.meta.env.BASE_URL}data/gdp_data.csv`),
      ]).then(([geojson, gdpData]) => {
        this.geojson = geojson;
        this.gdpData = gdpData;
        this.updateMap(); // Initiale Kartenzeichnung
      });
    },
    resizeMap() {
      // Dynamische Größenanpassung der Karte
      const { width, height } = this.getDimensions();

      // Dynamisch neue Projektion erstellen
      const scale = Math.min(width / (2 * Math.PI), height / Math.PI) * 150;
      this.projection.scale(scale).translate([width / 2, height / 2]);

      // Passe die SVG-Viewbox an die neuen Dimensionen an
      this.svg.attr("viewBox", `0 0 ${width} ${height}`);
      this.updateMap();
    },
    getDimensions() {
      // Sicherstellen, dass das Element gerendert ist
      if (!this.$refs.map) {
        console.warn("Map element is not available yet.");
        return { width: 800, height: 600 }; // Fallback-Werte
      }

      const width = this.$refs.map.offsetWidth || 800; // Standardbreite
      const height = this.$refs.map.offsetHeight || 600; // Standardhöhe
      console.log(width, height);
      return { width, height };
    },
    updateMap() {
      if (!this.geojson || !this.gdpData) return; // Daten müssen geladen sein

      // GDP-Daten verarbeiten
      const gdpMap = new Map();
      this.gdpData.forEach((row) => {
        const rawGDP = row[this.year];
        const cleanedGDP = rawGDP ? parseFloat(rawGDP.replace(/,/g, "")) : 0;
        gdpMap.set(row.Country.trim(), cleanedGDP);
      });

      // Dynamische Farbskala basierend auf den aktuellen GDP-Werten
      const gdpValues = Array.from(gdpMap.values());
      const maxGDP = d3.max(gdpValues);
      const minGDP = d3.min(gdpValues);
      const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([Math.log10(minGDP + 1), Math.log10(maxGDP + 1)]);

      // Länder aktualisieren oder neu zeichnen
      const paths = this.svg.selectAll("path").data(this.geojson.features);

      // Update bestehender Länder
      paths
        .attr("fill", (d) => {
          let countryName = d.properties.name;
          if (this.countryNameMapping[countryName]) {
            countryName = this.countryNameMapping[countryName];
          }
          const gdp = gdpMap.get(countryName) || 0;
          const logGDP = Math.log10(gdp + 1);
          return gdp ? colorScale(logGDP) : "#d3d3d3"; // Grau für fehlende Daten
        });

      // Neue Länder zeichnen (falls nötig)
      paths
        .enter()
        .append("path")
        .attr("d", this.path)
        .attr("fill", (d) => {
          let countryName = d.properties.name;
          if (this.countryNameMapping[countryName]) {
            countryName = this.countryNameMapping[countryName];
          }
          const gdp = gdpMap.get(countryName) || 0;
          const logGDP = Math.log10(gdp + 1);
          return gdp ? colorScale(logGDP) : "#d3d3d3"; // Grau für fehlende Daten
        })
        .attr("stroke", "#333")
        .attr("stroke-width", 0.5)
        .on("mouseover", (event, d) => {
          let countryName = d.properties.name;
          if (this.countryNameMapping[countryName]) {
            countryName = this.countryNameMapping[countryName];
          }
          const gdp = gdpMap.get(countryName) || "Keine Daten";
          this.tooltip
            .style("display", "block")
            .html(`<strong>${countryName}</strong><br>GDP: ${gdp === "Keine Daten" ? gdp : gdp.toLocaleString()} Mrd. USD`);
        })
        .on("mousemove", (event) => {
          const boundingRect = this.$refs.map.getBoundingClientRect();
          this.tooltip
            .style("left", `${event.pageX - boundingRect.left + 10}px`)
            .style("top", `${event.pageY - boundingRect.top + 10}px`);
        })
        .on("mouseout", () => {
          this.tooltip.style("display", "none");
        });

      // Entferne veraltete Länder
      paths.exit().remove();
    },
  },
};
</script>
  
<style scoped>
div[ref="map"] {
  width: 50vw; /* 50% der Fensterbreite */
  height: 100vh; /* Volle Fensterhöhe */
  position: relative;
}
</style>
  