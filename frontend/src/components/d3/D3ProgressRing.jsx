import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * D3ProgressRing
 * Smooth animated radial gauge for lesson/course completion percentage.
 *
 * @param {number} percent - Completion percent (0 - 100)
 * @param {number} size - Outer diameter in px (default 120)
 * @param {number} strokeWidth - Thickness of ring (default 10)
 * @param {string} color - Primary progress stroke color (default indigo-500 #6366f1)
 * @param {string} trackColor - Background track color (default rgba(255,255,255,0.15) or slate-200)
 * @param {string} label - Optional small label under percentage
 * @param {boolean} showValue - Show animated center text (default true)
 * @param {string} textColor - Text color class or hex (default inherit)
 */
export default function D3ProgressRing({
    percent = 0,
    size = 110,
    strokeWidth = 9,
    color = '#6366f1',
    trackColor = 'rgba(148, 163, 184, 0.2)',
    label = '',
    showValue = true,
    textColor = 'currentColor'
}) {
    const svgRef = useRef(null);
    const previousPercentRef = useRef(0);

    const radius = (size - strokeWidth) / 2;
    const clampedPercent = Math.max(0, Math.min(100, Math.round(percent || 0)));

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        const prevPercent = previousPercentRef.current;
        previousPercentRef.current = clampedPercent;

        // Two pi is full circle
        const arc = d3.arc()
            .innerRadius(radius - strokeWidth / 2)
            .outerRadius(radius + strokeWidth / 2)
            .startAngle(0)
            .cornerRadius(strokeWidth / 2);

        const progressPath = svg.select('.progress-arc');
        const textValue = svg.select('.progress-text');

        // Smooth transition using d3.interpolate
        progressPath
            .transition()
            .duration(900)
            .ease(d3.easeCubicOut)
            .attrTween('d', () => {
                const interpolateAngle = d3.interpolate(
                    (prevPercent / 100) * 2 * Math.PI,
                    (clampedPercent / 100) * 2 * Math.PI
                );
                return (t) => {
                    return arc({ endAngle: interpolateAngle(t) });
                };
            });

        // Numeric text transition
        if (showValue && textValue.node()) {
            textValue
                .transition()
                .duration(900)
                .ease(d3.easeCubicOut)
                .tween('text', () => {
                    const interpolateVal = d3.interpolateNumber(prevPercent, clampedPercent);
                    return (t) => {
                        textValue.text(`${Math.round(interpolateVal(t))}%`);
                    };
                });
        }
    }, [clampedPercent, radius, strokeWidth, showValue]);

    // Initial background path
    const backgroundArc = d3.arc()
        .innerRadius(radius - strokeWidth / 2)
        .outerRadius(radius + strokeWidth / 2)
        .startAngle(0)
        .endAngle(2 * Math.PI);

    return (
        <div className="relative inline-flex flex-col items-center justify-center">
            <svg
                ref={svgRef}
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="overflow-visible"
            >
                <defs>
                    <linearGradient id={`ring-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={color} />
                        <stop offset="100%" stopColor={clampedPercent >= 100 ? '#10b981' : color} />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor={color} floodOpacity="0.35" />
                    </filter>
                </defs>

                <g transform={`translate(${size / 2}, ${size / 2})`}>
                    {/* Background track */}
                    <path
                        d={backgroundArc()}
                        fill={trackColor}
                    />

                    {/* Animated foreground arc */}
                    <path
                        className="progress-arc"
                        fill={`url(#ring-grad-${size})`}
                        filter="url(#glow)"
                        d={d3.arc()
                            .innerRadius(radius - strokeWidth / 2)
                            .outerRadius(radius + strokeWidth / 2)
                            .startAngle(0)
                            .endAngle((clampedPercent / 100) * 2 * Math.PI)
                            .cornerRadius(strokeWidth / 2)()
                        }
                    />

                    {/* Center Percentage */}
                    {showValue && (
                        <text
                            className="progress-text font-bold select-none"
                            textAnchor="middle"
                            dy={label ? '-0.1em' : '0.35em'}
                            fontSize={size * 0.22}
                            fill={textColor}
                        >
                            {clampedPercent}%
                        </text>
                    )}

                    {label && (
                        <text
                            textAnchor="middle"
                            dy="1.35em"
                            fontSize={size * 0.1}
                            className="font-medium opacity-75 select-none"
                            fill={textColor}
                        >
                            {label}
                        </text>
                    )}
                </g>
            </svg>
        </div>
    );
}
