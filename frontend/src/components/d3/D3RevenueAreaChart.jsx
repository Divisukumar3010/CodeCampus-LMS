import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

/**
 * D3RevenueAreaChart
 * Premium interactive smooth curved area & line chart for Admin & Trainer revenue analytics.
 *
 * Features:
 * - Smooth Monotone curve (d3.curveMonotoneX)
 * - Animated path stroke & gradient area fill
 * - Dual metrics: Revenue (₹) and Orders
 * - Interactive hover cursor overlay displaying crosshair and synchronized tooltip card
 * - Automatic window resize handling
 */
export default function D3RevenueAreaChart({
    data = [],
    height = 300,
    metric = 'revenue' // 'revenue' | 'orders' | 'both'
}) {
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    const [hoverData, setHoverData] = useState(null);

    useEffect(() => {
        if (!containerRef.current || !svgRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth || 600;

        const margin = { top: 20, right: 30, bottom: 40, left: 50 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        svg
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`);

        if (!data || data.length === 0) {
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', height / 2)
                .attr('text-anchor', 'middle')
                .attr('class', 'text-xs fill-slate-400 font-medium')
                .text('No transaction trend data available.');
            return;
        }

        // Defs for gradients
        const defs = svg.append('defs');

        const revenueGrad = defs.append('linearGradient')
            .attr('id', 'revenue-area-grad')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        revenueGrad.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#4f46e5')
            .attr('stop-opacity', 0.45);

        revenueGrad.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#4f46e5')
            .attr('stop-opacity', 0.02);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // Scales
        const xScale = d3.scalePoint()
            .domain(data.map(d => d.month))
            .range([0, innerWidth])
            .padding(0.2);

        const maxRevenue = d3.max(data, d => d.revenue) || 100;
        const yScale = d3.scaleLinear()
            .domain([0, maxRevenue * 1.15])
            .range([innerHeight, 0]);

        // Background gridlines
        g.append('g')
            .attr('class', 'grid')
            .call(
                d3.axisLeft(yScale)
                    .ticks(5)
                    .tickSize(-innerWidth)
                    .tickFormat('')
            )
            .selectAll('line')
            .attr('stroke', 'currentColor')
            .attr('stroke-opacity', 0.08);

        g.select('.grid .domain').remove();

        // X Axis
        const xAxis = g.append('g')
            .attr('transform', `translate(0, ${innerHeight})`)
            .call(d3.axisBottom(xScale).tickSize(0));

        xAxis.select('.domain').attr('stroke', 'currentColor').attr('stroke-opacity', 0.15);
        xAxis.selectAll('text')
            .attr('class', 'text-[11px] font-medium fill-slate-500 dark:fill-slate-400')
            .attr('dy', '1.2em');

        // Y Axis
        const yAxis = g.append('g')
            .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `₹${d}`));

        yAxis.select('.domain').remove();
        yAxis.selectAll('text')
            .attr('class', 'text-[10px] font-medium fill-slate-400');

        // Line and Area Generators
        const lineGenerator = d3.line()
            .x(d => xScale(d.month))
            .y(d => yScale(d.revenue))
            .curve(d3.curveMonotoneX);

        const areaGenerator = d3.area()
            .x(d => xScale(d.month))
            .y0(innerHeight)
            .y1(d => yScale(d.revenue))
            .curve(d3.curveMonotoneX);

        // Area Path with fade-in
        g.append('path')
            .datum(data)
            .attr('fill', 'url(#revenue-area-grad)')
            .attr('d', areaGenerator)
            .attr('opacity', 0)
            .transition()
            .duration(800)
            .attr('opacity', 1);

        // Line Path with stroke-dasharray draw animation
        const linePath = g.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', '#4f46e5')
            .attr('stroke-width', 3)
            .attr('stroke-linecap', 'round')
            .attr('d', lineGenerator);

        const totalLength = linePath.node().getTotalLength ? linePath.node().getTotalLength() : 600;

        linePath
            .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(1100)
            .ease(d3.easeCubicOut)
            .attr('stroke-dashoffset', 0);

        // Data points (Dots)
        const dots = g.selectAll('.data-dot')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'data-dot')
            .attr('cx', d => xScale(d.month))
            .attr('cy', d => yScale(d.revenue))
            .attr('r', 0)
            .attr('fill', '#ffffff')
            .attr('stroke', '#4f46e5')
            .attr('stroke-width', 2.5);

        dots.transition()
            .duration(800)
            .delay((_, i) => 600 + i * 50)
            .attr('r', 4.5);

        // Crosshair vertical line
        const focusLine = g.append('line')
            .attr('stroke', '#6366f1')
            .attr('stroke-width', 1.5)
            .attr('stroke-dasharray', '3 3')
            .attr('y1', 0)
            .attr('y2', innerHeight)
            .style('opacity', 0);

        // Hover Overlay
        const overlay = g.append('rect')
            .attr('width', innerWidth)
            .attr('height', innerHeight)
            .attr('fill', 'transparent')
            .style('cursor', 'crosshair');

        overlay
            .on('mousemove', function (event) {
                const [mouseX] = d3.pointer(event);
                // Find closest point
                let closest = data[0];
                let closestDist = Infinity;

                data.forEach(d => {
                    const dist = Math.abs(xScale(d.month) - mouseX);
                    if (dist < closestDist) {
                        closestDist = dist;
                        closest = d;
                    }
                });

                if (closest) {
                    const cx = xScale(closest.month);
                    const cy = yScale(closest.revenue);

                    focusLine
                        .attr('x1', cx)
                        .attr('x2', cx)
                        .style('opacity', 0.7);

                    dots.attr('r', d => (d === closest ? 7 : 4.5))
                        .attr('stroke-width', d => (d === closest ? 3 : 2.5));

                    const containerBox = container.getBoundingClientRect();
                    setHoverData({
                        month: closest.month,
                        revenue: closest.revenue,
                        orders: closest.orders,
                        x: cx + margin.left,
                        y: cy + margin.top
                    });
                }
            })
            .on('mouseleave', function () {
                focusLine.style('opacity', 0);
                dots.attr('r', 4.5).attr('stroke-width', 2.5);
                setHoverData(null);
            });

    }, [data, height]);

    return (
        <div ref={containerRef} className="relative w-full">
            <svg ref={svgRef} className="overflow-visible" />

            {/* Interactive hover tooltip badge */}
            {hoverData && (
                <div
                    className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 bg-slate-900/95 backdrop-blur-sm text-white rounded-lg p-3 shadow-xl text-xs space-y-1.5 border border-slate-700 min-w-[140px]"
                    style={{ left: `${hoverData.x}px`, top: `${hoverData.y}px` }}
                >
                    <div className="font-semibold text-slate-200 pb-1 border-b border-slate-800">
                        {hoverData.month}
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400">Revenue:</span>
                        <span className="font-bold text-emerald-400">₹{hoverData.revenue?.toFixed(2)}</span>
                    </div>
                    {hoverData.orders !== undefined && (
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Orders:</span>
                            <span className="font-medium text-indigo-300">{hoverData.orders} orders</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
