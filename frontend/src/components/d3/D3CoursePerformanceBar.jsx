import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

/**
 * D3CoursePerformanceBar
 * Trainer Dashboard Bar Chart comparing enrollments and ratings across courses.
 */
export default function D3CoursePerformanceBar({
    courses = [],
    height = 260
}) {
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    const [hoveredCourse, setHoveredCourse] = useState(null);

    const chartData = courses.slice(0, 8).map(c => ({
        id: c._id,
        title: c.title,
        shortTitle: c.title.length > 16 ? c.title.slice(0, 14) + '...' : c.title,
        students: c.enrollmentCount || 0,
        rating: c.averageRating || 0,
        revenue: c.revenue || 0
    }));

    useEffect(() => {
        if (!containerRef.current || !svgRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth || 550;

        const margin = { top: 20, right: 20, bottom: 44, left: 44 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        svg
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`);

        if (chartData.length === 0) {
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', height / 2)
                .attr('text-anchor', 'middle')
                .attr('class', 'text-xs fill-slate-400 font-medium')
                .text('No published course metrics available.');
            return;
        }

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const xScale = d3.scaleBand()
            .domain(chartData.map(d => d.shortTitle))
            .range([0, innerWidth])
            .padding(0.3);

        const maxStudents = d3.max(chartData, d => d.students) || 10;
        const yScale = d3.scaleLinear()
            .domain([0, maxStudents * 1.2])
            .range([innerHeight, 0]);

        // Y Gridlines
        g.append('g')
            .attr('class', 'grid')
            .call(
                d3.axisLeft(yScale)
                    .ticks(4)
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
            .call(d3.axisLeft(yScale).ticks(4));

        yAxis.select('.domain').remove();
        yAxis.selectAll('text')
            .attr('class', 'text-[10px] font-medium fill-slate-400');

        // Gradient for bars
        const defs = svg.append('defs');
        const barGrad = defs.append('linearGradient')
            .attr('id', 'trainer-bar-grad')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        barGrad.append('stop').attr('offset', '0%').attr('stop-color', '#6366f1');
        barGrad.append('stop').attr('offset', '100%').attr('stop-color', '#4338ca');

        // Bars
        const barGroups = g.selectAll('.bar-group')
            .data(chartData)
            .enter()
            .append('g')
            .attr('class', 'bar-group');

        barGroups.append('rect')
            .attr('x', d => xScale(d.shortTitle))
            .attr('width', xScale.bandwidth())
            .attr('y', innerHeight)
            .attr('height', 0)
            .attr('rx', 4)
            .attr('fill', 'url(#trainer-bar-grad)')
            .style('cursor', 'pointer')
            .on('mouseenter', function (event, d) {
                d3.select(this)
                    .transition()
                    .duration(150)
                    .attr('opacity', 0.85);

                const rect = event.currentTarget.getBoundingClientRect();
                const parentRect = container.getBoundingClientRect();

                setHoveredCourse({
                    ...d,
                    x: rect.left - parentRect.left + rect.width / 2,
                    y: rect.top - parentRect.top - 10
                });
            })
            .on('mouseleave', function () {
                d3.select(this)
                    .transition()
                    .duration(150)
                    .attr('opacity', 1);

                setHoveredCourse(null);
            })
            .transition()
            .duration(800)
            .delay((_, i) => i * 80)
            .ease(d3.easeCubicOut)
            .attr('y', d => yScale(d.students))
            .attr('height', d => Math.max(0, innerHeight - yScale(d.students)));

        // Student count top labels
        barGroups.append('text')
            .attr('x', d => xScale(d.shortTitle) + xScale.bandwidth() / 2)
            .attr('y', innerHeight)
            .attr('text-anchor', 'middle')
            .attr('class', 'text-[11px] font-bold fill-indigo-600 dark:fill-indigo-400')
            .text(d => d.students)
            .transition()
            .duration(800)
            .delay((_, i) => i * 80)
            .ease(d3.easeCubicOut)
            .attr('y', d => yScale(d.students) - 6);

    }, [chartData.length, height]);

    return (
        <div ref={containerRef} className="relative w-full">
            <svg ref={svgRef} className="overflow-visible" />

            {hoveredCourse && (
                <div
                    className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-slate-900 text-white rounded-lg p-2.5 shadow-xl text-xs space-y-1 border border-slate-700 w-44"
                    style={{ left: `${hoveredCourse.x}px`, top: `${hoveredCourse.y}px` }}
                >
                    <p className="font-semibold text-slate-100 truncate">{hoveredCourse.title}</p>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                        <span className="text-slate-400">Enrollments:</span>
                        <span className="font-bold text-white">{hoveredCourse.students}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Rating:</span>
                        <span className="text-amber-400">★ {hoveredCourse.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Revenue:</span>
                        <span className="text-emerald-400">₹{hoveredCourse.revenue?.toFixed(2) || '0.00'}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
