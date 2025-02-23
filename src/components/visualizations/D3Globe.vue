<template>
    <div style="position: relative; width: 100%; height: 100%;">
    <!-- Toggle Button oberhalb des Globus -->
    <div class="toggle-container">
      <button 
        :class="{ active: !change }" 
        @click="setChange(false)">
        GDP
      </button>
      <button 
        :class="{ active: change }" 
        @click="setChange(true)">
        Change Rate
      </button>
    </div>

    <!-- Globus -->
    <div ref="globe" style="width: 100%; height: 100%; position: relative;">
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
  </div>
  </template>
  
  <script>
  import * as d3 from "d3";
  import * as topojson from "topojson-client";
  import { useCountryStore } from '../../stores/countryStore';
  import { storeToRefs } from 'pinia';
  
  export default {
    name: "D3Globe",
    props: {
      config: {
        type: Object,
        required: true,
        default: () => ({
          activeYear: 1999,
          activeCountry: "Germany",
        }),
      },
    },
    setup() {
      const countryStore = useCountryStore();
      const { selectedCountry } = storeToRefs(countryStore);
      return { countryStore, selectedCountry };
    },
    data() {
      return {
        svg: null,
        projection: null,
        path: null,
        geojson: null,
        gdpData: null,
        change: false,
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
      config: {
        deep: true,
        handler() {
          this.updateGlobe();
          this.rotateGlobe();
        },
      },
      'selectedCountry': {
        handler(newCountry) {
          if (newCountry && this.config.activeCountry !== newCountry) {
            this.config.activeCountry = newCountry;
            this.rotateGlobe();
          }
        }
      }
    },
    mounted() {
      this.loadDataAndInitialize();
    },
    methods: {
      async loadDataAndInitialize() {
        try {
            // TopoJSON und GDP-Daten laden
            const [topoData, gdpData] = await Promise.all([
            d3.json(`${import.meta.env.BASE_URL}countries.topojson`),
            d3.csv(`${import.meta.env.BASE_URL}data/dataset_gdp_feb_2025.csv`),
            ]);
            // TopoJSON in GeoJSON umwandeln
            const geojson = topojson.feature(topoData, topoData.objects.countries);
            this.geojson = geojson;
            this.gdpData = gdpData;

            this.initializeGlobe(); // Globus initialisieren
            this.updateGlobe(); // Farben und Interaktivität setzen
            this.rotateGlobe();
        } catch (error) {
            console.error("Error loading data:", error);
        }
      },
      initializeGlobe() {
        if (!this.geojson) {
          console.error("GeoJSON data is not loaded.");
          return;
        }
  
        const width = this.$refs.globe.offsetWidth - 4; //keine ahnung warum diese 4px hier hin müssen
        const height = this.$refs.globe.offsetHeight;
  
        // Projektion und Pfad definieren
        this.projection = d3
          .geoOrthographic()
          .scale(Math.min(width, height) / 2.2) // Globusgröße
          .translate([width / 2, height / 2]);
  
        this.path = d3.geoPath().projection(this.projection);
  
        // SVG erstellen
        this.svg = d3
          .select(this.$refs.globe)
          .append("svg")
          .attr("width", width)
          .attr("height", height);
  
        // Kugelkontur
        this.svg
          .append("circle")
          .attr("class", "globe-background")
          .attr("cx", width / 2)
          .attr("cy", height / 2)
          .attr("r", this.projection.scale())
          .attr("fill", "#3202")
          .attr("stroke", "#000")
          .attr("stroke-width", 1);
  
        // Drag-Funktionalität
        this.enableDrag();
      },
      updateGlobe() {
        if (!this.geojson || !this.gdpData) return;
  
        // GDP-Daten verarbeiten
        const gdpMap = new Map();
        const change = this.change;
        this.gdpData.forEach((row) => {
          if(change){
            const rawGDP = row[this.config.activeYear] / row[this.config.activeYear-1] - 1;
            gdpMap.set(row.Country.trim(), rawGDP < Infinity ? rawGDP : 0);
          }
          else
          {
            const rawGDP = row[this.config.activeYear];
            const cleanedGDP = rawGDP ? parseFloat(rawGDP.replace(/,/g, ""))/1000 : 0;
            gdpMap.set(row.Country.trim(), cleanedGDP);
          }
        });
  
        // Dynamische Farbskala
        const gdpValues = Array.from(gdpMap.values());
        const maxGDP = d3.max(gdpValues);
        const minGDP = d3.min(gdpValues);
        let colorScale;
        if(change)
        {
          colorScale = d3.scaleDiverging(d3.interpolateRdYlGn)
           .domain([-0.1, 0, 0.1]);
        }else
        {
          colorScale = d3
          .scaleSequential(d3.interpolateBlues)
          .domain([Math.log(0.1), Math.log(maxGDP/12)]);
        }
        
        // Hintergrundfarbe
        this.svg.select("circle.globe-background")
          .attr("fill", this.change ? "#3201" : "#3201");

        // Länder zeichnen
        const countries = this.svg
          .selectAll("path")
          .data(this.geojson.features);
        // Update bestehender Länder
        countries
          .join(
            (enter) =>
              enter
                .append("path")
                .attr("d", this.path)
                .attr("stroke", "#fff")
                .attr("stroke-width", 0.8)
                .style("cursor", "pointer") // Add pointer cursor
          )
          .attr("fill", (d) => {
            let countryName = d.properties.name;
            if (this.countryNameMapping[countryName]) {
              countryName = this.countryNameMapping[countryName];
            }
            if(change){
              const gdp = gdpMap.get(countryName) || 0;
              return gdp ? colorScale(gdp) : "#d3d3d3";
            }else{
              const gdp = gdpMap.get(countryName) || 0;
              const logGDP = Math.log(gdp + 0.1);
              return gdp ? colorScale(logGDP) : "#d3d3d3";
            }
          })
          .on("click", (event, d) => {
            let countryName = d.properties.name;
            if (this.countryNameMapping[countryName]) {
              countryName = this.countryNameMapping[countryName];
            }
            this.countryStore.setSelectedCountry(countryName);
          })
          .on("mouseover", (event, d) => {
            const tooltip = d3.select(this.$refs.tooltip);
            let countryName = d.properties.name;
            if (this.countryNameMapping[countryName]) {
              countryName = this.countryNameMapping[countryName];
            }
            const gdp = gdpMap.get(countryName) || "Keine Daten";
            tooltip
              .style("display", "block")
              .html(() => {
                if(change){
                  return `<strong>${countryName}</strong><br>GDP Change: ${
                  gdp === "No data" ? gdp : (gdp*100).toFixed(3)
                } %<br><em>Click to select</em>`
                }
                else
                {
                  return `<strong>${countryName}</strong><br>GDP: ${
                  gdp === "No data" ? gdp : gdp.toFixed(3)
                } Bio. USD<br><em>Click to select</em>`
                }
              }
              );
          })
          .on("mousemove", (event) => {
            const boundingRect = this.$refs.globe.getBoundingClientRect(); // SVG-Container-Bereich
            d3.select(this.$refs.tooltip)
              .style("left", `${event.clientX - boundingRect.left + 10}px`) // Relativ zur SVG-Position
              .style("top", `${event.clientY - boundingRect.top + 10}px`); // Relativ zur SVG-Position
          })
          .on("mouseout", () => {
            d3.select(this.$refs.tooltip).style("display", "none");
          });
      },
      enableDrag() {
        const drag = d3
          .drag()
          .on("drag", (event) => {
            const rotate = this.projection.rotate();
            const k = 50 / this.projection.scale();
            this.projection.rotate([
              rotate[0] + event.dx * k,
              rotate[1] - event.dy * k,
            ]);
            this.svg.selectAll("path").attr("d", this.path); // Länder aktualisieren
          });
  
        this.svg.call(drag);
      },
      rotateGlobe() {
        if (!this.geojson || !this.config.activeCountry) {
        console.warn("GeoJSON data or country is not available.");
        return;
        }

        // Finde das Land in der GeoJSON-Datei
        const countryFeature = this.geojson.features.find((feature) => {
        let countryName = feature.properties.name;
        if (this.countryNameMapping[countryName]) {
            countryName = this.countryNameMapping[countryName];
        }
        return countryName === this.config.activeCountry;
        });

        if (!countryFeature) {
        console.warn(`Country ${this.config.activeCountry} not found in GeoJSON.`);
        return;
        }

        // Berechne die mittlere Position (longitude, latitude) des Landes
        const [[longitude, latitude]] = d3.geoCentroid(countryFeature)
        ? [d3.geoCentroid(countryFeature)]
        : [[0, 0]];

        // Aktuelle Rotation holen
        const currentRotate = this.projection.rotate();

        // Zielrotation berechnen
        const targetRotate = [-longitude, -latitude, 0];

        // Animierte Rotation
        d3.transition()
        .duration(1000) // Dauer der Animation (in Millisekunden)
        .tween("rotate", () => {
            const interpolate = d3.interpolate(currentRotate, targetRotate);
            return (t) => {
            this.projection.rotate(interpolate(t));
            this.svg.selectAll("path").attr("d", this.path); // Aktualisiere die Pfade
            };
        });
      },
      // Methode, um den Toggle-Button zu steuern
      setChange(value) {
        this.change = value;
        this.updateGlobe();
      },
    },
  };
  </script>
  
  <style scoped>
  div[ref="globe"] {
    width: 100%;
    height: 100%;
    position: relative;
  }
  
  svg {
    display: block;
  }

  /* Add highlight effect for hovering over countries */
  path:hover {
    opacity: 0.8;
    stroke-width: 1px;
    stroke: #fff;
  }

  /* Style für den Toggle-Button-Container */
.toggle-container {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  background-color: #0001;
  border-radius: 20px;
  padding: 5px 5px 4px 5px;
  font-size: 1.2em;
}
.toggle-container button {
  border: none;
  background: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 15px;
  font-size: 1.2em;
}
.toggle-container button.active {
  font-weight: bold;
  border-bottom: 2px solid #3337;
  background-color: #faf9f5;
}
  </style>