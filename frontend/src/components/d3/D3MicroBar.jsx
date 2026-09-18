import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * D3MicroBar
 * 7-bar mini sparkline for stat cards in Student, Trainer, and Admin dashboards.
 * Bars animate in height with soft corner rounding and customizable color.
 */
export default function D3MicroBar({ data = [4, 6, 8, 5, 9, 7, 10], color = '#6366f1' }) {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!svgRef.current) return;

        const width = 80;
        const height = 24;
        const margin = { top: 2, right: 1, bottom: 2, left: 1 };

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const values = data.length > 0 ? data.slice(-7) : [2, 3, 5, 4, 6, 5, 7];

        const xScale = d3.scaleBand()
            .domain(values.map((_, i) => i))
            .range([0, innerWidth])
            .padding(0.3);

        const maxVal = d3.max(values) || 1;
        const yScale = d3.scaleLinear()
            .domain([0, maxVal])
            .range([innerHeight, 0]);

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const bars = g.selectAll('rect')
            .data(values)
            .enter()
            .append('rect')
            .attr('x', (_, i) => xScale(i))
            .attr('width', xScale.bandwidth())
            .attr('rx', 1.5)
            .attr('fill', (_, i) => i === values.length - 1 ? color : `${color}88`);

        if (!prefersReducedMotion) {
            bars
                .attr('y', innerHeight)
                .attr('height', 0)
                .transition()
                .duration(600)
                .delay((_, i) => i * 60)
                .ease(d3.easeCubicOut)
                .attr('y', d => yScale(d))
                .attr('height', d => Math.max(2, innerHeight - yScale(d)));
        } else {
            bars
                .attr('y', d => yScale(d))
                .attr('height', d => Math.max(2, innerHeight - yScale(d)));
        }

    }, [data, color]);

    return (
        <svg
            ref={svgRef}
            viewBox="0 0 80 24"
            className="w-20 h-6 overflow-visible"
        />
    );
}
