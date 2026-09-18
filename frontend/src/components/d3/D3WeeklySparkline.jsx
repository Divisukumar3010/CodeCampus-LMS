import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * D3WeeklySparkline
 * Renders an ambient 7-day lesson completion trendline in the LMSLayout sidebar.
 * Features auto-drawing stroke-dasharray and soft indigo area fill.
 */
export default function D3WeeklySparkline({ data = [2, 4, 3, 6, 5, 8, 7] }) {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!svgRef.current) return;

        const width = 120;
        const height = 36;
        const margin = { top: 4, right: 4, bottom: 4, left: 4 };

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const values = data.length > 0 ? data : [1, 2, 1, 3, 2, 4, 3];

        const xScale = d3.scaleLinear()
            .domain([0, values.length - 1])
            .range([0, innerWidth]);

        const yScale = d3.scaleLinear()
            .domain([0, Math.max(d3.max(values) || 1, 5)])
            .range([innerHeight, 0]);

        // Gradient
        const defs = svg.append('defs');
        const grad = defs.append('linearGradient')
            .attr('id', 'sparkGrad')
            .attr('x1', '0').attr('y1', '0')
            .attr('x2', '0').attr('y2', '1');

        grad.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#6366f1')
            .attr('stop-opacity', 0.4);

        grad.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#6366f1')
            .attr('stop-opacity', 0.0);

        // Area
        const area = d3.area()
            .x((_, i) => xScale(i))
            .y0(innerHeight)
            .y1(d => yScale(d))
            .curve(d3.curveMonotoneX);

        g.append('path')
            .datum(values)
            .attr('fill', 'url(#sparkGrad)')
            .attr('d', area);

        // Line
        const line = d3.line()
            .x((_, i) => xScale(i))
            .y(d => yScale(d))
            .curve(d3.curveMonotoneX);

        const path = g.append('path')
            .datum(values)
            .attr('fill', 'none')
            .attr('stroke', '#6366f1')
            .attr('stroke-width', 2)
            .attr('d', line);

        // Check reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!prefersReducedMotion && path.node()) {
            const totalLength = path.node().getTotalLength();
            path
                .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
                .attr('stroke-dashoffset', totalLength)
                .transition()
                .duration(1000)
                .ease(d3.easeCubicOut)
                .attr('stroke-dashoffset', 0);
        }

        // Current end dot
        const lastIdx = values.length - 1;
        g.append('circle')
            .attr('cx', xScale(lastIdx))
            .attr('cy', yScale(values[lastIdx]))
            .attr('r', 2.5)
            .attr('fill', '#818cf8')
            .style('filter', 'drop-shadow(0 0 4px #6366f1)');

    }, [data]);

    return (
        <div className="flex flex-col gap-1 py-1">
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                This week's momentum
            </span>
            <svg
                ref={svgRef}
                viewBox="0 0 120 36"
                className="w-full h-9 overflow-visible"
            />
        </div>
    );
}
