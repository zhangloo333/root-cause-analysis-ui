import React from 'react';
import * as d3 from 'd3';
import { useD3 } from '../../hooks/useD3';
import { ChartProps } from '../../types';

interface BarChartData {
  name: string;
  value: number;
  change?: number;
}

interface BarChartProps extends ChartProps {
  data: BarChartData[];
  onBarClick?: (data: BarChartData) => void;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  width = 800,
  height = 400,
  className = '',
  onBarClick,
}) => {
  const ref = useD3(
    svg => {
      // Clear previous content
      svg.selectAll('*').remove();

      const margin = { top: 20, right: 30, bottom: 40, left: 60 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Create scales
      const xScale = d3
        .scaleBand()
        .domain(data.map(d => d.name))
        .range([0, innerWidth])
        .padding(0.1);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, d => d.value) || 0])
        .range([innerHeight, 0]);

      // Create color scale
      const colorScale = d3
        .scaleOrdinal()
        .domain(data.map(d => d.name))
        .range(['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2']);

      // Create main group
      const g = svg
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Add bars
      g.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.name) || 0)
        .attr('y', d => yScale(d.value))
        .attr('width', xScale.bandwidth())
        .attr('height', d => innerHeight - yScale(d.value))
        .attr('fill', d => colorScale(d.name) as string)
        .style('cursor', onBarClick ? 'pointer' : 'default')
        .on('mouseover', function(event, d) {
          d3.select(this).attr('opacity', 0.8);

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
            <div><strong>${d.name}</strong></div>
            <div>Value: ${d.value.toLocaleString()}</div>
            ${
              d.change !== undefined
                ? `<div>Change: ${d.change >= 0 ? '+' : ''}${d.change.toFixed(1)}%</div>`
                : ''
            }
          `
            )
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 10 + 'px');
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity', 1);
          d3.selectAll('.tooltip').remove();
        })
        .on('click', function(event, d) {
          if (onBarClick) {
            onBarClick(d);
          }
        });

      // Add value labels on bars
      g.selectAll('.label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => (xScale(d.name) || 0) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.value) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#666')
        .text(d => (d.value > 1000000 ? `${(d.value / 1000000).toFixed(1)}M` : d.value.toLocaleString()));

      // Add x-axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');

      // Add y-axis
      g.append('g').call(d3.axisLeft(yScale).tickFormat(d3.format('.2s')));

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
    },
    [data, width, height, onBarClick]
  );

  return (
    <div className={`bar-chart ${className}`}>
      <svg ref={ref}></svg>
    </div>
  );
};

export default BarChart;
