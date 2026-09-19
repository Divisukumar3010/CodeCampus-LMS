import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

/**
 * D3PlatformMetrics
 * Modern interactive D3 visualization for the Home landing page.
 * Replaces the static 4-box grid with an interactive D3 radar / spark-gauge metric hub.
 *
 * Metrics:
 * - Active Courses (15+)
 * - Instructors (20+)
 * - Certificates Issued (10K+)
 * - Average Rating (4.8★)
 */
export default function D3PlatformMetrics({ isDarkMode = true, stats = null }) {
    const svgRef = useRef(null);
    const [activeMetric, setActiveMetric] = useState(0);

    const totalCourses = stats?.totalCourses ?? 15;
    const totalInstructors = stats?.totalInstructors ?? 20;
    const totalCertificates = stats?.totalCertificates ?? 10;
    const averageRating = stats?.averageRating ?? 4.8;

    const metrics = [
        {
            key: 'courses',
            label: 'Curriculum Courses',
            value: totalCourses,
            display: totalCourses > 0 ? `${totalCourses}+` : '0',
            subtitle: 'Industry-standard programs',
            max: Math.max(20, totalCourses),
            color: '#6366f1', // Indigo
            pct: Math.min(100, Math.round((totalCourses / Math.max(20, totalCourses)) * 100))
        },
        {
            key: 'instructors',
            label: 'Faculty Instructors',
            value: totalInstructors,
            display: totalInstructors > 0 ? `${totalInstructors}+` : '0',
            subtitle: 'Experienced professionals',
            max: Math.max(25, totalInstructors),
            color: '#a855f7', // Purple
            pct: Math.min(100, Math.round((totalInstructors / Math.max(25, totalInstructors)) * 100))
        },
        {
            key: 'certificates',
            label: 'Certificates Conferred',
            value: totalCertificates,
            display: totalCertificates >= 1000 ? `${(totalCertificates / 1000).toFixed(0)}K+` : `${totalCertificates}+`,
            subtitle: 'Verified credentials',
            max: Math.max(12, totalCertificates),
            color: '#10b981', // Emerald
            pct: Math.min(100, Math.round((totalCertificates / Math.max(12, totalCertificates)) * 100))
        },
        {
            key: 'rating',
            label: 'Student Rating',
            value: averageRating,
            display: `${averageRating.toFixed(1)} ★`,
            subtitle: 'Institutional excellence',
            max: 5,
            color: '#f59e0b', // Amber
            pct: Math.min(100, Math.round((averageRating / 5) * 100))
        }
    ];

    const current = metrics[activeMetric] || metrics[0];

    useEffect(() => {
        if (!svgRef.current) return;

        const size = 260;
        const radius = size / 2;
        const strokeWidth = 14;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const g = svg.append('g')
            .attr('transform', `translate(${radius}, ${radius})`);

        // Check reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Ambient particles
        const particleG = g.append('g').attr('class', 'particles');
        const particleData = d3.range(36).map(() => ({
            x: (Math.random() - 0.5) * 220,
            y: (Math.random() - 0.5) * 220,
            r: 0.8 + Math.random() * 1.4,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            opacity: 0.15 + Math.random() * 0.3
        }));

        const particles = particleG.selectAll('circle')
            .data(particleData)
            .enter()
            .append('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', d => d.r)
            .attr('fill', '#818cf8')
            .attr('opacity', d => d.opacity);

        let timer = null;
        if (!prefersReducedMotion) {
            timer = d3.timer(() => {
                particleData.forEach(d => {
                    d.x += d.speedX;
                    d.y += d.speedY;
                    if (d.x > 120) d.x = -120;
                    if (d.x < -120) d.x = 120;
                    if (d.y > 120) d.y = -120;
                    if (d.y < -120) d.y = 120;
                });
                particles.attr('cx', d => d.x).attr('cy', d => d.y);
            });
        }

        // Outer track circles for each metric (concentric rings)
        metrics.forEach((m, idx) => {
            const isHovered = activeMetric === idx;
            const ringRadius = 58 + idx * 16;
            const ringStroke = isHovered ? 11 : 8.5;

            // Background subtle track
            const bgArc = d3.arc()
                .innerRadius(ringRadius - ringStroke / 2)
                .outerRadius(ringRadius + ringStroke / 2)
                .startAngle(0)
                .endAngle(2 * Math.PI);

            g.append('path')
                .attr('d', bgArc())
                .attr('fill', isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)');

            // Foreground animated arc
            const fgArc = d3.arc()
                .innerRadius(ringRadius - ringStroke / 2)
                .outerRadius(ringRadius + ringStroke / 2)
                .startAngle(0)
                .cornerRadius(ringStroke / 2);

            const arcPath = g.append('path')
                .attr('fill', m.color)
                .style('cursor', 'pointer')
                .style('opacity', activeMetric === null ? 0.9 : isHovered ? 1 : 0.25)
                .style('filter', isHovered ? `drop-shadow(0 0 12px ${m.color})` : 'none')
                .on('mouseenter', () => setActiveMetric(idx));

            if (!prefersReducedMotion) {
                arcPath
                    .transition()
                    .duration(1600)
                    .delay(idx * 180)
                    .ease(d3.easeCubicOut)
                    .attrTween('d', () => {
                        const interpolate = d3.interpolate(0, (m.pct / 100) * 1.75 * Math.PI);
                        return (t) => fgArc({ endAngle: interpolate(t) });
                    });
            } else {
                arcPath.attr('d', fgArc({ endAngle: (m.pct / 100) * 1.75 * Math.PI }));
            }
        });

        return () => {
            if (timer) timer.stop();
        };
    }, [isDarkMode, activeMetric]);

    return (
        <div className={`backdrop-blur-xl rounded-3xl p-6 sm:p-8 border shadow-2xl transition-all ${
            isDarkMode
                ? 'bg-slate-900/60 border-slate-700/60 shadow-indigo-950/40'
                : 'bg-white/90 border-slate-200/80 shadow-blue-500/10'
        }`}>
            {/* <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/40">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
                        Live Platform Metrics
                    </span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    D3 Interactive Ring Hub
                </span>
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* D3 Concentric Radial Chart */}
                <div className="relative flex items-center justify-center">
                    <svg
                        ref={svgRef}
                        width={260}
                        height={260}
                        className="overflow-visible"
                    />

                    {/* Center Metric Display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                        <span
                            className="text-3xl sm:text-4xl font-extrabold tracking-tight transition-all duration-300"
                            style={{ color: current.color }}
                        >
                            {current.display}
                        </span>
                        <span className={`text-[11px] font-bold uppercase tracking-wider mt-1 line-clamp-1 ${
                            isDarkMode ? 'text-slate-200' : 'text-slate-700'
                        }`}>
                            {current.label}
                        </span>
                        <span className={`text-[10px] mt-0.5 ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                            {current.pct}% Capacity
                        </span>
                    </div>
                </div>

                {/* Interactive Metric Cards */}
                <div className="space-y-2.5">
                    {metrics.map((m, idx) => {
                        const isSelected = activeMetric === idx;
                        return (
                            <div
                                key={m.key}
                                onMouseEnter={() => setActiveMetric(idx)}
                                onClick={() => setActiveMetric(idx)}
                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                    isSelected
                                        ? isDarkMode
                                            ? 'bg-slate-800/90 border-indigo-500 shadow-md transform translate-x-1'
                                            : 'bg-indigo-50/80 border-indigo-400 shadow-sm transform translate-x-1'
                                        : isDarkMode
                                            ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                                            : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: m.color }}
                                    />
                                    <div>
                                        <p className={`text-xs font-bold ${
                                            isDarkMode ? 'text-slate-100' : 'text-slate-800'
                                        }`}>
                                            {m.label}
                                        </p>
                                        <p className={`text-[11px] ${
                                            isDarkMode ? 'text-slate-400' : 'text-slate-500'
                                        }`}>
                                            {m.subtitle}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className="text-base font-extrabold"
                                    style={{ color: m.color }}
                                >
                                    {m.display}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
