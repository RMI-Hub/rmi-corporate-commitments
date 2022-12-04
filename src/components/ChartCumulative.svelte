<script>
	import ChartData from "./ChartData.svelte";

	import { chartData } from "../stores.js";
	import * as d3 from "d3";
	import { emissionsNumberFormatter, yearFormatter } from "../utils/formatting.js";
	import throttle from "lodash.throttle";

	import ChartHeader from "./ChartHeader.svelte";

	// Chart meta
	export let header = "";
	export let definition = "";
	export let type; // "baseline" or "target"
	export let DURATION = 500;

	// Refs, etc. for the tooltip
	let tooltip;
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

			svg = d3
				.select(container)
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
		const x = d3
			.scaleBand()
			.paddingInner([0.2])
			.domain(d3.map(data, d => d.year))
			.range([0, canvasWidth]);

		const xAxis = d3.axisBottom(x).tickFormat(yearFormatter).tickSize(0).ticks(5);

		// Create the y scale for emissions
		const y = d3.scaleLinear().domain(domain).range([canvasHeight, 0]);

		// Create the function for the y Axis
		const yAxis = d3.axisLeft(y).tickFormat(emissionsNumberFormatter).ticks(5);

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
						// .classed("current-year", d => d.year.getFullYear() === 2025)
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
		tooltipText = `<strong>${d.year.getFullYear()}:</strong> ${d3.format(",.0f")(
			value
		)}`;

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
	.chart :global(.bar:is(.highlight, .current-year)) {
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

	.chart--yearly :global(.path) {
		fill: var(--color-chart);
		stroke: white;
		stroke-width: 1;
		cursor: pointer;
		transition: fill var(--speed-transition) ease-in-out;
	}
	.chart--yearly :global(.path:hover),
	.chart--yearly :global(.path.highlight) {
		fill: var(--color-chart-highlight);
	}

	.tooltip {
		font: var(--font-size-small) / 1.3em var(--sans-serif-fonts);
		width: 200px;
		border: 1px solid var(--color-slate);
		border-radius: 0.5rem;
		padding: 0.75rem;
		background-color: white;
		transition: opacity var(--speed-transition);

		position: fixed;
		top: var(--y);
		left: var(--x);
		z-index: 10;
	}

	.tooltip[hidden] {
		opacity: 0;
	}

	.tooltip span {
		display: block;
	}

	.tooltip__name {
		font-weight: bold;
		font-size: 1.2em;
		margin-bottom: 0.25rem;
	}

	@media all and (min-width: 1024px) {
		.tooltip.flip {
			transform: translate(-100%, 0);
		}
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
	<div
		hidden={tooltipHidden ? true : null}
		class="tooltip"
		class:flip={type === "target"}
		style:--x="{tooltipX}px"
		style:--y="{tooltipY}px">
		<span class="tooltip__text">{@html tooltipText}</span>
	</div>
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
