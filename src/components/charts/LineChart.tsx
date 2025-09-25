import React from 'react';
import * as d3 from 'd3';
import { useD3 } from '../../hooks/useD3';
import { ChartProps } from '../../types';

interface LineChartData {
  date: string | Date;
  value: number;
  series?: string;
}

interface LineChartProps extends ChartProps {
  data: LineChartData[];
  onPointClick?: (data: LineChartData) => void;
  showDots?: boolean;
  multiSeries?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 800,
  height = 400,
  className = '',
  onPointClick,
  showDots = true,
  multiSeries = false,
}) => {
  const ref = useD3(
    svg => {
      // Clear previous content
      svg.selectAll('*').remove();

      const margin = { top: 20, right: 30, bottom: 40, left: 60 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Parse dates
      const parseDate = d3.timeParse('%Y-%m-%d');
      const processedData = data.map(d => ({
        ...d,
        date: typeof d.date === 'string' ? parseDate(d.date) || new Date(d.date) : d.date,
      }));

      // Create scales
      const xScale = d3
        .scaleTime()
        .domain(d3.extent(processedData, d => d.date) as [Date, Date])
        .range([0, innerWidth]);

      const yScale = d3
        .scaleLinear()
        .domain(d3.extent(processedData, d => d.value) as [number, number])
        .range([innerHeight, 0]);

      // Create color scale for multi-series
      const seriesNames = Array.from(new Set(processedData.map(d => d.series || 'default')));
      const colorScale = d3
        .scaleOrdinal()
        .domain(seriesNames)
        .range(['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2']);

      // Create main group
      const g = svg
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Create line generator
      const line = d3
        .line<LineChartData>()
        .x(d => xScale(d.date as Date))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX);

      if (multiSeries) {
        // Group data by series
        const seriesData = d3.group(processedData, d => d.series || 'default');

        // Draw lines for each series
        seriesData.forEach((values, key) => {
          g.append('path')
            .datum(values)
            .attr('class', `line series-${key}`)
            .attr('fill', 'none')
            .attr('stroke', colorScale(key) as string)
            .attr('stroke-width', 2)
            .attr('d', line);
        });
      } else {
        // Single series
        g.append('path')
          .datum(processedData)
          .attr('class', 'line')
          .attr('fill', 'none')
          .attr('stroke', '#1890ff')
          .attr('stroke-width', 2)
          .attr('d', line);
      }

      // Add dots if enabled
      if (showDots) {
        g.selectAll('.dot')
          .data(processedData)
          .enter()
          .append('circle')
          .attr('class', 'dot')
          .attr('cx', d => xScale(d.date))
          .attr('cy', d => yScale(d.value))
          .attr('r', 4)
          .attr('fill', d => (multiSeries ? (colorScale(d.series || 'default') as string) : '#1890ff'))
          .style('cursor', onPointClick ? 'pointer' : 'default')
          .on('mouseover', function(event, d) {
            d3.select(this).attr('r', 6);

            // Tooltip
            const tooltip = d3
              .select('body')
              .append('div')
              .attr('class', 'tooltip')
              .style('position', 'absolute')
              .style('background', 'rgba(0, 0, 0, 0.8)')
              .style('color', 'white')
              .style('padding', '8px')
              .style('border-radius', '4px')
              .style('font-size', '12px')
              .style('pointer-events', 'none')
              .style('z-index', '1000');

            tooltip
              .html(
                `
              <div><strong>${d3.timeFormat('%Y-%m-%d')(d.date)}</strong></div>
              <div>Value: ${d.value.toLocaleString()}</div>
              ${d.series ? `<div>Series: ${d.series}</div>` : ''}
            `
              )
              .style('left', event.pageX + 10 + 'px')
              .style('top', event.pageY - 10 + 'px');
          })
          .on('mouseout', function() {
            d3.select(this).attr('r', 4);
            d3.selectAll('.tooltip').remove();
          })
          .on('click', function(event, d) {
            if (onPointClick) {
              onPointClick(d);
            }
          });
      }

      // Add x-axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%m/%d') as any));

      // Add y-axis
      g.append('g').call(d3.axisLeft(yScale).tickFormat(d3.format('.2s')));

      // Add x-axis label
      g.append('text')
        .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom})`)
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#666')
        .text('Date');

      // Add y-axis label
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - innerHeight / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#666')
        .text('Value');

      // Add legend for multi-series
      if (multiSeries) {
        const legend = g
          .append('g')
          .attr('class', 'legend')
          .attr('transform', `translate(${innerWidth - 100}, 20)`);

        const seriesNames = Array.from(new Set(processedData.map(d => d.series || 'default')));

        legend
          .selectAll('.legend-item')
          .data(seriesNames)
          .enter()
          .append('g')
          .attr('class', 'legend-item')
          .attr('transform', (d, i) => `translate(0, ${i * 20})`)
          .each(function(d) {
            const item = d3.select(this);

            item
              .append('rect')
              .attr('width', 12)
              .attr('height', 12)
              .attr('fill', colorScale(d) as string);

            item
              .append('text')
              .attr('x', 16)
              .attr('y', 9)
              .style('font-size', '12px')
              .style('fill', '#666')
              .text(d);
          });
      }
    },
    [data, width, height, onPointClick, showDots, multiSeries]
  );

  return (
    <div className={`line-chart ${className}`}>
      <svg ref={ref}></svg>
    </div>
  );
};

export default LineChart;
