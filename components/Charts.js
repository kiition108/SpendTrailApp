import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Path, G, Text as SvgText } from 'react-native-svg';

/**
 * Simple Bar Chart Component
 */
export const BarChart = ({ data, style, svg, contentInset = {}, spacingInner = 0, showValues = false, showLastLabelOnly = false }) => {
    const values = data.map(d => typeof d === 'number' ? d : d.value);
    const maxValue = Math.max(...values, 1);
    const chartHeight = style?.height || 200;
    const chartWidth = style?.width || 275;
    const barWidth = (chartWidth / values.length) * (1 - spacingInner);
    const barSpacing = (chartWidth / values.length) * spacingInner;

    return (
        <Svg height={chartHeight} width={chartWidth} style={style}>
            {values.map((value, index) => {
                const topPadding = chartHeight > 60 ? 15 : 8;
                const barHeight = (value / maxValue) * (chartHeight - topPadding - 5);
                const x = (index * (chartWidth / values.length)) + (barSpacing / 2);
                const y = chartHeight - barHeight - 5;
                const shouldShowLabel = showValues && (value > 0 || index === values.length - 1) && (!showLastLabelOnly || index === values.length - 1);

                return (
                    <React.Fragment key={index}>
                        <Rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={Math.max(barHeight, 2)}
                            fill={svg?.fill || '#667eea'}
                            rx={2}
                        />
                        {shouldShowLabel && (
                            <SvgText
                                x={x + barWidth / 2}
                                y={y - 5}
                                fill={svg?.fill || '#666'}
                                fontSize="10"
                                fontWeight="bold"
                                textAnchor={index === 0 ? 'start' : index === values.length - 1 ? 'end' : 'middle'}
                                dx={index === 0 ? 5 : index === values.length - 1 ? 12 : 0}
                            >
                                {value.toFixed(0)}
                            </SvgText>
                        )}
                    </React.Fragment>
                );
            })}
        </Svg>
    );
};

/**
 * Simple Line Chart Component
 */
export const LineChart = ({ data, style, svg, contentInset = {}, showValues = false, showLastLabelOnly = false }) => {
    const values = data.map(d => typeof d === 'number' ? d : d.value);
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values, 0);
    const range = maxValue - minValue || 1;
    const chartHeight = style?.height || 200;
    const chartWidth = style?.width || 250;

    // Calculate padding once for consistency
    const topPadding = chartHeight > 60 ? 15 : 8;
    const bottomPadding = 5;
    const availableHeight = chartHeight - topPadding - bottomPadding;

    const points = values.map((value, index) => {
        const x = (index / (values.length - 1 || 1)) * chartWidth;
        const y = chartHeight - ((value - minValue) / range) * availableHeight - bottomPadding;
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
                const y = chartHeight - ((value - minValue) / range) * availableHeight - bottomPadding;
                const shouldShowLabel = showValues && (!showLastLabelOnly || index === values.length - 1);

                return (
                    <React.Fragment key={index}>
                        <Circle
                            cx={x}
                            cy={y}
                            r={4}
                            fill={svg?.stroke || '#667eea'}
                        />
                        {shouldShowLabel && (
                            <SvgText
                                x={x}
                                y={y - 10}
                                fill={svg?.stroke || '#666'}
                                fontSize="10"
                                fontWeight="bold"
                                textAnchor={index === 0 ? 'start' : index === values.length - 1 ? 'end' : 'middle'}
                                dx={index === 0 ? 5 : index === values.length - 1 ? -5 : 0}
                            >
                                {value.toFixed(0)}
                            </SvgText>
                        )}
                    </React.Fragment>
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
