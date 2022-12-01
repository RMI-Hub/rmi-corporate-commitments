<script>
	import { chartData } from "../stores.js";
	import { afterUpdate, onMount } from "svelte";
	import * as d3 from "d3";

	import { StackedAreaChart } from "../utils/stacked-area-chart.js";
	import ChartHeader from "./ChartHeader.svelte";

	// Chart meta
	export let yearly = {};
	export let cumulative = {};
	export let type; // "baseline" or "target"

	let canvasHeight, canvasWidth;
	let cumulativeContainer, annualContainer;
	// Cumulative placeholders
	let cumulativeSVG, annualSVG;
	let yAxisG, xAxisG, bars, barTicks;

	const DURATION = 500;
	const MARGINS = { top: 0, right: 5, bottom: 15, left: 25 };

	function render(e) {
		buildCumulativeChart();
		buildAnnualChart();
	}

	function buildCumulativeChart() {
		// CHART SCAFFOLDING
		// ------------------------------------
		const data = $chartData?.[type]?.cumulative;
		const domain = $chartData?.cumulative_domain;
		if (!data) return;

		if (!cumulativeSVG) {
			const { height, width } = cumulativeContainer.getBoundingClientRect();
			canvasHeight = height - MARGINS.top - MARGINS.bottom;
			canvasWidth = width - MARGINS.left - MARGINS.right;
			cumulativeSVG = d3
				.select(cumulativeContainer)
				.append("svg")
				.attr("height", height)
				.attr("width", width)
				.attr("viewBox", "0 0 " + width + " " + height)
				.attr("preserveAspectRatio", "xMinYMid")
				.attr("role", "img");

			// DRAW THE BARS
			bars = cumulativeSVG
				.append("g")
				.classed("bars", true)
				.attr("transform", `translate(${MARGINS.left},0)`);

			barTicks = bars
				.append("g")
				.classed("bars__ticks", true)
				.attr("transform", `translate(${canvasWidth + MARGINS.right},0)`);

			// Build yAxis now so it's atop the bars
			yAxisG = cumulativeSVG
				.append("g")
				.classed("axis", true)
				.classed("y", true)
				.attr("transform", `translate(${MARGINS.left},${MARGINS.top})`);

			// Build xAxis now so it's atop the bars
			xAxisG = cumulativeSVG
				.append("g")
				.classed("axis", true)
				.classed("x", true)
				.attr("transform", `translate(${MARGINS.left}, ${canvasHeight})`);
		}
		// DRAW THE CHART
		const x = d3
			.scaleBand()
			.paddingInner([0.2])
			.domain(d3.map(data, d => d.year))
			.range([0, canvasWidth]);

		const xAxis = d3
			.axisBottom(x)
			.tickFormat(d => {
				const year = d.getFullYear();
				if (year % 5 === 0) {
					return d3.timeFormat("%Y")(d).slice(-2) === "25"
						? d3.timeFormat("%Y")(d)
						: d3.timeFormat("\u2019%y")(d);
				}
				return "";
			})
			.tickSize(0)
			.ticks(5);

		// Create the y scale for emissions
		const y = d3.scaleLinear().domain(domain).range([canvasHeight, 0]);

		// Create the function for the y Axis
		const yAxis = d3
			.axisLeft(y)
			.tickFormat(d => d3.format(".1s")(d).replace("G", "B"))
			.ticks(5);

		// ADJUST THE RENDERED AXES
		yAxisG
			.transition()
			.duration(DURATION)
			.call(yAxis.tickSize([0]));

		xAxisG.transition().duration(DURATION).call(xAxis);

		// UPDATE THE FULLWIDTH TICKS
		barTicks
			.transition()
			.duration(DURATION)
			.call(yAxis.tickFormat("").tickSize(canvasWidth + MARGINS.right, 0, 0));

		// Add the bar chart bars
		bars
			.selectAll(".bar")
			.data(data)
			// .enter()
			.join(
				enter => {
					enter
						.append("rect")
						.classed("bar", true)
						.classed("highlight", d => d.year.getFullYear() === 2025)
						.attr("width", x.bandwidth())
						.attr("x", d => x(d.year))
						.attr("y", d => y(d[type]))
						.attr("height", d => canvasHeight - y(d[type]));
				},
				update => {
					update
						.transition()
						.duration(DURATION)
						.attr("y", d => y(d[type]))
						.attr("height", d => canvasHeight - y(d[type]));
				}
			);
	}

	function buildAnnualChart() {
		const data = $chartData?.[type]?.annual;
		const domain = $chartData?.yearly_domain;
		if (!data) return;

		// const data = $cumulative;

		const { height, width } = annualContainer.getBoundingClientRect();
		canvasHeight = height - MARGINS.top - MARGINS.bottom;
		canvasWidth = width - MARGINS.left - MARGINS.right;

		const stackedChart = StackedAreaChart(data, {
			x: d => d.year,
			y: d => d[type],
			z: d => d.name,
			width,
			height,
		});
		annualContainer.appendChild(stackedChart);
	}
</script>

<style>
	.chart {
		--controls-width: 5rem;
		position: relative;
		height: 100%;
	}

	.chart__container {
		margin-top: auto;
		height: 300px;
		position: relative;
	}

	.chart :global(.bar) {
		fill: var(--color-chart);
	}
	.chart :global(.bar.highlight) {
		fill: var(--color-chart-highlight);
	}

	.chart :global(.tick) {
		color: var(--color-gray);
		stroke-width: 0.5;
	}
	.chart :global(.bars__ticks .domain),
	.chart :global(.y.axis .domain) {
		display: none;
	}
</style>

<svelte:window on:renderCharts={render} />

<div
	class="chart chart--yearly chart--{type} stack"
	aria-labelledby="chart-yearly-{type}">
	<ChartHeader
		flip={type === "target"}
		id="chart-yearly-{type}"
		header={yearly.header}
		definition={yearly.definition} />
	<div class="chart__container" bind:this={annualContainer} />
</div>
<div
	class="chart chart--cumulative chart--{type} stack"
	aria-labelledby="chart-cumulative-{type}">
	<ChartHeader
		flip={type === "target"}
		id="chart-cumulative-{type}"
		header={cumulative.header}
		definition={cumulative.definition} />
	<div class="chart__container" bind:this={cumulativeContainer} />
</div>
