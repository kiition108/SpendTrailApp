import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Path, G, Text as SvgText } from 'react-native-svg';

/**
 * Simple Bar Chart Component
 */
export const BarChart = ({ data, style, svg, contentInset = {}, spacingInner = 0 }) => {
    const values = data.map(d => typeof d === 'number' ? d : d.value);
    const maxValue = Math.max(...values, 1);
    const chartHeight = style?.height || 200;
    const chartWidth = style?.width || 300;
    const barWidth = (chartWidth / values.length) * (1 - spacingInner);
    const barSpacing = (chartWidth / values.length) * spacingInner;

    return (
        <Svg height={chartHeight} width={chartWidth} style={style}>
            {values.map((value, index) => {
                const barHeight = (value / maxValue) * chartHeight * 0.9;
                const x = (index * (chartWidth / values.length)) + (barSpacing / 2);
                const y = chartHeight - barHeight - (chartHeight * 0.05);

                return (
                    <Rect
                        key={index}
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        fill={svg?.fill || '#667eea'}
                        rx={2}
                    />
                );
            })}
        </Svg>
    );
};

/**
 * Simple Line Chart Component
 */
export const LineChart = ({ data, style, svg, contentInset = {} }) => {
    const values = data.map(d => typeof d === 'number' ? d : d.value);
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values, 0);
    const range = maxValue - minValue || 1;
    const chartHeight = style?.height || 200;
    const chartWidth = style?.width || 300;

    const points = values.map((value, index) => {
        const x = (index / (values.length - 1 || 1)) * chartWidth;
        const y = chartHeight - ((value - minValue) / range) * chartHeight * 0.9;
        return `${x},${y}`;
    }).join(' ');

    const pathData = `M ${points.split(' ')[0]} L ${points}`;

    return (
        <Svg height={chartHeight} width={chartWidth} style={style}>
            <Path
                d={pathData}
                stroke={svg?.stroke || '#667eea'}
                strokeWidth={svg?.strokeWidth || 2}
                fill="none"
            />
            {values.map((value, index) => {
                const x = (index / (values.length - 1 || 1)) * chartWidth;
                const y = chartHeight - ((value - minValue) / range) * chartHeight * 0.9;
                return (
                    <Circle
                        key={index}
                        cx={x}
                        cy={y}
                        r={4}
                        fill={svg?.stroke || '#667eea'}
                    />
                );
            })}
        </Svg>
    );
};

/**
 * Simple Pie Chart Component
 */
export const PieChart = ({ data, style, innerRadius = 0, outerRadius }) => {
    const chartSize = style?.height || 200;
    const radius = outerRadius || (chartSize / 2) * 0.8;
    const centerX = chartSize / 2;
    const centerY = chartSize / 2;

    const total = data.reduce((sum, item) => sum + item.value, 0);

    let currentAngle = -90; // Start from top

    const slices = data.map((item, index) => {
        const sliceAngle = (item.value / total) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + sliceAngle;

        currentAngle = endAngle;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = centerX + radius * Math.cos(startRad);
        const y1 = centerY + radius * Math.sin(startRad);
        const x2 = centerX + radius * Math.cos(endRad);
        const y2 = centerY + radius * Math.sin(endRad);

        const largeArc = sliceAngle > 180 ? 1 : 0;

        const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

        return { pathData, color: item.svg?.fill || `hsl(${(index * 360) / data.length}, 70%, 60%)` };
    });

    return (
        <Svg height={chartSize} width={chartSize} style={style}>
            {slices.map((slice, index) => (
                <Path key={index} d={slice.pathData} fill={slice.color} />
            ))}
        </Svg>
    );
};

/**
 * Grid Component (Placeholder)
 */
export const Grid = () => null;

/**
 * XAxis Component (Placeholder)
 */
export const XAxis = () => null;
