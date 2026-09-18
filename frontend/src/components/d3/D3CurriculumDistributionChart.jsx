import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

/**
 * D3CurriculumDistributionChart
 * Interactive D3 Donut chart visualizing student curriculum breakdown:
 * - Completed Courses (Emerald)
 * - In Progress Courses (Amber)
 * - Not Started / Registered (Indigo)
 *
 * Fully animated on load/state change, with slice pop-out on hover and tooltip.
 */
export default function D3CurriculumDistributionChart({
    completed = 0,
    inProgress = 0,
    notStarted = 0,
    total = 0,
    size = 180
}) {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [hoveredSlice, setHoveredSlice] = useState(null);

    const radius = size / 2;
    const innerRadius = radius * 0.62;
    const outerRadius = radius * 0.92;

    const rawData = [
        { label: 'Completed', value: completed, color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
        { label: 'In Progress', value: inProgress, color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
        { label: 'Registered', value: notStarted, color: '#6366f1', glow: 'rgba(99, 102, 241, 0.4)' }
    ];

    // Filter out zero-values for the donut, or show a single placeholder ring if total is 0
    const activeData = rawData.filter(d => d.value > 0);
    const hasData = activeData.length > 0;

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const g = svg
            .append('g')
            .attr('transform', `translate(${radius}, ${radius})`);

        if (!hasData) {
            // Empty state ring
            const emptyArc = d3.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius)
                .startAngle(0)
                .endAngle(2 * Math.PI);

            g.append('path')
                .attr('d', emptyArc)
                .attr('fill', 'rgba(148, 163, 184, 0.15)');

            g.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .attr('class', 'text-xs fill-slate-400 font-medium')
                .text('No courses');
            return;
        }

        const pie = d3.pie()
            .value(d => d.value)
            .sort(null)
            .padAngle(0.04);

        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .cornerRadius(4);

        const arcHover = d3.arc()
            .innerRadius(innerRadius * 0.96)
            .outerRadius(outerRadius * 1.06)
            .cornerRadius(5);

        const slices = g.selectAll('.slice')
            .data(pie(activeData))
            .enter()
            .append('g')
            .attr('class', 'slice')
            .style('cursor', 'pointer');

        // Path animation with arcTween
        const paths = slices.append('path')
            .attr('fill', d => d.data.color)
            .each(function (d) {
                this._current = { startAngle: 0, endAngle: 0 };
            });

        paths.transition()
            .duration(800)
            .ease(d3.easeCubicOut)
            .attrTween('d', function (d) {
                const interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function (t) {
                    return arc(interpolate(t));
                };
            });

        // Hover events
        slices
            .on('mouseenter', function (event, d) {
                d3.select(this).select('path')
                    .transition()
                    .duration(200)
                    .attr('d', arcHover)
                    .style('filter', `drop-shadow(0px 4px 8px ${d.data.glow})`);

                setHoveredSlice(d.data);
            })
            .on('mouseleave', function (event, d) {
                d3.select(this).select('path')
                    .transition()
                    .duration(200)
                    .attr('d', arc)
                    .style('filter', 'none');

                setHoveredSlice(null);
            });

    }, [completed, inProgress, notStarted, hasData, radius, innerRadius, outerRadius]);

    return (
        <div ref={containerRef} className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
                <svg
                    ref={svgRef}
                    width={size}
                    height={size}
                    className="overflow-visible"
                />

                {/* Center metric */}
                {hasData && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                            {hoveredSlice ? hoveredSlice.value : total}
                        </span>
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">
                            {hoveredSlice ? hoveredSlice.label : 'Courses'}
                        </span>
                    </div>
                )}
            </div>

            {/* Custom Dynamic Legend */}
            <div className="flex flex-col gap-1.5 text-xs">
                {rawData.map(item => {
                    const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                    const isHovered = hoveredSlice?.label === item.label;

                    return (
                        <div
                            key={item.label}
                            onMouseEnter={() => setHoveredSlice(item)}
                            onMouseLeave={() => setHoveredSlice(null)}
                            className={`flex items-center justify-between gap-3 px-2 py-1 rounded-md transition cursor-pointer ${
                                isHovered
                                    ? 'bg-slate-100 dark:bg-slate-800 font-semibold'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-slate-600 dark:text-slate-300">
                                    {item.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white">
                                <span>{item.value}</span>
                                <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
