<template>
    <div style="display: flex; justify-content: center; height: 100%;flex-direction: column;">
      <div id="sankey-chart" style="height: 100%;"></div>
      <div class="chart-description" style="margin: -120px auto 0 auto">
        <p>
          Click on the connections for highlighting the country. Hover over the connections for detailed information.
        </p>
      </div>
    </div>
  </template>
  
  <script>
  import * as d3 from "d3";
  import { sankey, sankeyLinkHorizontal } from "d3-sankey";
  
  export default {
    name: "Sankey",
    props: {
      config: {
        type: Object,
        required: true,
        default: () => ({
          highlightColor: "#f4e234",
        }),
      },
    },
    data() {
      return {
        width: window.innerWidth * 0.5 - 100,
        height: window.innerHeight - 20,
        // Hier speichern wir den aktuell ausgewählten Quellknoten (also das Land)
        selectedSource: null,
      };
    },
    mounted() {
      this.updateDimensions();
      window.addEventListener("resize", this.updateDimensions);
      this.drawChart();
    },
    methods: {
      updateDimensions() {
        this.width = window.innerWidth * 0.5 - 100;
        this.height = window.innerHeight - 120;
      },
  
      async drawChart() {
        // Definiere globalen Padding (in Pixel)
        const globalPadding = 40;
        
        // Container auswählen
        const svg = d3
          .select("#sankey-chart")
          .append("svg")
          .attr("width", this.width)
          .attr("height", this.height);

  
        // Beispielhafte Daten
        const data = {
          nodes: [
            { name: "Germany" },
            { name: "USA" },
            { name: "Japan" },
            { name: "China" },
            { name: "Russia" },
            { name: "Companies" },
            { name: "Households" },
            { name: "Healthcare" },
            { name: "Small Companies" },
            { name: "Direct payments" }, // Index 9
          ],
          links: [
            // Deutschland
            { source: 0, target: 5, value: 127 },
            { source: 0, target: 6, value: 160 },
            { source: 0, target: 7, value: 110 },
            { source: 0, target: 8, value: 30 },
  
            // USA
            { source: 1, target: 5, value: 900 },
            { source: 1, target: 6, value: 780 },
            { source: 1, target: 7, value: 205 },
            { source: 1, target: 8, value: 100 },
            { source: 1, target: 9, value: 500 },
  
            // Japan
            { source: 2, target: 5, value: 700 },
            { source: 2, target: 6, value: 430 },
            { source: 2, target: 7, value: 50 },
            { source: 2, target: 8, value: 100 },
            { source: 2, target: 9, value: 100 },
  
            // China
            { source: 3, target: 5, value: 800 },
            { source: 3, target: 6, value: 600 },
            { source: 3, target: 7, value: 90 },
  
            // Russland
            { source: 4, target: 5, value: 100 },
            { source: 4, target: 6, value: 300 },
            { source: 4, target: 7, value: 20 },
          ],
        };
  
        // Sankey Diagram konfigurieren, jetzt mit globalPadding im extent
        const sankeyGenerator = sankey()
          .nodeWidth(15)
          .nodePadding(10)
          .extent([
            [globalPadding, globalPadding*1.5],
            [this.width - globalPadding, this.height - globalPadding*2],
          ]);

        const { nodes, links } = sankeyGenerator({
          nodes: data.nodes.map((d) => Object.assign({}, d)),
          links: data.links.map((d) => Object.assign({}, d)),
        });

  
        // Farbschema
        const color = d3.scaleOrdinal(d3.schemeCategory10);
  
        // ---------------------------------------------
        // (1) <defs>-Block für die Link-Gradients anlegen
        // ---------------------------------------------
        const defs = svg.append("defs");
  
        links.forEach((link, i) => {
          const gradient = defs
            .append("linearGradient")
            .attr("id", `gradient-link-${i}`)
            .attr("gradientUnits", "userSpaceOnUse")
            // Startpunkt (Mitte des Source-Knotens) → Endpunkt (Mitte des Target-Knotens)
            .attr("x1", link.source.x1)
            .attr("y1", (link.source.y0 + link.source.y1) / 2)
            .attr("x2", link.target.x0)
            .attr("y2", (link.target.y0 + link.target.y1) / 2);
  
          gradient
            .append("stop")
            .attr("offset", "0%")
            .attr("stop-color", color(link.source.index));
  
          gradient
            .append("stop")
            .attr("offset", "100%")
            .attr("stop-color", color(link.target.index));
        });
  
        // ---------------------------------------------
        // (2) Knoten zeichnen
        // ---------------------------------------------
        svg
          .append("g")
          .selectAll("rect")
          .data(nodes)
          .join("rect")
          .attr("x", (d) => d.x0)
          .attr("y", (d) => d.y0)
          .attr("height", (d) => d.y1 - d.y0)
          .attr("width", (d) => d.x1 - d.x0)
          .attr("fill", (d, i) => color(i))
          .append("title")
          .text((d) => `${d.name}\n${d.value} Billion`);
  
        // ---------------------------------------------
        // (3) Links zeichnen (mit Gradient als Stroke)
        // ---------------------------------------------
        svg
          .append("g")
          .attr("fill", "none")
          .attr("stroke-opacity", 0.5)
          .selectAll("path")
          .data(links)
          .join("path")
          .attr("class", "sankey-link")
          .attr("d", sankeyLinkHorizontal())
          .attr("stroke", (d, i) => `url(#gradient-link-${i})`)
          .attr("stroke-width", (d) => Math.max(1, d.width))
          .on("click", (event, linkData) => {
            // Vergleiche anhand eines eindeutigen Wertes (hier: index)
            if (
              this.selectedSource &&
              this.selectedSource.index === linkData.source.index
            ) {
              // Zweiter Klick auf denselben Quellknoten: Selektion aufheben
              this.selectedSource = null;
              svg.selectAll("path.sankey-link").attr("stroke-opacity", 0.5);
            } else {
              // Andernfalls: Neuer Quellknoten wird ausgewählt
              this.selectedSource = linkData.source;
              svg.selectAll("path.sankey-link").attr("stroke-opacity", 0.1);
              svg
                .selectAll("path.sankey-link")
                .filter((d) => d.source.index === linkData.source.index)
                .attr("stroke-opacity", 1);
            }
          })
          .append("title")
          .text((d) => `${d.source.name} → ${d.target.name}\n${d.value} Billion`);
  
        // ---------------------------------------------
        // (4) Labels hinzufügen
        // ---------------------------------------------
        svg
          .append("g")
          .selectAll("text")
          .data(nodes)
          .join("text")
          .attr("x", (d) =>
            d.x0 < this.width / 2 ? d.x1 + 6 : d.x0 - 6
          )
          .attr("y", (d) => (d.y1 + d.y0) / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", (d) =>
            d.x0 < this.width / 2 ? "start" : "end"
          )
          .text((d) => d.name);
      },
    },
  };
  </script>
  
  <style scoped>
.chart-description {
  margin-top: -50px;
  font-size: 14px;
  color: #7e7e7e;
  text-align: center;
  max-width: 800px; /* Adjust width as needed */
}
  </style>
  