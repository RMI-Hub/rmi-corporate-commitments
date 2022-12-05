<script>
	import Tooltip from "./Tooltip.svelte";

	// UTILS
	import { emissionsNumberFormatter, yearFormatter } from "../utils/formatting.js";
	import { chartData } from "../stores.js";
	import throttle from "lodash.throttle";
	import {
		stack,
		extent,
		scaleLinear,
		scaleTime,
		axisBottom,
		axisLeft,
		area,
		select,
		curveCardinal,
	} from "d3";

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

	const render = throttle((e, force = false) => {
		const data = $chartData?.[type]?.yearly;

		// This won't work if there is not data
		if (!data) return;
		const companies = $chartData.companies || [];

		if (!svg || force) {
			// Start by clearing out the container for a new chart
			container.innerHTML = "";

			const { height, width } = container.getBoundingClientRect();
			canvasHeight = height - MARGINS.top - MARGINS.bottom;
			canvasWidth = width - MARGINS.left - MARGINS.right;

			svg = select(container)
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

		const stacker = stack().keys(companies);
		const s_data = stacker(data);

		const xScale = scaleTime()
			.domain(extent(data, d => d.year))
			.range([0, canvasWidth]);

		const xAxis = axisBottom(xScale).tickFormat(yearFormatter).tickSize(0).ticks(10);

		const yScale = scaleLinear()
			.domain([0, $chartData.yearly_max])
			.range([canvasHeight, 0]);

		const yAxis = axisLeft(yScale)
			.ticks(10)
			.tickSize(0)
			.tickFormat(emissionsNumberFormatter);

		var areaGenerator = area()
			.curve(curveCardinal)
			.x(d => xScale(d.data.year))
			.y0(d => yScale(d[0]))
			.y1(d => yScale(d[1]));

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
		console.log({ clientX, clientY });
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

	.chart :global(.tick) {
		color: var(--color-gray);
		stroke-width: 0.5;
	}
	.chart :global(.ticks .domain),
	.chart :global(.y.axis .domain) {
		display: none;
	}

	.chart :global(.path) {
		fill: var(--color-chart);
		stroke: white;
		stroke-width: 1;
		cursor: pointer;
		transition: fill var(--speed-transition) ease-in-out;
	}
	.chart :global(.path:hover),
	.chart :global(.path.highlight) {
		fill: var(--color-chart-highlight);
	}

	.tooltip__name {
		font-weight: bold;
		font-size: 1.2em;
		margin-bottom: 0.25rem;
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
	<Tooltip hidden={tooltipHidden} flip={type === "target"} x={tooltipX} y={tooltipY}>
		<span class="tooltip__name">{tooltipCompany}</span>
		<span class="tooltip__commitments">{tooltipText}</span>
	</Tooltip>
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
