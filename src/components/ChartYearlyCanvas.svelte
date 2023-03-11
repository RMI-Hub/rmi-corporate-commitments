<script>
	// UTILS
	import { tick } from "svelte";
	import { emissionsNumberFormatter, yearFormatter } from "../utils/formatting.js";
	import { chartData, isLoading } from "../stores.js";
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
		stackOrderDescending,
	} from "d3";

	// COMPONENTS
	import Tooltip from "./Tooltip.svelte";
	import ChartData from "./ChartData.svelte";
	import ChartHeader from "./ChartHeader.svelte";
	import X from "../icons/X.svelte";
	import Loading from "./Loading.svelte";

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
	let DPI = typeof window === "object" ? window.devicePixelRatio : 2;

	// Placeholders, etc. for the chart
	let container, svg, yAxisG, xAxisG, ticks, paths, canvas, ctx;
	let canvasHeight, canvasWidth;

	// config state
	let showData = false;
	let fullscreen = false;
	let chartHidden = false;
	let chartDataTable = [];
	// CONFIG
	const ENLARGE_DURATION = 200;
	const tooltips = {};
	$: tooltipText = tooltips[tooltipCompany] || "";
	$: tickDimension = fullscreen ? 8 : 0;
	$: MARGINS = fullscreen
		? { top: 10, right: 10, bottom: 25, left: 60 }
		: { top: 10, right: 20, bottom: 15, left: 35 };
	$: fullscreen, forceRender();

	async function forceRender() {
		chartHidden = true;
		await tick();
		render({}, true);
		setTimeout(() => {
			chartHidden = false;
		}, ENLARGE_DURATION);
	}

	const render = throttle((e, force = false) => {
		const data = $chartData?.[type]?.yearly;

		// This won't work if there is not data
		if (!data) return;

		// Get our data for the data table
		// We want, for each year, the sum total of emissions.
		chartDataTable = data.map(d => {
			return {
				year: d.year,
				"total annual emissions": Object.entries(d).reduce((sum, [company, value]) => {
					if (company !== "year") {
						sum += value;
					}
					return sum;
				}, 0),
			};
		});

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

			canvas = select(container)
				.append("canvas")
				.classed("chart__canvas", true)
				.attr("height", canvasHeight * DPI)
				.attr("width", canvasWidth * DPI)
				.attr("style", `height:${canvasHeight}px;width:${canvasWidth}px;`);

			ctx = canvas.node().getContext("2d");
			ctx.scale(DPI, DPI);

			// Grab some style things from the stylesheet
			const containerStyles = getComputedStyle(container);
			ctx.fillStyle = containerStyles.getPropertyValue("--color-chart");
			ctx.strokeStyle = "white";
			ctx.lineWidth = 1;
			// Fullwidth ticks
			ticks = svg
				.append("g")
				.classed("ticks", true)
				.attr("transform", `translate(${width},${MARGINS.top})`);

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

		const stackedData = stack()
			.keys(companies)
			.order(stackOrderDescending)(data)
			.sort((a, b) => {
				return a[0][1] > b[0][1] ? 1 : 0;
			});

		// console.log("stackedData (canvas)", stackedData);
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

		const areaGenerator = area()
			.curve(curveCardinal)
			.x(d => xScale(d.data.year))
			.y0(d => yScale(d[0]))
			.y1(d => yScale(d[1]))
			.context(ctx);

		// We want to cycle through these colors. They do not convey data, but are used to add
		// visual clarity to the chart.
		const colors = ["#113c63", "#00a091", "#55c4c5", "#3c7438", "#55a646", "#9caf3b"];
		let colorCounter = 0;

		console.log({ stackedData });

		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		stackedData.forEach((d, i) => {
			ctx.fillStyle = colors[colorCounter];
			ctx.beginPath();
			areaGenerator(d);
			ctx.fill();

			// If we are at the last color, then reset our color counter. Otherwise, increment it.
			colorCounter = colorCounter === colors.length - 1 ? 0 : colorCounter + 1;
		});

		// Update Axes
		xAxisG.transition().duration(DURATION).call(xAxis);
		yAxisG.transition().duration(DURATION).call(yAxis);

		ticks
			.transition()
			.duration(DURATION)
			.call(yAxis.tickFormat("").tickSize(canvasWidth + MARGINS.right, 0, 0));

		$isLoading = false;
	}, 500);

	// function mouseover(e, d) {
	// 	tooltipCompany = d.key;
	// 	tooltipHidden = false;
	// 	this.classList.add("highlight");
	// }

	// const mousemove = e => {
	// 	const { clientX, clientY } = e;
	// 	tooltipX = clientX;
	// 	tooltipY = clientY;
	// };
	// function mouseleave(e) {
	// 	tooltipHidden = true;
	// 	this.classList.remove("highlight");
	// }
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

	.chart :global(.chart__canvas) {
		position: absolute;
		top: var(--canvas-top, 0);
		right: var(--canvas-right, 0);
		z-index: 100;
	}

	/* FULLSCREEN */
</style>

<svelte:window
	on:renderCharts={render}
	on:resize={e => {
		render(e, true);
	}} />

<div
	class="chart chart--yearly chart--canvas chart--{type} stack"
	class:fullscreen
	style:--speed-transition="{ENLARGE_DURATION}ms"
	style:--canvas-top="{MARGINS.top}px"
	style:--canvas-right="{MARGINS.right}px"
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
		<Loading />
		{#if chartDataTable && chartDataTable.length}
			<ChartData
				{type}
				cumulative={false}
				data={chartDataTable}
				visible={showData}
				on:click={e => {
					showData = false;
				}} />
		{/if}
	</div>
	<Tooltip hidden={tooltipHidden} flip={type === "target"} x={tooltipX} y={tooltipY}>
		<span class="tooltip__name">{tooltipCompany}</span>
		<span class="tooltip__commitments">{tooltipText}</span>
	</Tooltip>
</div>
