import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

/**
 * D3UserDistributionDonut
 * Interactive D3 Donut Chart displaying system user breakdown by role:
 * - Students (Blue)
 * - Trainers (Purple)
 * - Admins (Emerald)
 */
export default function D3UserDistributionDonut({
    students = 0,
    trainers = 0,
    admins = 0,
    size = 200,
    onSelectRole
}) {
    const svgRef = useRef(null);
    const [hovered, setHovered] = useState(null);

    const radius = size / 2;
    const innerRadius = radius * 0.6;
    const outerRadius = radius * 0.9;

    const data = [
        { role: 'student', label: 'Students', count: students, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
        { role: 'trainer', label: 'Trainers', count: trainers, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
        { role: 'admin', label: 'Admins', count: admins, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' }
    ];

    const totalUsers = students + trainers + admins;
    const activeData = data.filter(d => d.count > 0);

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const g = svg.append('g')
            .attr('transform', `translate(${radius}, ${radius})`);

        if (totalUsers === 0) {
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
                .attr('class', 'text-xs fill-slate-400')
                .text('No Users');
            return;
        }

        const pie = d3.pie()
            .value(d => d.count)
            .sort(null)
            .padAngle(0.04);

        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .cornerRadius(4);

        const arcHover = d3.arc()
            .innerRadius(innerRadius * 0.95)
            .outerRadius(outerRadius * 1.06)
            .cornerRadius(6);

        const slices = g.selectAll('.slice')
            .data(pie(activeData))
            .enter()
            .append('g')
            .attr('class', 'slice')
            .style('cursor', 'pointer');

        const paths = slices.append('path')
            .attr('fill', d => d.data.color)
            .each(function () {
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

        slices
            .on('mouseenter', function (event, d) {
                d3.select(this).select('path')
                    .transition()
                    .duration(180)
                    .attr('d', arcHover)
                    .style('filter', `drop-shadow(0 4px 10px ${d.data.color}55)`);

                setHovered(d.data);
            })
            .on('mouseleave', function () {
                d3.select(this).select('path')
                    .transition()
                    .duration(180)
                    .attr('d', arc)
                    .style('filter', 'none');

                setHovered(null);
            })
            .on('click', function (event, d) {
                if (onSelectRole) onSelectRole(d.data.role);
            });

    }, [students, trainers, admins, totalUsers, radius, innerRadius, outerRadius]);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
            <div className="relative">
                <svg
                    ref={svgRef}
                    width={size}
                    height={size}
                    className="overflow-visible"
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {hovered ? hovered.count : totalUsers}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                        {hovered ? hovered.label : 'Total Users'}
                    </span>
                </div>
            </div>

            {/* Role Breakdown List */}
            <div className="flex flex-col gap-2 w-full sm:w-auto">
                {data.map(item => {
                    const pct = totalUsers > 0 ? Math.round((item.count / totalUsers) * 100) : 0;
                    const isSelected = hovered?.role === item.role;

                    return (
                        <div
                            key={item.role}
                            onClick={() => onSelectRole && onSelectRole(item.role)}
                            onMouseEnter={() => setHovered(item)}
                            onMouseLeave={() => setHovered(null)}
                            className={`flex items-center justify-between gap-4 px-3 py-2 rounded-lg border transition cursor-pointer ${
                                isSelected
                                    ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                    {item.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="font-bold text-slate-900 dark:text-white">{item.count}</span>
                                <span className="text-[11px] text-slate-400">({pct}%)</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
