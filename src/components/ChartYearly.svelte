<script>
	// UTILS
	import { emissionsNumberFormatter, yearFormatter } from "../utils/formatting.js";
	import { chartData } from "../stores.js";
	import * as d3 from "d3";
	import throttle from "lodash.throttle";

	// COMPONENTS
	import ChartData from "./ChartData.svelte";
	import ChartHeader from "./ChartHeader.svelte";

	// Chart meta
	export let header = "";
	export let definition = "";
	export let type; // "baseline" or "target"
	export let DURATION = 500;

	// La tooltip. Voila!
	let tooltip;
	let tooltipHidden = true;
	let tooltipX = 0;
	let tooltipY = 0;
	let tooltipCompany = "A";

	// laceholders, etc. for the chart
	let container, svg, yAxisG, xAxisG, ticks, paths;
	let canvasHeight, canvasWidth;

	// data tables
	let showData = false;

	// CONFIG
	const MARGINS = { top: 10, right: 10, bottom: 15, left: 35 };

	const tooltips = {
		A: "AAA Lorem ipsum dolor ipsum dolor ipsum dolor ipsum dolor ipsum dolor.",
		B: "BBB Lorem ipsum dolor ipsum dolor ipsum dolor ipsum dolor ipsum dolor.",
		C: "CCC Lorem ipsum dolor ipsum dolor ipsum dolor ipsum dolor ipsum dolor.",
	};
	$: tooltipText = tooltips[tooltipCompany] || "";

	const render = throttle(e => {
		const data = $chartData?.[type]?.yearly;

		// This won't work if there is not data
		if (!data) return;
		const companies = $chartData.companies || [];

		if (!svg) {
			const { height, width } = container.getBoundingClientRect();
			canvasHeight = height - MARGINS.top - MARGINS.bottom;
			canvasWidth = width - MARGINS.left - MARGINS.right;

			svg = d3
				.select(container)
				.append("svg")
				.attr("height", height)
				.attr("width", width)
				.attr("viewBox", "0 0 " + width + " " + height)
				.attr("preserveAspectRatio", "xMinYMid")
				.attr("role", "img");

			// Fullwidth ticks
			ticks = svg
				.append("g")
				.classed("ticks", true)
				.attr("transform", `translate(${width},${MARGINS.top})`);

			paths = svg
				.append("g")
				.classed("paths", true)
				.attr("transform", `translate(0,${MARGINS.top})`);

			// Build axes now so it's atop the bars
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
				.attr("transform", `translate(${MARGINS.left}, ${MARGINS.top + canvasHeight})`);
		}
		const stack = d3.stack().keys(companies);
		const s_data = stack(data);

		const xScale = d3
			.scaleTime()
			.domain(d3.extent(data, d => d.year))
			.range([0, canvasWidth]);

		const xAxis = d3.axisBottom(xScale).tickFormat(yearFormatter).tickSize(0).ticks(10);

		const yScale = d3
			.scaleLinear()
			.domain([0, $chartData.yearly_max])
			.range([canvasHeight, 0]);

		const yAxis = d3
			.axisLeft(yScale)
			.ticks(5)
			.tickSize(0)
			.tickFormat(emissionsNumberFormatter);

		var areaGenerator = d3
			.area()
			.curve(d3.curveCardinal)
			.x(function (d) {
				return xScale(d.data.year);
			})
			.y0(function (d) {
				return yScale(d[0]);
			})
			.y1(function (d) {
				return yScale(d[1]);
			});

		paths
			.selectAll(".path")
			.data(s_data)
			.join("path")
			.classed("path", true)
			.attr("data-name", d => d)
			.attr("transform", `translate(${MARGINS.left},0)`)
			.on("mouseover", mouseover)
			.on("mousemove", mousemove)
			.on("mouseleave", mouseleave)
			.transition()
			.duration(DURATION)
			.attr("d", areaGenerator);

		// Update Axes
		xAxisG.transition().duration(DURATION).call(xAxis);
		yAxisG.transition().duration(DURATION).call(yAxis);

		ticks
			.transition()
			.duration(DURATION)
			.call(yAxis.tickFormat("").tickSize(canvasWidth + MARGINS.right, 0, 0));
	}, 500);

	function mouseover(e, d) {
		tooltipCompany = d.key;
		tooltipHidden = false;
		this.classList.add("highlight");
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
	.chart :global(.ticks .domain),
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
	class="chart chart--yearly chart--{type} stack"
	aria-labelledby="chart-yearly-{type}">
	<ChartHeader
		type="{type}-yearly"
		flip={type === "target"}
		id="chart-yearly-{type}"
		{header}
		{definition}
		on:showData={e => {
			showData = true;
		}} />
	<div class="chart__container" bind:this={container} />
	<div
		hidden={tooltipHidden ? true : null}
		class="tooltip"
		class:flip={type === "target"}
		style:--x="{tooltipX}px"
		style:--y="{tooltipY}px">
		<span class="tooltip__name">{tooltipCompany}</span>
		<span class="tooltip__commitments">{tooltipText}</span>
	</div>
	{#if $chartData?.[type]?.yearly}
		<ChartData
			{type}
			cumulative={false}
			data={$chartData[type].yearly}
			visible={showData}
			on:click={e => {
				showData = false;
			}} />
	{/if}
</div>
