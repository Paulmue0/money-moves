<template>
  <div style="display: flex; justify-content: center; align-items: center; height: 100%; flex-direction: column;">
    <div id="splom-chart" style="width: 100%; height: 100%;"></div>
    <div id="splom-tooltip" style="position: absolute; display: none; background: #fff; border: 1px solid #ccc; padding: 5px; pointer-events: none; border-radius: 5px;"></div>
    <div class="chart-description">
        <p>
          Click on the dimension labels to show distritbution. Hover over the points to see detailed information.
        </p>
      </div>
  </div>
</template>

<script>
import * as d3 from "d3";
import { useChapter2DataStore } from "../../stores/chapter2Store";

export default {
  name: "SPLOMChart",
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        activeYear: 2015,
        selectedCountry: "United States",
      }),
    },
  },
  watch: {
    config: {
      deep: true,
      handler() {
        console.log("Config received in SPLOMChart:", this.config);
        const data = this.filterData();
        this.updateSPLOM(data);
      },
    },
  },
  async mounted() {
    window.addEventListener("resize", this.handleResize);
    const store = useChapter2DataStore();
    await store.loadData();
    const data = this.filterData();
    const filteredData = data.filter(
      (d) =>
        d.gdpChange !== null &&
        d.unemployment !== null &&
        d.inflation !== null &&
        d.oilImportsKg !== null
    );
    if (filteredData) {
      this.createSPLOM(filteredData);
    }
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    filterData() {
      const store = useChapter2DataStore();
      // Anpassen, falls Sie nur ein bestimmtes Land anzeigen möchten:
      // return store.chapter2Data.filter(d => d.country === this.config.selectedCountry);
      return store.chapter2Data;
    },
    handleResize() {
      d3.select("#splom-chart").select("svg").remove();
      const data = this.filterData().filter(
        (d) =>
          d.gdpChange !== null &&
          d.unemployment !== null &&
          d.inflation !== null &&
          d.oilImportsKg !== null
      );
      if (data) {
        this.createSPLOM(data);
      }
    },
    updateSPLOM(data) {
      d3.select("#splom-chart").select("svg").remove();
      const filteredData = data.filter(
        (d) =>
          d.gdpChange !== null &&
          d.unemployment !== null &&
          d.inflation !== null &&
          d.oilImportsKg !== null
      );
      this.createSPLOM(filteredData);
    },
    createSPLOM(data) {
      const dimensions = ["gdpChange", "unemployment", "inflation", "oilImportsKg", "oilImportsDollars"];

      // Ermitteln der Containergröße
      const container = d3.select("#splom-chart").node();
      const containerWidth = container.getBoundingClientRect().width;
      const containerHeight = container.getBoundingClientRect().height;
      // Wählen Sie die kleinere Dimension für ein quadratisches SVG
      const svgSize = Math.min(containerWidth, containerHeight);
      
      // Neuer Parameter globalPadding: Abstand vom SVG-Rand zum Chart
      const globalPadding = 60;
      // Das bisherige padding wird weiterhin innerhalb der Zellen genutzt (z.B. für Skalen und Achsen)
      const padding = 20;
      
      // Effektive Chart-Größe: SVG-Größe abzüglich globalen Abständen (oben/unten, links/rechts)
      const chartSize = svgSize - globalPadding * 2;
      // Berechnung der Zellengröße innerhalb des effektiven Chartbereichs
      const cellSize = chartSize / dimensions.length;

      // Erstellen des SVG-Elements mit viewBox für Responsivität
      const svg = d3
        .select("#splom-chart")
        .append("svg")
        .attr("width", svgSize)
        .attr("height", svgSize)
        .attr("viewBox", `0 0 ${svgSize} ${svgSize}`);

      // Zentrierte Platzierung der Matrix innerhalb des globalPadding
      const matrixGroup = svg.append("g")
        .attr("transform", `translate(${globalPadding}, ${globalPadding})`);

      const x = {};
      const y = {};

      // Eigene Tick-Formatierung: Werte >= 1 MRD umrechnen
      const formatTick = (d) => {
        if (Math.abs(d) >= 1e9) {
          return d3.format(".2f")(d / 1e9) + "B$";
        }
        return d3.format("~s")(d);
      };

      // Skalen für jede Dimension erstellen
      dimensions.forEach((dim) => {
        x[dim] = d3
          .scaleLinear()
          .domain(d3.extent(data, (d) => +d[dim]))
          .range([padding, cellSize - padding]);

        y[dim] = d3
          .scaleLinear()
          .domain(d3.extent(data, (d) => +d[dim]))
          .range([cellSize - padding, padding]);
      });

      // Zeichnen der Scatterplot-Matrix
      dimensions.forEach((yDim, i) => {
        dimensions.forEach((xDim, j) => {
          const cell = matrixGroup
            .append("g")
            .attr("transform", `translate(${j * cellSize},${i * cellSize})`);

          // Auf der Diagonalen sollen keine Achsen angezeigt werden
          if (i === j) {
            const that = this;
            //Funktion welche text bricht wenn kein platz da ist
            function wrap(text, width) {
              text.each(function() {
                const textEl = d3.select(this);
                const words = textEl.text().split(/\s+/);
                let line = [];
                const lineHeight = 1.1; // Zeilenhöhe in em
                const x = textEl.attr("x");
                const y = textEl.attr("y");
                
                // Entferne den ursprünglichen Text und starte mit dem ersten tspan
                textEl.text("");
                let tspan = textEl.append("tspan").attr("x", x).attr("y", y);
                
                // Alle tspan-Elemente sammeln
                let tspans = [];
                tspans.push(tspan);
                
                words.forEach(word => {
                  line.push(word);
                  tspan.text(line.join(" "));
                  if (tspan.node().getComputedTextLength() > width && line.length > 1) {
                    // Letztes Wort entfernen und in der Zeile belassen
                    line.pop();
                    tspan.text(line.join(" "));
                    // Neue Zeile beginnen mit dem aktuellen Wort
                    line = [word];
                    tspan = textEl.append("tspan").attr("x", x);
                    tspan.text(word);
                    tspans.push(tspan);
                  }
                });
                
                // Gesamtanzahl der Zeilen
                const n = tspans.length;
                // Berechne den offset, um den gesamten Textblock vertikal zu zentrieren
                // (n - 1) * lineHeight em entspricht der Gesamthöhe (ohne den ersten tspan, der bei 0 startet)
                // Wir verschieben also den ersten tspan um -((n - 1) * lineHeight) / 2 em
                const dyOffset = -((n - 1) * lineHeight) / 2;
                
                // Setze den dy-Wert für das erste tspan
                tspans[0].attr("dy", dyOffset + "em");
                // Alle folgenden Zeilen erhalten den festen Zeilenabstand
                for (let i = 1; i < n; i++) {
                  tspans[i].attr("dy", lineHeight + "em");
                }
              });
            }
             // Definieren Sie eine Toggle-Variable für diese Zelle (lokal im Element)
            let toggled = false;
            
            // Initial: Zeigen Sie den Titel an
            drawTitle();

            // Registrieren Sie einen Klick-Handler
            cell.on("click", function() {
              toggled = !toggled;
              cell.selectAll("*").remove();
              if (toggled) {
                drawHistogram();
              } else {
                drawTitle();
              }
            });

            // Funktion: Zeichnet den Titel (Text) in der Zelle
            function drawTitle() {
              // Zeichnen des Hintergrunds (z.B. ein abgerundetes Rechteck)
              cell.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", cellSize)
                .attr("height", cellSize)
                .style("fill", "#e4e2d9")
                .style("stroke", "#0003")
                .attr("rx", 15)
                .attr("ry", 15);

              // Text zentriert in der Zelle
              cell.append("text")
                .attr("x", cellSize / 2)
                .attr("y", cellSize / 2)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("font-size", "12px")
                .attr("font-weight", "bold")
                .text(that.getLabel(yDim))  // "that" referenziert "this" aus dem äußeren Kontext
                .call(wrap, cellSize - padding * 2);
            }

            // Funktion: Zeichnet das Linienhistogramm (Area-Chart) mit vertikaler Linie für den ausgewählten Wert
            function drawHistogram() {
              // Verwenden Sie die gleiche Skala, die bereits für diese Dimension definiert ist
              const scale = x[yDim];  // x- und y-Skalen sind hier symmetrisch, da es die Diagonale ist
              // Erstellen Sie einen Histogramm-Generator für diese Dimension
              const histogram = d3.histogram()
                .domain(scale.domain())
                .thresholds(scale.ticks(20)); // Passen Sie die Anzahl der Bins hier an

              // Alle Werte dieser Dimension extrahieren
              const values = data.map(d => +d[yDim]);
              const bins = histogram(values);

              // Neue y-Skala für das Histogramm: Höhe in der Zelle (z. B. zwischen padding und cellSize - padding)
              const yHist = d3.scaleLinear()
                .domain([0, d3.max(bins, d => d.length)])
                .range([cellSize - padding, padding]);

              // Erzeugen eines Area-Generators
              const area = d3.area()
                .x(d => scale((d.x0 + d.x1) / 2))
                .y0(cellSize - padding)
                .y1(d => yHist(d.length))
                .curve(d3.curveMonotoneX);

              // Zeichnen Sie den Hintergrund (optional, z. B. ein Rechteck)
              cell.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", cellSize)
                .attr("height", cellSize)
                .style("fill", "#faf9f5")
                .style("stroke", "#0003")
                .attr("rx", 15)
                .attr("ry", 15);

              // Zeichnen der Fläche (Area-Chart)
              cell.append("path")
                .datum(bins)
                .attr("d", area)
                .style("fill", "#e4e2d9")
                .style("opacity", 0.8);

              // Zeichnen der Linie (optional, z. B. eine Linie entlang der Oberkante der Fläche)
              cell.append("path")
                .datum(bins)
                .attr("d", d3.line()
                  .x(d => scale((d.x0 + d.x1) / 2))
                  .y(d => yHist(d.length))
                  .curve(d3.curveMonotoneX)
                )
                .style("fill", "none")
                .style("stroke", "#403026")
                .style("stroke-width", 2);

              // Marker: Vertikale Linie an der Stelle des ausgewählten Werts
              const selectedValue = data.find(d => d.country === that.config.selectedCountry)[yDim];
              cell.append("line")
                .attr("x1", scale(selectedValue))
                .attr("x2", scale(selectedValue))
                .attr("y1", padding)
                .attr("y2", cellSize - padding)
                .style("stroke", "#e0693e")
                .style("stroke-width", 2)
                .style("stroke-dasharray", "4 2");
            }
          } else if (j < i) {
            // Unterteilen der Daten in normale und hervorgehobene Punkte
            const normalData = data.filter(d => d.country !== this.config.selectedCountry);
            const highlightedData = data.filter(d => d.country === this.config.selectedCountry);
            const formatNumber = d3.format(".2~f");
            // Normale Punkte zuerst zeichnen
            cell
              .selectAll("circle.normal")
              .data(normalData)
              .enter()
              .append("circle")
              .attr("class", "normal")
              .attr("cx", (d) => x[xDim](d[xDim]))
              .attr("cy", (d) => y[yDim](d[yDim]))
              .attr("r", 4)
              .style("fill", "#40302633")
              .on("mouseover", (event, d) => {
                // Tooltip-Inhalt zusammenstellen
                const tooltip = d3.select("#splom-tooltip"); // Stelle sicher, dass ein Element mit dieser ID existiert
                tooltip
                  .style("display", "block")
                  .html(
                    `<strong>${d.country}</strong><br>
                    ${this.getLabel(xDim)}: ${formatNumber(d[xDim])}<br>
                    ${this.getLabel(yDim)}: ${formatNumber(d[yDim])}`
                  );
              })
              .on("mousemove", (event) => {
                // Tooltip relativ zum übergeordneten Container positionieren
                const containerRect = d3.select("#splom-chart").node().getBoundingClientRect();
                d3.select("#splom-tooltip")
                  .style("left", `${event.clientX - containerRect.left + 40}px`)
                  .style("top", `${event.clientY - containerRect.top + 40}px`);
              })
              .on("mouseout", () => {
                d3.select("#splom-tooltip").style("display", "none");
              });

            // Hervorgehobene Punkte zuletzt zeichnen
            cell
              .selectAll("circle.highlight")
              .data(highlightedData)
              .enter()
              .append("circle")
              .attr("class", "highlight")
              .attr("cx", (d) => x[xDim](d[xDim]))
              .attr("cy", (d) => y[yDim](d[yDim]))
              .attr("r", 4)
              .style("fill", "#e0693e")
              .style("stroke", "#FFF")
              .style("stroke-width", 1)
              .on("mouseover", (event, d) => {
                const tooltip = d3.select("#splom-tooltip");
                tooltip
                  .style("display", "block")
                  .html(
                    `<strong>${d.country}</strong><br>
                    ${this.getLabel(xDim)}: ${formatNumber(d[xDim])}<br>
                    ${this.getLabel(yDim)}: ${formatNumber(d[yDim])}`
                  );
              })
              .on("mousemove", (event) => {
                const containerRect = d3.select("#splom-chart").node().getBoundingClientRect();
                d3.select("#splom-tooltip")
                  .style("left", `${event.clientX - containerRect.left + 40}px`)
                  .style("top", `${event.clientY - containerRect.top + 40}px`);
              })
              .on("mouseout", () => {
                d3.select("#splom-tooltip").style("display", "none");
              });
          } else if (i < j) {
            // Rechts von der Diagonalen: bivariate Dichtekontur

            // Erstellen der lokalen Skalen für diese Zelle
            const xScale = x[xDim];
            const yScale = y[yDim];

            // d3.contourDensity benötigt die Datenpunkte in Pixel-Koordinaten
            const densityData = data.map(d => ({
              x: xScale(d[xDim]),
              y: yScale(d[yDim])
            }));

            // Berechnen der Konturen
            const densityGenerator = d3.contourDensity()
              .x(d => d.x)
              .y(d => d.y)
              .size([cellSize, cellSize])
              .bandwidth(4) // Die Bandbreite kann je nach Daten angepasst werden
              .thresholds(8);

            const contours = densityGenerator(densityData);
            // Nach der Berechnung der Konturen:
            const densityValues = contours.map(c => c.value);
            const densityMin = d3.min(densityValues);
            const densityMax = d3.max(densityValues);

            // Farbskala, die von #403026 (dunkel) bis zu einem helleren Farbton (z.B. "#e4e2d9") interpoliert.
            const densityColorScale = d3.scaleLinear()
              .domain([densityMin, densityMax])
              .range(["#403026", "#e4e2d9"]);

            // Zeichnen der Konturen (Farbliche Füllung, z.B. mittels d3.interpolateBlues)
            cell.selectAll("path.contour")
              .data(contours)
              .enter()
              .append("path")
              .attr("class", "contour")
              .attr("d", d3.geoPath())
              .style("fill", d => densityColorScale(d.value))
              .style("opacity", 0.7);

            // Marker für den ausgewählten Punkt (auf jeden Fall über den Konturen zeichnen)
            const selectedData = data.find(d => d.country === this.config.selectedCountry);
            if (selectedData) {
              cell.append("circle")
                .attr("cx", xScale(selectedData[xDim]))
                .attr("cy", yScale(selectedData[yDim]))
                .attr("r", 5)
                .style("fill", "#e0693e")
                .style("stroke", "#FFF")
                .style("stroke-width", 1);
            }
          }

          if(i !== j){ // nicht für diagonalen
            // X-Achse: in allen Zellen zeichnen, aber die Beschriftung nur an den äußeren Zellen (unterste Zeile)
            let xAxis = d3.axisBottom(x[xDim])
              .ticks(4)
              .tickFormat((d) => (i === dimensions.length - 1 ? formatTick(d) : ""));
            
            cell.append("g")
              .attr("class", `x-axis-${xDim}`)
              .attr("transform", `translate(0, ${cellSize - padding})`)
              .call(xAxis)
              .selectAll("text")
              .each(function() {
                if ((xDim === "oilImportsKg" || xDim === "oilImportsDollars") && this.textContent !== "") {
                  d3.select(this)
                    .attr("transform", "rotate(90)")
                    .attr("text-anchor", "start");
                }
              });

            // Y-Achse: in allen Zellen zeichnen, aber die Beschriftung nur in der linken Spalte
            let yAxis = d3.axisLeft(y[yDim])
              .ticks(4)
              .tickFormat((d) => (j === 0 ? formatTick(d) : ""));
            
            cell.append("g")
              .attr("class", `y-axis-${yDim}`)
              .attr("transform", `translate(${padding}, 0)`)
              .call(yAxis);
          }
        });
      });
    },
    getLabel(dim) {
      const labels = {
        gdpChange: "GDP Change in %",
        unemployment: "Unemployment Rate in %",
        inflation: "Inflation in %",
        oilImportsKg: "Oil Imports in Tonnes",
        oilImportsDollars: "Oil Imports in Billion USD",
      };
      return labels[dim] || dim;
    },
  },
};
</script>

<style scoped>
#splom-chart {
  width: 100%;
  height: 100%;
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-description {
  margin-top: -50px;
  font-size: 14px;
  color: #7e7e7e;
  text-align: center;
  max-width: 800px; /* Adjust width as needed */
}
</style>