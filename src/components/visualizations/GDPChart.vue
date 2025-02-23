<template>
  <div class="gdp-chart">
    <svg :width="width + margin.left + margin.right" 
         :height="height + margin.top + margin.bottom"
         ref="svgRef">
      <g :transform="`translate(${margin.left},${margin.top})`">
        <!-- Chart elements will be added here -->
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3';
import { onMounted, ref } from 'vue';

export default {
  name: 'GDPChart',
  props: {
    width: {
      type: Number,
      default: 960
    },
    height: {
      type: Number,
      default: 600
    }
  },
  setup(props) {
    const margin = { top: 20, right: 120, bottom: 50, left: 60 };
    const svgRef = ref(null);
    const majorEconomies = ['United States', 'China', 'Japan', 'Germany', 'United Kingdom'];
    const colors = ['red', 'orange', 'green', 'purple', 'brown'];

    const processData = (csvData) => {
      const years = Object.keys(csvData[0]).filter(key => key !== 'Country');
      
      // Process individual country data
      const countryData = csvData.map(row => ({
        country: row.Country,
        values: years.map(year => ({
          year: +year,
          value: row[year] === '' ? null : +row[year]
        })).filter(d => d.value !== null)
      })).map(country => {
        const maxValue = d3.max(country.values, d => d.value);
        const normalizedValues = country.values.map((d, i) => ({
          year: d.year,
          value: d.value,
          normalizedValue: d.value / maxValue,
          change: i > 0 ? (d.value / maxValue) - (country.values[i-1].value / maxValue) : 0
        }));
        return { country: country.country, values: normalizedValues };
      });

      // Calculate global mean and standard deviation for each year
      const yearMap = new Map();
      countryData.forEach(country => {
        country.values.forEach(v => {
          if (!yearMap.has(v.year)) yearMap.set(v.year, []);
          yearMap.get(v.year).push(v.change);
        });
      });

      const globalTrend = Array.from(yearMap.entries()).map(([year, changes]) => ({
        year,
        mean: d3.mean(changes),
        stdDev: d3.deviation(changes)
      })).sort((a, b) => a.year - b.year);

      return { countryData, globalTrend };
    };

    onMounted(async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/inflation_adjusted_gdp.csv`);
        const csvText = await response.text();
        const csvData = d3.csvParse(csvText);
        
        // Process the data
        const { countryData: data, globalTrend } = processData(csvData);

        const svg = d3.select(svgRef.value).select('g');

        // Create scales
        const xScale = d3.scaleLinear()
          .domain(d3.extent(data[0].values, d => d.year))
          .range([0, props.width]);

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

        // Create line generators with curve interpolation for smoother lines
        const line = d3.line()
          .x(d => xScale(d.year))
          .y(d => yScale(d.change))
          .defined(d => !isNaN(d.change))
          .curve(d3.curveMonotoneX); // Smooth curve interpolation

        const area = d3.area()
          .x(d => xScale(d.year))
          .y0(d => yScale(d.mean - d.stdDev))
          .y1(d => yScale(d.mean + d.stdDev))
          .curve(d3.curveMonotoneX);

        const meanLine = d3.line()
          .x(d => xScale(d.year))
          .y(d => yScale(d.mean))
          .curve(d3.curveMonotoneX);

        // Add confidence interval with animation
        const areaPath = svg.append('path')
          .datum(globalTrend)
          .attr('fill', 'lightblue')
          .attr('opacity', 0.3)
          .attr('stroke', 'none')
          .attr('d', area)
          .attr('stroke-dasharray', function() {
            const length = this.getTotalLength();
            return `${length} ${length}`;
          })
          .attr('stroke-dashoffset', function() {
            return this.getTotalLength();
          });

        areaPath.transition()
          .duration(2000)
          .attr('stroke-dashoffset', 0);

        // Add global mean line with animation
        const meanPath = svg.append('path')
          .datum(globalTrend)
          .attr('fill', 'none')
          .attr('stroke', 'darkblue')
          .attr('stroke-width', 3)
          .attr('stroke-dasharray', function() {
            const length = this.getTotalLength();
            return `${length} ${length}`;
          })
          .attr('stroke-dashoffset', function() {
            return this.getTotalLength();
          })
          .attr('d', meanLine);

        meanPath.transition()
          .duration(2000)
          .attr('stroke-dashoffset', 0);

        // Add lines for major economies with animation
        majorEconomies.forEach((country, i) => {
          const countryData = data.find(d => d.country === country);
          if (countryData) {
            const path = svg.append('path')
              .datum(countryData.values)
              .attr('fill', 'none')
              .attr('stroke', colors[i])
              .attr('stroke-width', 2)
              .attr('stroke-dasharray', function() {
                const length = this.getTotalLength();
                return `${length} ${length}`;
              })
              .attr('stroke-dashoffset', function() {
                return this.getTotalLength();
              })
              .attr('d', line);

            path.transition()
              .duration(2000)
              .attr('stroke-dashoffset', 0);
          }
        });

        // Add legend
        const legend = svg.append('g')
          .attr('transform', `translate(${props.width + 10}, 0)`);

        // Add global trend to legend
        legend.append('rect')
          .attr('x', 0)
          .attr('y', -40)
          .attr('width', 15)
          .attr('height', 15)
          .attr('fill', 'darkblue');

        legend.append('text')
          .attr('x', 20)
          .attr('y', -28)
          .text('Global Mean');

        legend.append('rect')
          .attr('x', 0)
          .attr('y', -20)
          .attr('width', 15)
          .attr('height', 15)
          .attr('fill', 'lightblue')
          .attr('opacity', 0.3);

        legend.append('text')
          .attr('x', 20)
          .attr('y', -8)
          .text('Global Variation');

        // Add country legends...

      } catch (error) {
        console.error('Error loading or processing data:', error);
      }
    });

    return {
      margin,
      svgRef
    };
  }
};
</script>

<style scoped>
.gdp-chart {
  font-family: Arial, sans-serif;
}

path {
  fill: none;
  stroke-width: 1.5;
}

text {
  font-size: 12px;
}

.axis-label {
  font-size: 14px;
}
</style>
