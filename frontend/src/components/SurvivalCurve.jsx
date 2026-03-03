import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const SurvivalCurve = ({ data }) => {
    const d3Container = useRef(null);

    useEffect(() => {
        if (data && d3Container.current) {
            // Clear before redraw
            d3.select(d3Container.current).selectAll('*').remove();

            const margin = { top: 20, right: 30, bottom: 30, left: 40 };
            const width = 600 - margin.left - margin.right;
            const height = 300 - margin.top - margin.bottom;

            const svg = d3.select(d3Container.current)
                .append('svg')
                .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .attr('width', '100%')
                .attr('height', '100%')
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            // X scale (years)
            const x = d3.scaleLinear()
                .domain(d3.extent(data, d => d.year))
                .range([0, width]);

            const xAxis = d3.axisBottom(x).tickFormat(d3.format("d")).ticks(10);
            svg.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(xAxis)
                .selectAll('text')
                .attr('fill', '#71717a')
                .style('font-size', '10px')
                .style('font-family', 'Inter, sans-serif');

            // Y scale (probability)
            const y = d3.scaleLinear()
                .domain([0, 100])
                .range([height, 0]);

            const yAxis = d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`);
            svg.append('g')
                .call(yAxis)
                .selectAll('text')
                .attr('fill', '#71717a')
                .style('font-size', '10px')
                .style('font-family', 'Inter, sans-serif');

            // Add a threshold line (50%)
            svg.append("path")
                .datum([{ year: data[0].year, p: 50 }, { year: data[data.length - 1].year, p: 50 }])
                .attr("fill", "none")
                .attr("stroke", "#ef4444")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "4,4")
                .attr("opacity", 0.3)
                .attr("d", d3.line().x(d => x(d.year)).y(d => y(d.p)));

            // Color gradient block (Quantum Shadow)
            const defs = svg.append('defs');

            // Area Gradient
            const areaGradient = defs.append('linearGradient')
                .attr('id', 'shadowGradient')
                .attr('x1', '0%').attr('x2', '0%')
                .attr('y1', '0%').attr('y2', '100%');

            areaGradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', '#3b82f6')
                .attr('stop-opacity', 0.2);

            areaGradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', '#3b82f6')
                .attr('stop-opacity', 0);

            // Pulse Glow Filter
            const filter = defs.append('filter').attr('id', 'blueGlow');
            filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
            filter.append('feMerge').selectAll('feMergeNode').data(['blur', 'SourceGraphic']).enter()
                .append('feMergeNode').attr('in', d => d);

            // Area generator
            const getArea = d3.area()
                .x(d => x(d.year))
                .y0(height)
                .y1(d => y(d.survival_probability))
                .curve(d3.curveMonotoneX);

            // Line generator
            const getLine = d3.line()
                .x(d => x(d.year))
                .y(d => y(d.survival_probability))
                .curve(d3.curveMonotoneX);

            // Add the area
            svg.append('path')
                .datum(data)
                .attr('fill', 'url(#shadowGradient)')
                .attr('d', getArea);

            // Add the glowing background line
            svg.append('path')
                .datum(data)
                .attr('fill', 'none')
                .attr('stroke', '#3b82f6')
                .attr('stroke-width', 4)
                .attr('opacity', 0.1)
                .attr('filter', 'url(#blueGlow)')
                .attr('d', getLine);

            // Add the main line
            svg.append('path')
                .datum(data)
                .attr('fill', 'none')
                .attr('stroke', '#3b82f6')
                .attr('stroke-width', 2)
                .attr('d', getLine);

            // Interactive points
            svg.selectAll('.dot')
                .data(data.filter((_, i) => i % 2 === 0))
                .enter().append('circle')
                .attr('cx', d => x(d.year))
                .attr('cy', d => y(d.survival_probability))
                .attr('r', 3)
                .attr('fill', '#09090b')
                .attr('stroke', '#3b82f6')
                .attr('stroke-width', 1.5);

            svg.selectAll(".domain").attr("stroke", "#27272a");
            svg.selectAll(".tick line").attr("stroke", "#27272a");
        }
    }, [data]);

    return (
        <div className="w-full flex justify-center items-center overflow-x-auto">
            <div ref={d3Container} />
        </div>
    );
};

export default SurvivalCurve;
