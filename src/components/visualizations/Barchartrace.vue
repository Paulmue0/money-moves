<template>
    <div style="display: flex; justify-content: center; height: 100%; flex-direction: column;">
      <div id="bar-chart" style="height: 100%;"></div> 
      <div class="chart-description" style="margin: -120px auto 0 auto">
        <p>
          Numbers show the GDP in Billion USD.
        </p>
      </div>
    </div>
  </template>
  
  <script>
  import * as d3 from "d3";
  
  export default {
    name: "Barchartrace",
    props: {
      config: {
        type: Object,
        required: true,
        default: () => ({
          highlighted: "China",
          highlightColor: "#f4e234",
        }),
      },
    },
    data() {
      return {
        width: window.innerWidth * 0.5 - 100, // 50% der Fensterbreite
        height: window.innerHeight, // 50% der Fensterhöhe
        duration: 1600, // Geschwindigkeit der Animation
        topN: 16,
      };
    },
    watch: {
      config: {
        deep: true,
        handler(newConfig) {
          console.log("Barchartrace - Config changed:", newConfig)
          // Clear existing SVG
          d3.select("#bar-chart").selectAll("svg").remove();
          // Redraw the chart
          this.drawChart();
        },
      },
    },
    mounted() {
      console.log("Barchartrace - Initial config:", this.config)
      this.updateDimensions();
      window.addEventListener("resize", this.updateDimensions);
      this.drawChart();
    },
    methods: {
      calculateTopN() {
        const margin = { top: 20, bottom: 40 }; // Deine aktuellen Margins
        const innerHeight = this.height - margin.top - margin.bottom; // Verfügbare Diagrammhöhe
        const barHeight = 50; // Standardhöhe eines Balkens in Pixeln
        return Math.floor(innerHeight / barHeight); // Maximale Anzahl an Balken
      },
      updateDimensions() {
        this.width = window.innerWidth * 0.5 - 100; // 50% der Fensterbreite
        this.height = window.innerHeight - 170; // 50% der Fensterhöhe
        this.topN = this.calculateTopN(); // Dynamisch Anzahl der Balken berechnen
      },
      async drawChart() {
        // Container auswählen
        const svg = d3
          .select("#bar-chart")
          .append("svg")
          .attr("width", this.width)
          .attr("height", this.height);
  
        // CSV-Daten laden
        const data = await d3.csv(`${import.meta.env.BASE_URL}data/gdp_data.csv`);
        //console.log("Daten Geladen")
        console.log(this.config);
        // Daten vorbereiten
        const parsedData = this.prepareData(data);
        //console.log(parsedData)
  
        // Die Logik für das Bar Chart Race einfügen
        this.createBarChartRace(svg, parsedData);
      },
  
      prepareData(rawData) {
        // Transformiere CSV zu einem nutzbaren JSON
        //console.log(rawData)
        const years = Object.keys(rawData[0]).filter((key) => !isNaN(key));
        //console.log(years)
        const data = [];
  
        rawData.forEach((row) => {
          years.forEach((year) => {
            data.push({
              country: row.Country,
              year: +year,
              value: parseFloat(row[year].replace(/,/g, "")),
            });
          });
        });
        return data;
      },
  
      createBarChartRace(svg, data) {
        const { width, height, duration } = this;

        // Margins anpassen
        const margin = { top: 20, right: 200, bottom: 40, left: 0 }; // Erhöhe "left" für längere Texte
        const innerWidth = width - margin.left - margin.right; // Breite neu berechnen
        const innerHeight = height - margin.top - margin.bottom;

        // Set up scales
        const x = d3.scaleLinear().range([0, innerWidth]); // Bleibt unverändert
        const y = d3
          .scaleBand()
          .range([0, innerHeight])
          .padding(0.1); // Abstand der Balken bleibt gleich

        // Zeichne Hauptgruppe mit Margins
        const g = svg
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

        const colorScale = d3.scaleLog()
          .domain([1, d3.max(data, (d) => d.value)]) // Skala basierend auf dem Wert
          .range(["#5bb9a6", "#c15f3c"]); // Von Hellblau nach Dunkelblau


        // Textknoten für die Jahreszahl
        const yearLabel = svg
          .append("text")
          .attr("class", "year-label")
          .attr("x", width - 160)
          .attr("y", height - 60)
          .attr("text-anchor", "end")
          .style("font-size", "50px")
          .style("fill", "grey")
          .text("");

        // Daten nach Jahr gruppieren
        const years = [...new Set(data.map((d) => d.year))];
        let yearIndex = 0;

        const update = (year, instant = false) => {
          const yearData = data
            .filter((d) => d.year === year)
            .sort((a, b) => b.value - a.value)
            .slice(0, this.topN);

          x.domain([0, d3.max(yearData, (d) => d.value)]);
          y.domain(yearData.map((d) => d.country));

          const bars = g.selectAll(".bar").data(yearData, (d) => d.country);

          // ENTER
            bars
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", (d) => y(d.country))
            .attr("rx", 10) // Horizontale Abrundung
            .attr("ry", 10) // Vertikale Abrundung
            .attr("width", 0)
            .attr("height", y.bandwidth())
            .attr("fill", (d) => {return d.country === this.config.highlighted ? this.config.highlightColor : colorScale(d.value)})
            .transition()
            .duration(duration)
            .attr("width", (d) => x(d.value));

          // UPDATE
          bars
            .transition()
            .duration(duration)
            .attr("y", (d) => y(d.country))
            .attr("width", (d) => x(d.value))
            .attr("fill", (d) => {return d.country === this.config.highlighted ? this.config.highlightColor : colorScale(d.value)});
        
          
          // EXIT
          bars
            .exit()
            .transition()
            .duration(duration)
            .attr("width", 0)
            .remove();

          // Text
          const labels = g.selectAll(".label").data(yearData, (d) => d.country);

          // Labels erstellen oder aktualisieren
          labels
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", 5)
            .attr("y", (d) => y(d.country) + y.bandwidth() / 2)
            .attr("dy", "0.35em")
            .each(function (d) {
              const text = d3.select(this);
              // Ländername fett machen
              text
                .append("tspan")
                .text(d.country)
                .style("font-weight", "bold");

              // Zahlen normal lassen
              text
                .append("tspan")
                .text(`: ${d.value.toFixed(1)}`)
                .style("font-weight", "normal")
                .attr("dx", 5); // Kleiner Abstand zwischen Name und Zahlen
            })
            .transition()
            .duration(duration)
            .attr("x", (d) => x(d.value) + 5)
            .tween("text", function (d) {
              const that = d3.select(this);
              const i = d3.interpolate(0, d.value); // Interpoliert von 0 bis zum Wert
              return function (t) {
                that.text(`${d.country}: ${i(t).toFixed(1)}`); // Text während der Transition aktualisieren
              };
            });

          labels
            .transition()
            .duration(duration)
            .attr("x", (d) => x(d.value) + 5)
            .attr("y", (d) => y(d.country) + y.bandwidth() / 2)
            .tween("text", function (d) {
              const that = d3.select(this);
              const i = d3.interpolate(that.text().split(": ")[1] || 0, d.value); // Aktuellen Textwert interpolieren
              return function (t) {
                that.text(`${d.country}: ${i(t).toFixed(1)}`);
              };
            });

          labels.exit().remove();

          yearLabel
          .transition()
          .duration(duration)
          .text(year);

        };
        update(years[yearIndex]);
        yearIndex++;
        // Animations-Loop
        const interval = setInterval(() => {
          update(years[yearIndex]);
          yearIndex++;
          if (yearIndex >= years.length)
            { 
              yearIndex = 0;
            }
        }, duration);
      },
    },
  };
  </script>
  
  <style scoped>
  .bar {
    fill: steelblue;
  }
  .label {
    font-size: 12px;
    fill: black;
  }

  .chart-description {
  margin-top: -50px;
  font-size: 14px;
  color: #7e7e7e;
  text-align: center;
  max-width: 800px; /* Adjust width as needed */
}
  </style>
  