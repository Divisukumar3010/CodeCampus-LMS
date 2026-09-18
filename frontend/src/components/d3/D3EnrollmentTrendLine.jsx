import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

/**
 * D3EnrollmentTrendLine
 * 30-day enrollment area curve with interactive crosshair tracking, gradient fills, and tooltips.
 */
export default function D3EnrollmentTrendLine({ data = [], height = 240 }) {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [tooltip, setTooltip] = useState(null);

    // Fallback data if empty
    const trendData = data.length > 0 ? data : [
        { date: new Date(Date.now() - 24 * 3600 * 1000 * 25), count: 3 },
        { date: new Date(Date.now() - 24 * 3600 * 1000 * 20), count: 7 },
        { date: new Date(Date.now() - 24 * 3600 * 1000 * 15), count: 12 },
        { date: new Date(Date.now() - 24 * 3600 * 1000 * 10), count: 18 },
        { date: new Date(Date.now() - 24 * 3600 * 1000 * 5), count: 26 },
        { date: new Date(), count: 34 },
    ];

    useEffect(() => {
        if (!svgRef.current || !containerRef.current) return;

        const width = containerRef.current.clientWidth || 600;
        const margin = { top: 20, right: 25, bottom: 30, left: 35 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        svg.attr('viewBox', `0 0 ${width} ${height}`);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const xScale = d3.scaleTime()
            .domain(d3.extent(trendData, d => d.date))
            .range([0, innerWidth]);

        const maxCount = d3.max(trendData, d => d.count) || 10;
        const yScale = d3.scaleLinear()
            .domain([0, Math.ceil(maxCount * 1.25)])
            .range([innerHeight, 0]);

        // Clip path for reveal
        const clipId = 'trend-clip';
        const clip = svg.append('defs')
            .append('clipPath')
            .attr('id', clipId)
            .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('height', innerHeight + margin.top + margin.bottom);

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!prefersReducedMotion) {
            clip.attr('width', 0)
                .transition()
                .duration(1400)
                .ease(d3.easeCubicOut)
                .attr('width', innerWidth + 10);
        } else {
            clip.attr('width', innerWidth + 10);
        }

        // Gradient
        const defs = svg.append('defs');
        const grad = defs.append('linearGradient')
            .attr('id', 'enrollGrad')
            .attr('x1', '0').attr('y1', '0')
            .attr('x2', '0').attr('y2', '1');

        grad.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#6366f1')
            .attr('stop-opacity', 0.45);

        grad.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#6366f1')
            .attr('stop-opacity', 0.0);

        // Area & Line generator
        const area = d3.area()
            .x(d => xScale(d.date))
            .y0(innerHeight)
            .y1(d => yScale(d.count))
            .curve(d3.curveMonotoneX);

        const line = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.count))
            .curve(d3.curveMonotoneX);

        // Grid lines
        const yAxis = d3.axisLeft(yScale).ticks(4).tickSize(-innerWidth).tickFormat(d3.format('d'));
        const yAxisGroup = g.append('g')
            .attr('class', 'y-grid')
            .call(yAxis);

        yAxisGroup.select('.domain').remove();
        yAxisGroup.selectAll('line')
            .attr('stroke', 'rgba(255, 255, 255, 0.06)')
            .attr('stroke-dasharray', '3,3');
        yAxisGroup.selectAll('text')
            .attr('fill', '#94a3b8')
            .attr('font-size', '10px');

        // Draw clipped paths
        const clippedG = g.append('g')
            .attr('clip-path', `url(#${clipId})`);

        clippedG.append('path')
            .datum(trendData)
            .attr('fill', 'url(#enrollGrad)')
            .attr('d', area);

        clippedG.append('path')
            .datum(trendData)
            .attr('fill', 'none')
            .attr('stroke', '#6366f1')
            .attr('stroke-width', 2.5)
            .attr('d', line);

        // Data point dots
        clippedG.selectAll('circle.dot')
            .data(trendData)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => xScale(d.date))
            .attr('cy', d => yScale(d.count))
            .attr('r', 3.5)
            .attr('fill', '#6366f1')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1.5)
            .style('filter', 'drop-shadow(0 0 6px #6366f1)');

        // X-Axis
        const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat('%b %d'));
        const xAxisGroup = g.append('g')
            .attr('transform', `translate(0, ${innerHeight})`)
            .call(xAxis);

        xAxisGroup.select('.domain').attr('stroke', 'rgba(255, 255, 255, 0.1)');
        xAxisGroup.selectAll('line').attr('stroke', 'rgba(255, 255, 255, 0.1)');
        xAxisGroup.selectAll('text')
            .attr('fill', '#94a3b8')
            .attr('font-size', '10px')
            .attr('dy', '10px');

        // Interactive overlay crosshair
        const crosshair = g.append('line')
            .attr('stroke', '#818cf8')
            .attr('stroke-width', 1.5)
            .attr('stroke-dasharray', '4,3')
            .attr('y1', 0)
            .attr('y2', innerHeight)
            .style('opacity', 0)
            .style('pointer-events', 'none');

        const highlightDot = g.append('circle')
            .attr('r', 5)
            .attr('fill', '#38bdf8')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2)
            .style('filter', 'drop-shadow(0 0 8px #38bdf8)')
            .style('opacity', 0)
            .style('pointer-events', 'none');

        const bisectDate = d3.bisector(d => d.date).left;

        svg.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'transparent')
            .style('cursor', 'crosshair')
            .on('mousemove', function(event) {
                const [mx] = d3.pointer(event, g.node());
                if (mx < 0 || mx > innerWidth) return;

                const x0 = xScale.invert(mx);
                const i = bisectDate(trendData, x0, 1);
                const d0 = trendData[i - 1];
                const d1 = trendData[i];
                let d = d0;
                if (d1 && (x0 - d0.date > d1.date - x0)) {
                    d = d1;
                }

                const px = xScale(d.date);
                const py = yScale(d.count);

                crosshair
                    .attr('x1', px)
                    .attr('x2', px)
                    .style('opacity', 1);

                highlightDot
                    .attr('cx', px)
                    .attr('cy', py)
                    .style('opacity', 1);

                setTooltip({
                    x: px + margin.left,
                    y: py + margin.top,
                    date: d3.timeFormat('%B %d, %Y')(d.date),
                    count: d.count
                });
            })
            .on('mouseleave', function() {
                crosshair.style('opacity', 0);
                highlightDot.style('opacity', 0);
                setTooltip(null);
            });

    }, [trendData, height]);

    return (
        <div ref={containerRef} className="relative w-full">
            <svg
                ref={svgRef}
                className="w-full overflow-visible"
                style={{ height }}
            />
            {tooltip && (
                <div
                    className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs shadow-xl border border-indigo-500/40 backdrop-blur-md"
                    style={{ left: tooltip.x, top: tooltip.y - 12 }}
                >
                    <div className="font-semibold text-indigo-300">{tooltip.count} Enrollments</div>
                    <div className="text-[10px] text-slate-400">{tooltip.date}</div>
                </div>
            )}
        </div>
    );
}
