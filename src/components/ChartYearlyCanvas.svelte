<script>
	// UTILS
	import { tick } from "svelte";
	import { fly, fade } from "svelte/transition";
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
	export let subheader = "";
	export let definition = "";
	export let type; // "baseline" or "target"
	export let DURATION = 500;

	// La tooltip. Voila!
	let tooltipHidden = true;
	let tooltipX = 0;
	let tooltipY = 0;
	let tooltipCompany = null;
	let DPI = typeof window === "object" ? window.devicePixelRatio : 2;

	// Placeholders, etc. for the chart
	let container, svg, hiddenCanvas, yAxisG, xAxisG, ticks, canvas, ctx, hiddenCtx;
	let dict = new Map();
	let canvasHeight, canvasWidth;
	let xScale, yScale;

	let cx, cy, ox, oy;
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

	let c = "#eee";

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

			// Clear out the lookup
			dict = new Map();

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

			// Make a hidden canvas for interactivity
			hiddenCanvas = select(container)
				.append("canvas")
				.classed("chart__canvas", true)
				.classed("chart__canvas--hidden", true)
				.attr("hidden", true)
				.attr("height", canvasHeight * DPI)
				.attr("width", canvasWidth * DPI)
				.attr("style", `height:${canvasHeight}px;width:${canvasWidth}px;`);

			canvas = select(container)
				.append("canvas")
				.classed("chart__canvas", true)
				.attr("height", canvasHeight * DPI)
				.attr("width", canvasWidth * DPI)
				.attr("style", `height:${canvasHeight}px;width:${canvasWidth}px;`);

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

			// SET UP INTERACTIONS
			canvas.on("mouseover", onMouseover);
			canvas.on("mouseleave", onMouseleave);
		}

		const stackedData = stack()
			.keys(companies)
			.order(stackOrderDescending)(data)
			.sort((a, b) => {
				return a[0][1] > b[0][1] ? 1 : -1;
			});

		xScale = scaleTime()
			.domain(extent(data, d => d.year))
			.range([0, canvasWidth]);

		const xAxis = axisBottom(xScale)
			.tickFormat(yearFormatter)
			.tickSize(tickDimension)
			.ticks(10);

		yScale = scaleLinear().domain([0, $chartData.yearly_max]).range([canvasHeight, 0]);

		const yAxis = axisLeft(yScale)
			.ticks(10)
			.tickSize(tickDimension)
			.tickFormat(emissionsNumberFormatter);

		draw(stackedData, canvas, false);
		draw(stackedData, hiddenCanvas, true);

		// Update Axes
		xAxisG.transition().duration(DURATION).call(xAxis);
		yAxisG.transition().duration(DURATION).call(yAxis);

		ticks
			.transition()
			.duration(DURATION)
			.call(yAxis.tickFormat("").tickSize(canvasWidth + MARGINS.right, 0, 0));

		$isLoading = false;
	}, 500);

	/**
	 *
	 *
	 * Cribbed from: https://bocoup.com/blog/2d-picking-in-canvas
	 *
	 * https://medium.com/free-code-camp/d3-and-canvas-in-3-steps-8505c8b27444
	 * https://www.datamake.io/blog/d3-canvas-full#manual
	 * https://github.com/nbremer/occupationscanvas/blob/gh-pages/js/script.js
	 * https://www.visualcinnamon.com/2015/11/learnings-from-a-d3-js-addict-on-starting-with-canvas/
	 * @param data
	 * @param canvas
	 * @param hidden
	 */
	function draw(data, canvas, hidden) {
		// We want to cycle through these colors. They do not convey data, but are used to add
		// visual clarity to the chart.
		const colors = ["#113c63", "#00a091", "#55c4c5", "#3c7438", "#55a646", "#9caf3b"];
		let colorCounter = 0;

		// Get the context of the canvas in question and clear out the rectangle
		const ctx = canvas.node().getContext("2d");

		// ctx.scale() will multiply the effect with each chart render, so set the transform matrix explicitly
		// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setTransform
		ctx.setTransform(DPI, 0, 0, DPI, 0, 0);

		// Clear out the chart for a new drawing
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);

		const areaGenerator = area()
			.curve(curveCardinal)
			.x(d => xScale(d.data.year))
			.y0(d => yScale(d[0]))
			.y1(d => yScale(d[1]))
			.context(ctx);

		data.forEach((node, i) => {
			if (hidden) {
				let c = randomColor();
				dict.set(c, node.key);

				ctx.fillStyle = c;
			} else {
				ctx.fillStyle = colors[colorCounter];
			}
			ctx.beginPath();
			areaGenerator(node);
			ctx.fill();

			if (!hidden) {
				// If we are at the last color, then reset our color counter. Otherwise, increment it.
				colorCounter = colorCounter === colors.length - 1 ? 0 : colorCounter + 1;
			}
		});
	}

	function onMouseover(e) {
		canvas.on("mousemove", onMousemove);
	}

	function onMousemove(e) {
		const { clientX, clientY, offsetX, offsetY } = e;

		tooltipX = clientX;
		tooltipY = clientY;
		cx = clientX;
		cy = clientY;
		// Be sure to increase by DPI because _that_ is actually how big the canvas is when we create it.
		ox = offsetX * DPI;
		oy = offsetY * DPI;

		const ctx = hiddenCanvas.node().getContext("2d");

		const { data } = ctx.getImageData(ox, oy, 1, 1, {
			colorSpace: "srgb",
		});

		const rgb = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
		c = rgb; // For the debug
		const name = dict.get(rgb);
		tooltipCompany = name || null;
	}
	function onMouseleave(e) {
		tooltipCompany = null;
		canvas.on("mousemove", null);
	}

	/**
	 * Returns a random rgb color value.
	 * */
	function randomColor() {
		return `rgb(${generateRandom()}, ${generateRandom()}, ${generateRandom()})`;
	}

	function generateRandom(min = 1, max = 255) {
		if (min >= max) return null;

		// find diff
		let difference = max - min;

		// generate random number
		let rand = Math.random();

		// multiply with difference
		rand = Math.floor(rand * difference);

		// add with min value
		rand = rand + min;

		return rand;
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

	.chart :global(.chart__canvas) {
		position: absolute;
		top: var(--canvas-top, 0);
		right: calc(var(--canvas-right, 0) / 2);
		z-index: 100;
	}

	.chart :global(.chart__canvas[hidden]) {
		display: none;
	}

	/* FULLSCREEN */

	.chart__wrapper__fullscreen-header {
		position: absolute;
		transform: translate(-50%, 0);
		left: 50%;
		top: 2rem;
		z-index: 100;

		font: bold 1.25rem/1.3em var(--sans-serif-fonts);
		font-weight: bold;
		text-align: center;
		margin: 0;

		padding: 0.5rem;
		background: #fff;
		outline: 1px solid;
		width: clamp(150px, 50%, 300px);
	}

	.debug {
		z-index: 100000000;
		background: var(--background, #eee);
		position: absolute;
		top: 0;
		left: 0;
		font: bold 12px/1em sans-serif;
		list-style: none;
		margin: 0;
		padding: 0.5rem;
		gap: 0.5rem;
		transform: translate(0, -125%);
	}
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
	<ul
		style:--background={c}
		class="debug"
		style:display={window.location.href.includes("debug") ? "flex" : "none"}>
		<li>cx: {cx}</li>
		<li>cy: {cy}</li>
		<li>ox: {ox}</li>
		<li>oy: {oy}</li>
	</ul>
	<ChartHeader
		type="{type}-yearly"
		flip={type === "target"}
		id="chart-yearly-{type}"
		{header}
		{definition}
		{subheader}
		on:showData={e => {
			showData = true;
		}}
		on:enlarge={async e => {
			fullscreen = true;
			forceRender();
		}} />

	<div class="chart__wrapper">
		{#if fullscreen}
			<button
				class="control control--close"
				on:click={async e => {
					fullscreen = false;
					forceRender();
				}}>
				<X title="Shrink this visualization back to regular size" />
			</button>
			<p
				aria-hidden="true"
				in:fly={{ y: -50 }}
				out:fade={{ duration: 100 }}
				class="chart__wrapper__fullscreen-header">
				{@html header}
			</p>
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
	<Tooltip hidden={!tooltipCompany} flip={type === "target"} x={tooltipX} y={tooltipY}>
		<span class="tooltip__name">{tooltipCompany}</span>
		<span class="tooltip__commitments">{tooltipText}</span>
	</Tooltip>
</div>
