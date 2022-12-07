<script>
	// UTILS
	import { tick } from "svelte";
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
	import Tooltip from "./Tooltip.svelte";
	import ChartData from "./ChartData.svelte";
	import ChartHeader from "./ChartHeader.svelte";
	import X from "../icons/X.svelte";

	// Chart meta
	export let header = "";
	export let definition = "";
	export let type; // "baseline" or "target"
	export let DURATION = 500;

	// La tooltip. Voila!
	let tooltipHidden = true;
	let tooltipX = 0;
	let tooltipY = 0;
	let tooltipCompany = "A";

	// laceholders, etc. for the chart
	let container, svg, yAxisG, xAxisG, ticks, paths;
	let canvasHeight, canvasWidth;

	// config state
	let showData = false;
	let fullscreen = false;
	let chartHidden = false;

	// CONFIG
	const ENLARGE_DURATION = 200;
	const tooltips = {
		A: "AAA Lorem ipsum dolor ipsum dolor ipsum dolor ipsum dolor ipsum dolor.",
		B: "BBB Lorem ipsum dolor ipsum dolor ipsum dolor ipsum dolor ipsum dolor.",
		C: "CCC Lorem ipsum dolor ipsum dolor ipsum dolor ipsum dolor ipsum dolor.",
	};
	$: tooltipText = tooltips[tooltipCompany] || "";
	$: tickDimension = fullscreen ? 8 : 0;
	$: MARGINS = fullscreen
		? { top: 10, right: 10, bottom: 25, left: 60 }
		: { top: 10, right: 20, bottom: 15, left: 35 };
	$: fullscreen, forceRender();

	async function forceRender() {
		chartHidden = true;
		await tick();
		console.log("re-rendering for fullscreen change");
		render({}, true);
		setTimeout(() => {
			chartHidden = false;
		}, ENLARGE_DURATION);
	}

	const render = throttle((e, force = false) => {
		console.log({ e, force });
		const data = $chartData?.[type]?.yearly;

		// This won't work if there is not data
		if (!data) return;
		const companies = $chartData.companies || [];

		if (!svg || force) {
			console.log({ container });
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

		const xAxis = axisBottom(xScale)
			.tickFormat(yearFormatter)
			.tickSize(tickDimension)
			.ticks(10);

		const yScale = scaleLinear()
			.domain([0, $chartData.yearly_max])
			.range([canvasHeight, 0]);

		const yAxis = axisLeft(yScale)
			.ticks(10)
			.tickSize(tickDimension)
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

	const mousemove = e => {
		const { clientX, clientY } = e;
		tooltipX = clientX;
		tooltipY = clientY;
	};
	function mouseleave(e) {
		tooltipHidden = true;
		this.classList.remove("highlight");
	}
</script>

<style>
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

	/* FULLSCREEN */
</style>

<svelte:window
	on:renderCharts={render}
	on:resize={e => {
		render(e, true);
	}} />

<div
	class="chart chart--yearly chart--{type} stack"
	class:fullscreen
	style:--speed-transition="{ENLARGE_DURATION}ms"
	aria-labelledby="chart-yearly-{type}">
	<ChartHeader
		type="{type}-yearly"
		flip={type === "target"}
		id="chart-yearly-{type}"
		{header}
		{definition}
		on:showData={e => {
			showData = true;
		}}
		on:enlarge={async e => {
			fullscreen = true;
		}} />

	<div class="chart__wrapper">
		{#if fullscreen}
			<button
				class="control control--close"
				on:click={async e => {
					fullscreen = false;
				}}>
				<X title="Shrink this visualization back to regular size" />
			</button>
		{/if}
		<div class="chart__container" class:hidden={chartHidden} bind:this={container} />
	</div>
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
