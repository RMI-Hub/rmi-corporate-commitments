<script>
	import ChartData from "./ChartData.svelte";

	import { chartData } from "../stores.js";
	import { scaleBand, format, scaleLinear, axisBottom, axisLeft, select } from "d3";
	import { emissionsNumberFormatter, yearFormatter } from "../utils/formatting.js";
	import throttle from "lodash.throttle";

	import Tooltip from "./Tooltip.svelte";
	import ChartHeader from "./ChartHeader.svelte";

	// Chart meta
	export let header = "";
	export let definition = "";
	export let type; // "baseline" or "target"
	export let DURATION = 500;

	// Refs, etc. for the tooltip
	let tooltipText = "";
	let tooltipHidden = true;
	let tooltipX = 0;
	let tooltipY = 0;

	// placeholders and things for the chart
	let canvasHeight, canvasWidth;
	let container;
	let svg;
	let yAxisG, xAxisG, bars, barTicks;

	// data tables
	let showData = false;

	const MARGINS = { top: 0, right: 5, bottom: 15, left: 25 };

	const render = throttle((e, force = false) => {
		// CHART SCAFFOLDING
		// ------------------------------------
		const data = $chartData?.[type]?.cumulative;
		const domain = $chartData?.cumulative_domain;
		if (!data) return;

		if (!svg || force) {
			const { height, width } = container.getBoundingClientRect();
			canvasHeight = height - MARGINS.top - MARGINS.bottom;
			canvasWidth = width - MARGINS.left - MARGINS.right;

			container.innerHTML = "";

			svg = select(container)
				.append("svg")
				.attr("height", height)
				.attr("width", width)
				.attr("viewBox", `0 0 ${width} ${height}`)
				.attr("preserveAspectRatio", "xMinYMid")
				.attr("role", "img");

			// DRAW THE BARS
			bars = svg
				.append("g")
				.classed("bars", true)
				.attr("transform", `translate(${MARGINS.left},0)`);

			barTicks = bars
				.append("g")
				.classed("bars__ticks", true)
				.attr("transform", `translate(${canvasWidth + MARGINS.right},0)`);

			// Build yAxis now so it's atop the bars
			yAxisG = svg
				.append("g")
				.classed("axis", true)
				.classed("y", true)
				.attr("transform", `translate(${MARGINS.left},${MARGINS.top})`);

			// Build xAxis now so it's atop the bars
			xAxisG = svg
				.append("g")
				.classed("axis", true)
				.classed("x", true)
				.attr("transform", `translate(${MARGINS.left}, ${canvasHeight})`);
		}
		// DRAW THE CHART
		const x = scaleBand()
			.paddingInner([0.2])
			.domain(data.map(d => d.year))
			.range([0, canvasWidth]);

		const xAxis = axisBottom(x).tickFormat(yearFormatter).tickSize(0).ticks(5);

		// Create the y scale for emissions
		const y = scaleLinear().domain(domain).range([canvasHeight, 0]);

		// Create the function for the y Axis
		const yAxis = axisLeft(y).tickFormat(emissionsNumberFormatter).ticks(5);

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
			.join(
				enter => {
					enter
						.append("rect")
						.classed("bar", true)
						.classed("current", d => {
							return d.year.getFullYear() === 2025;
						})
						.attr("width", x.bandwidth())
						.attr("x", d => x(d.year))
						.attr("y", d => y(d[type]))
						.attr("height", d => canvasHeight - y(d[type]))
						.on("mouseover", mouseover)
						.on("mousemove", mousemove)
						.on("mouseleave", mouseleave);
				},
				update => {
					update
						.transition()
						.duration(DURATION)
						.attr("y", d => y(d[type]))
						.attr("height", d => canvasHeight - y(d[type]));
				}
			);
	}, 500);
	function mouseover(e, d) {
		// POSITION IT
		const { clientX, clientY } = e;
		tooltipX = clientX;
		tooltipY = clientY;

		// POPULATE IT
		const value = d.target || d.baseline;
		tooltipText = `<strong>${d.year.getFullYear()}:</strong> ${format(",.0f")(value)}`;

		// Style it
		this.classList.add("highlight");
		// UNHIDE IT
		tooltipHidden = false;
	}

	function mousemove(e) {
		const { clientX, clientY } = e;
		tooltipX = clientX;
		tooltipY = clientY;
	}
	function mouseleave(e) {
		tooltipHidden = true;
		this.classList.remove("highlight");
	}
</script>

<style>
	.chart {
		position: relative;
		overflow: visible;
		height: 100%;
	}

	.stack .chart__container {
		margin-top: auto;
		height: 300px;
		position: relative;
	}

	.chart :global(.bar) {
		fill: var(--color-chart);
	}
	.chart :global(.bar:is(.highlight, .current)) {
		fill: var(--color-chart-highlight);
	}

	.chart :global(.tick) {
		color: var(--color-gray);
		stroke-width: 0.5;
	}
	.chart :global(.bars__ticks .domain),
	.chart :global(.annualTicks .domain),
	.chart :global(.y.axis .domain) {
		display: none;
	}
</style>

<svelte:window
	on:renderCharts={render}
	on:resize={e => {
		render(e, true);
	}} />

<div
	class="chart chart--cumulative chart--{type} stack"
	aria-labelledby="chart-cumulative-{type}">
	<ChartHeader
		on:showData={e => {
			showData = true;
		}}
		flip={type === "target"}
		id="chart-cumulative-{type}"
		{header}
		{definition} />
	<div class="chart__container" bind:this={container} />
	<Tooltip hidden={tooltipHidden} flip={type === "target"} x={tooltipX} y={tooltipY}>
		<span class="tooltip__text">{@html tooltipText}</span>
	</Tooltip>
	{#if $chartData?.[type]?.cumulative}
		<ChartData
			{type}
			cumulative={true}
			data={$chartData[type].cumulative}
			visible={showData}
			on:click={e => {
				showData = false;
			}} />
	{/if}
</div>
