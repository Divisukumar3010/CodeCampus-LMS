import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

/**
 * D3GradePerformanceBar
 * Interactive animated bar chart comparing student exam results across courses.
 *
 * Features:
 * - Animated bar growth transition (d3.easeCubicOut)
 * - Passing threshold marker (70%) with subtle indicator line
 * - Interactive hover tooltips showing course title, attempts, score, and pass/fail badge
 * - Color scales mapping to score tiers (>=85% gold/emerald, 70-84% blue/indigo, <70% amber/rose)
 * - Responsive resize listener
 */
export default function D3GradePerformanceBar({
    records = [],
    height = 240,
    passingScore = 70
}) {
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    const [tooltipData, setTooltipData] = useState(null);

    // Format and sanitize records
    const chartData = records
        .filter(r => r.course && (r.exam?.totalAttempts > 0 || r.exam?.bestScore !== undefined))
        .map(r => ({
            id: r._id || r.course?._id,
            title: r.course?.title || 'Subject Exam',
            shortTitle: (r.course?.title || 'Subject').length > 18
                ? (r.course?.title || 'Subject').slice(0, 16) + '...'
                : (r.course?.title || 'Subject'),
            score: r.exam?.bestScore || 0,
            attempts: r.exam?.totalAttempts || 1,
            passed: r.exam?.hasPassed || (r.exam?.bestScore || 0) >= passingScore,
        }));

    useEffect(() => {
        if (!containerRef.current || !svgRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth || 500;

        const margin = { top: 24, right: 24, bottom: 44, left: 44 };
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
                .text('No examination scores recorded yet.');
            return;
        }

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // Scales
        const xScale = d3.scaleBand()
            .domain(chartData.map(d => d.shortTitle))
            .range([0, innerWidth])
            .padding(0.35);

        const yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([innerHeight, 0]);

        // Y Gridlines
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

        // Remove axis domain path for cleaner look
        g.select('.grid .domain').remove();

        // Passing threshold line (70%)
        const thresholdY = yScale(passingScore);
        const thresholdGroup = g.append('g').attr('class', 'threshold');

        thresholdGroup.append('line')
            .attr('x1', 0)
            .attr('x2', innerWidth)
            .attr('y1', thresholdY)
            .attr('y2', thresholdY)
            .attr('stroke', '#10b981')
            .attr('stroke-dasharray', '4 4')
            .attr('stroke-width', 1.5)
            .attr('stroke-opacity', 0.8);

        thresholdGroup.append('text')
            .attr('x', innerWidth - 4)
            .attr('y', thresholdY - 6)
            .attr('text-anchor', 'end')
            .attr('class', 'text-[10px] font-semibold fill-emerald-500 select-none')
            .text(`Pass Threshold (${passingScore}%)`);

        // X Axis
        const xAxis = g.append('g')
            .attr('transform', `translate(0, ${innerHeight})`)
            .call(d3.axisBottom(xScale).tickSize(0));

        xAxis.select('.domain').attr('stroke', 'currentColor').attr('stroke-opacity', 0.15);
        xAxis.selectAll('text')
            .attr('class', 'text-[11px] font-medium fill-slate-500 dark:fill-slate-400 select-none')
            .attr('dy', '1.2em');

        // Y Axis
        const yAxis = g.append('g')
            .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}%`));

        yAxis.select('.domain').remove();
        yAxis.selectAll('text')
            .attr('class', 'text-[10px] font-medium fill-slate-400 select-none');

        // Color helper
        const getBarColor = (score) => {
            if (score >= 85) return '#10b981'; // Emerald
            if (score >= passingScore) return '#4f46e5'; // Indigo
            return '#f59e0b'; // Amber
        };

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
            .attr('fill', d => getBarColor(d.score))
            .style('cursor', 'pointer')
            .on('mouseenter', function (event, d) {
                d3.select(this)
                    .transition()
                    .duration(150)
                    .attr('opacity', 0.85)
                    .style('filter', 'brightness(1.15)');

                const rect = event.currentTarget.getBoundingClientRect();
                const parentRect = container.getBoundingClientRect();

                setTooltipData({
                    ...d,
                    x: rect.left - parentRect.left + rect.width / 2,
                    y: rect.top - parentRect.top - 10
                });
            })
            .on('mouseleave', function () {
                d3.select(this)
                    .transition()
                    .duration(150)
                    .attr('opacity', 1)
                    .style('filter', 'none');

                setTooltipData(null);
            })
            .transition()
            .duration(850)
            .delay((_, i) => i * 90)
            .ease(d3.easeCubicOut)
            .attr('y', d => yScale(d.score))
            .attr('height', d => Math.max(0, innerHeight - yScale(d.score)));

        // Score Labels on top of bars
        barGroups.append('text')
            .attr('x', d => xScale(d.shortTitle) + xScale.bandwidth() / 2)
            .attr('y', innerHeight)
            .attr('text-anchor', 'middle')
            .attr('class', 'text-[11px] font-bold fill-slate-700 dark:fill-slate-200 select-none')
            .text(d => `${d.score}%`)
            .transition()
            .duration(850)
            .delay((_, i) => i * 90)
            .ease(d3.easeCubicOut)
            .attr('y', d => yScale(d.score) - 6);

    }, [chartData.length, height, passingScore]);

    return (
        <div ref={containerRef} className="relative w-full">
            <svg ref={svgRef} className="overflow-visible" />

            {/* Interactive Tooltip Card */}
            {tooltipData && (
                <div
                    className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-slate-900 text-white rounded-lg p-2.5 shadow-xl text-xs space-y-1 border border-slate-700 w-48 transition-all"
                    style={{ left: `${tooltipData.x}px`, top: `${tooltipData.y}px` }}
                >
                    <p className="font-semibold text-slate-100 truncate">{tooltipData.title}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                        <span className="text-slate-400">Score:</span>
                        <span className="font-bold text-white">{tooltipData.score}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Attempts:</span>
                        <span>{tooltipData.attempts}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-400">Status:</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            tooltipData.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                            {tooltipData.passed ? 'Passed' : 'Incomplete'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
