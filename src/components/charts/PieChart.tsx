import React from 'react';
import * as d3 from 'd3';
import { useD3 } from '../../hooks/useD3';
import { ChartProps } from '../../types';

interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps extends ChartProps {
  data: PieChartData[];
  onSliceClick?: (data: PieChartData) => void;
  showLabels?: boolean;
  innerRadius?: number;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  width = 400,
  height = 400,
  className = '',
  onSliceClick,
  showLabels = true,
  innerRadius = 0,
}) => {
  const ref = useD3(
    svg => {
      // Clear previous content
      svg.selectAll('*').remove();

      const radius = Math.min(width, height) / 2 - 20;
      const centerX = width / 2;
      const centerY = height / 2;

      // Create color scale
      const colorScale = d3
        .scaleOrdinal()
        .domain(data.map(d => d.name))
        .range(['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa541c']);

      // Create pie generator
      const pie = d3
        .pie<PieChartData>()
        .value(d => d.value)
        .sort(null);

      // Create arc generator
      const arc = d3
        .arc<d3.PieArcDatum<PieChartData>>()
        .innerRadius(innerRadius)
        .outerRadius(radius);

      // Create label arc (for positioning labels)
      const labelArc = d3
        .arc<d3.PieArcDatum<PieChartData>>()
        .innerRadius(radius * 0.8)
        .outerRadius(radius * 0.8);

      // Create main group
      const g = svg
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${centerX},${centerY})`);

      // Create pie slices
      const slices = g
        .selectAll('.slice')
        .data(pie(data))
        .enter()
        .append('g')
        .attr('class', 'slice');

      // Add paths for slices
      slices
        .append('path')
        .attr('d', arc)
        .attr('fill', d => d.data.color || (colorScale(d.data.name) as string))
        .style('cursor', onSliceClick ? 'pointer' : 'default')
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

          const percentage = (((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100).toFixed(1);

          tooltip
            .html(
              `
            <div><strong>${d.data.name}</strong></div>
            <div>Value: ${d.data.value.toLocaleString()}</div>
            <div>Percentage: ${percentage}%</div>
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
          if (onSliceClick) {
            onSliceClick(d.data);
          }
        });

      // Add labels if enabled
      if (showLabels) {
        slices
          .append('text')
          .attr('transform', d => `translate(${labelArc.centroid(d)})`)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .style('fill', '#333')
          .text(d => {
            const percentage = ((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100;
            return percentage > 5 ? d.data.name : ''; // Only show label if slice is large enough
          });
      }

      // Add legend
      const legend = svg
        .append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - 120}, 20)`);

      const legendItems = legend
        .selectAll('.legend-item')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 20})`);

      legendItems
        .append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', d => d.color || (colorScale(d.name) as string));

      legendItems
        .append('text')
        .attr('x', 16)
        .attr('y', 9)
        .style('font-size', '12px')
        .style('fill', '#666')
        .text(d => d.name);
    },
    [data, width, height, onSliceClick, showLabels, innerRadius]
  );

  return (
    <div className={`pie-chart ${className}`}>
      <svg ref={ref}></svg>
    </div>
  );
};

export default PieChart;
