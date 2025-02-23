<template>
  <div>
    <div class="timeseries-chart">
      <svg :width="chartWidth + margin.left + margin.right" 
           :height="height + margin.top + margin.bottom"
           ref="svgRef">
        <g :transform="`translate(${margin.left},${margin.top})`">
          <!-- Chart elements will be added here -->
        </g>
      </svg>
      <div ref="tooltip" class="tooltip" style="display: none;"></div>
      <div class="legend-container">
        <svg ref="legendSvgRef"></svg>
      </div>
    </div>
      <div class="chart-description" style="margin: 0 auto;">
        <p>
          Use the legend to toggle the visibility of different categories. Hover over the points to see detailed information.
        </p>
      </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import { onMounted, ref, reactive, computed } from 'vue';

export default {
  name: 'TimeseriesLineChart',
  props: {
    data: {
      type: Array,
      required: true
    },
    categoryKey: {
      type: String,
      required: true,
      default: 'Country'  // The column name for categories (e.g., 'Country', 'Region', etc.)
    },
    selectedCategories: {
      type: Array,
      default: () => []  // If empty, will show all categories
    },
    colors: {
      type: Array,
      default: () => d3.schemeCategory10
    },
    width: {
      type: Number,
      default: 960
    },
    height: {
      type: Number,
      default: 600
    },
    showConfidenceInterval: {
      type: Boolean,
      default: true
    },
    xAxisLabel: {
      type: String,
      default: 'Year'
    },
    yAxisLabel: {
      type: String,
      default: 'Value'
    }
  },
  setup(props) {
    const margin = { top: 20, right: 120, bottom: 50, left: 60 };
    const svgRef = ref(null);
    const legendSvgRef = ref(null);
    const categoryVisibility = reactive({});
  
    // Dynamische Breite des Zeichnungsbereichs berechnen
    const chartWidth = computed(() => props.width - margin.left - margin.right);

    const processData = (rawData) => {
      const years = Object.keys(rawData[0]).filter(key => key !== props.categoryKey);

      const categoryData = rawData.map(row => ({
        category: row[props.categoryKey],
        values: years.map(year => ({
          year: +year,
          value: !row[year] || row[year] === '' ? null : +row[year]
        })).filter(d => d.value !== null)
      })).map(category => {
        const maxValue = d3.max(category.values, d => d.value) || 1; // Sicherstellen, dass maxValue > 0
        const normalizedValues = category.values.map((d, i) => ({
          year: d.year,
          value: d.value,
          normalizedValue: d.value / maxValue,
          change: i > 0 ? (d.value / maxValue) - (category.values[i - 1].value / maxValue) : 0
        }));
        return { category: category.category, values: normalizedValues };
      });

      const filteredData = props.selectedCategories.length > 0
        ? categoryData.filter(d => props.selectedCategories.includes(d.category))
        : categoryData;

      filteredData.forEach(category => {
        if (!(category.category in categoryVisibility)) {
          categoryVisibility[category.category] = true;
        }
      });

      const yearMap = new Map();
      filteredData.forEach(category => {
        category.values.forEach(v => {
          if (!yearMap.has(v.year)) yearMap.set(v.year, []);
          yearMap.get(v.year).push(v.change);
        });
      });

      const globalTrend = Array.from(yearMap.entries()).map(([year, changes]) => ({
        year,
        mean: d3.mean(changes),
        stdDev: d3.deviation(changes)
      })).sort((a, b) => a.year - b.year);

      return { categoryData: filteredData, globalTrend };
    };

    const drawChart = (data, globalTrend, initialLoad = true) => {
      const svg = d3.select(svgRef.value).select('g');
      svg.selectAll('*').remove(); // Clear previous chart

      // Create scales
      const xScale = d3.scaleLinear()
        .domain(d3.extent(data[0].values, d => d.year))
        .range([0, chartWidth.value]);

      const yScale = d3.scaleLinear()
        .domain([
          d3.min([...data.map(d => d3.min(d.values, v => v.change)), 
                  ...globalTrend.map(d => d.mean - d.stdDev)]),
          d3.max([...data.map(d => d3.max(d.values, v => v.change)), 
                  ...globalTrend.map(d => d.mean + d.stdDev)])
        ])
        .range([props.height, 0]);

      // Add axes
      svg.append('g')
        .attr('transform', `translate(0,${props.height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format('d')));

      svg.append('g')
        .call(d3.axisLeft(yScale));

      // Add axis labels
      svg.append('text')
        .attr('x', chartWidth.value / 2)
        .attr('y', props.height + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .attr('class', 'axis-label')
        .text(props.xAxisLabel);

      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -props.height / 2)
        .attr('y', -margin.left + 15)
        .attr('text-anchor', 'middle')
        .attr('class', 'axis-label')
        .text(props.yAxisLabel);

      // Create line generators
      const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.change))
        .defined(d => !isNaN(d.change))
        .curve(d3.curveMonotoneX);

      if (props.showConfidenceInterval) {
        const area = d3.area()
          .x(d => xScale(d.year))
          .y0(d => yScale(d.mean - d.stdDev))
          .y1(d => yScale(d.mean + d.stdDev))
          .curve(d3.curveMonotoneX);

        const meanLine = d3.line()
          .x(d => xScale(d.year))
          .y(d => yScale(d.mean))
          .curve(d3.curveMonotoneX);


        // Add confidence interval
        svg.append('path')
          .datum(globalTrend)
          .attr('fill', '#a4a299')
          .attr('opacity', 0)
          .attr('d', area)
          .transition()
          .duration(initialLoad ? 2000 : 0)
          .attr('opacity', 0.3);



        // Add mean line
        const meanPath = svg.append('path')
          .datum(globalTrend)
          .attr('fill', 'none')
          .attr('stroke', '#6ba1d8')
          .attr('stroke-width', 3)
          .attr('d', meanLine)
          .attr('stroke-dasharray', function() {
            return this.getTotalLength();
          })
          .attr('stroke-dashoffset', function() {
            return this.getTotalLength();
          });

        meanPath.transition()
          .duration(initialLoad ? 2000 : 0)
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', 0);
      }

      // Add lines for categories
      data.forEach((category, i) => {
        // Zeichne die Linie
        const path = svg.append('path')
        .datum(category.values)
        .attr('fill', 'none')
        .attr('stroke', categoryVisibility[category.category] ? props.colors[i % props.colors.length] : 'grey')
        .attr('stroke-width', 2)
        .attr('d', line)
        .attr('stroke-dasharray', function() {
          return this.getTotalLength(); // Initialisiere die Länge der Linie
        })
        .attr('stroke-dashoffset', function() {
          return this.getTotalLength(); // Setze das Offset auf die gesamte Länge (unsichtbar)
        })
        .style('opacity', categoryVisibility[category.category] ? 1 : 0.2);

        // Zeichne Punkte auf der Linie
        const points = svg.selectAll(`.point-${i}`)
          .data(category.values)
          .enter()
          .append('circle')
          .attr('class', `point-${i}`)
          .attr('cx', d => xScale(d.year))
          .attr('cy', d => yScale(d.change))
          .attr('r', 0) // Punktgröße
          .attr('fill', props.colors[i % props.colors.length])
          .style('opacity', categoryVisibility[category.category] ? 1 : 0.2)
          .on('mouseover', (event, d) => {
            const tooltip = d3.select(svgRef.value.parentNode).select('.tooltip');
            tooltip.style('display', 'block')
              .html(`<strong>${category.category}</strong><br>
                    Year: ${d.year || 'Unknown'}<br>
                    GDP: ${d.value !== null && !isNaN(d.value) ? d.value.toFixed(2) : 'No data'} Bio. USD`);
          })
          .on('mousemove', (event) => {
            const container = svgRef.value.parentNode;
            const rect = container.getBoundingClientRect();
            const tooltip = d3.select(container).select('.tooltip');
            tooltip.style('left', `${event.clientX - rect.left + 10}px`)
                  .style('top', `${event.clientY - rect.top + 10}px`);
          })
          .on('mouseout', () => {
            d3.select(svgRef.value.parentNode).select('.tooltip').style('display', 'none');
          });


          path.transition()
          .duration(initialLoad ? 2000 : 0)
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', 0);

          // Animationsübergang für Punkte
          points.transition()
          .duration(initialLoad ? 2000 : 0) // Gleiche Dauer wie die Linie
          .ease(d3.easeLinear)
          .attr('r', 3); // Zielwert: Punktgröße (Radius)
      });

      // Add legend
      const legendHeight = 200;
      const legend = d3.select(legendSvgRef.value)
        .attr('width', 150)
        .attr('height', legendHeight)
        .append('g')
        .attr('transform', `translate(0, 40)`);

      if (props.showConfidenceInterval) {
        legend.append('rect')
          .attr('x', 0)
          .attr('y', -40)
          .attr('width', 15)
          .attr('height', 15)
          .attr('fill', '#6ba1d8');

        legend.append('text')
          .attr('x', 20)
          .attr('y', -28)
          .text('Global Mean');

        legend.append('rect')
          .attr('x', 0)
          .attr('y', -20)
          .attr('width', 15)
          .attr('height', 15)
          .attr('fill', '#a4a299')
          .attr('opacity', 0.3);

        legend.append('text')
          .attr('x', 20)
          .attr('y', -8)
          .text('Global Variation');
      }

      // Add category legends
      data.forEach((category, i) => {
        const legendItem = legend.append('g')
          .attr('transform', `translate(0, ${i * 20})`)
          .style('cursor', 'pointer')
          .on('click', () => {
            categoryVisibility[category.category] = !categoryVisibility[category.category];
            drawChart(data, globalTrend, false); // Redraw chart with updated visibility
          });

        legendItem.append('rect')
          .attr('width', 15)
          .attr('height', 15)
          .attr('fill', props.colors[i % props.colors.length]);

        legendItem.append('text')
          .attr('x', 20)
          .attr('y', 12)
          .text(category.category);
      });
    };

    onMounted(() => {
      const { categoryData, globalTrend } = processData(props.data);
      drawChart(categoryData, globalTrend, true); // Initial load with animation
    });

    return {
      margin,
      svgRef,
      legendSvgRef,
      categoryVisibility,
      chartWidth
    };
  }
};
</script>

<style scoped>
.timeseries-chart {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  display: flex;
  justify-content: center; /* Center the legend horizontally */
  align-items: center; /* Center the legend vertically */
  position: relative;
}

.legend-container {
  overflow-y:visible;
  max-height: 200px; /* Adjust this value as needed */
  margin-left: 10px;
}

path {
  fill: none;
  stroke-width: 2.5;
  stroke-linejoin: round;
  stroke-linecap: round;
  filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.2));
}

text {
  font-size: 13px;
  fill: #333;
}

.axis-label {
  font-size: 15px;
  font-weight: bold;
  fill: #444;
}

.tooltip {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #aaa;
  padding: 8px;
  border-radius: 5px;
  pointer-events: none;
  font-size: 13px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
}
.chart-description {
  margin-top: 20px;
  font-size: 14px;
  color: #7e7e7e;
  text-align: center;
  max-width: 800px; /* Adjust width as needed */
}
</style>
