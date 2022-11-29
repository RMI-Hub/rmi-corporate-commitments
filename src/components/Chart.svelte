<script>
	import Expand from "../icons/Expand.svelte";
	import Share from "../icons/Share.svelte";
	import MoreInformation from "./MoreInformation.svelte";
	import { yearly, cumulative } from "../stores.js";
	import { afterUpdate, onMount } from "svelte";
	import * as d3 from "d3";

	import { StackedAreaChart } from "../utils/stacked-area-chart.js";

	export let header;
	export let id;
	export let definition;
	export let index;
	export let type; // "baseline" or "target"
	export let annual; // true or false

	let canvasHeight, canvasWidth;
	let containerElement; // Use a ref here because we want to redraw this on resize and need to know the container
	const margins = { top: 0, right: 5, bottom: 15, left: 25 };

	$: $yearly.length &&
		$cumulative.length &&
		containerElement &&
		buildChart(containerElement);

	function buildCumulativeChart(containerElement) {
		// CHART SCAFFOLDING
		// ------------------------------------
		if (!$cumulative.length) return;

		const data = $cumulative;

		const { height, width } = containerElement.getBoundingClientRect();
		canvasHeight = height - margins.top - margins.bottom;
		canvasWidth = width - margins.left - margins.right;

		const svg = d3
			.select(containerElement)
			.append("svg")
			.attr("height", height)
			.attr("width", width)
			.attr("role", "img");

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

		const y = d3
			.scaleLinear()
			.domain([0, d3.max(data, d => d[type])])
			.range([canvasHeight, 0]);

		const yAxis = d3
			.axisLeft(y)
			.tickFormat(d => d3.format(".1s")(d).replace("G", "B"))
			.ticks(5);

		svg
			.append("g")
			.classed("axis", true)
			.classed("y", true)
			.attr("transform", `translate(${margins.left},${margins.top})`)
			.call(yAxis.tickSize([0]));

		// DRAW THE BARS
		const bars = svg
			.append("g")
			.classed("bars", true)
			.attr("transform", `translate(${margins.left},0)`);

		// Add the axis ticks
		bars
			.append("g")
			.classed("bars__ticks", true)
			.attr("transform", `translate(${canvasWidth + margins.right},0)`)
			.call(yAxis.tickFormat("").tickSize(canvasWidth + margins.right, 0, 0));

		// Add the bar chart bars
		bars
			.selectAll(".bar")
			.data(data)
			.enter()
			.append("rect")
			.classed("bar", true)
			.classed("highlight", d => d.year.getFullYear() === 2025)
			.attr("width", x.bandwidth())
			.attr("x", d => x(d.year))
			.attr("y", d => y(d[type]))
			.attr("height", d => canvasHeight - y(d[type]));

		// Build xAxis now so it's atop the bars
		svg
			.append("g")
			.classed("axis", true)
			.classed("x", true)
			.attr("transform", `translate(${margins.left}, ${canvasHeight})`)
			.call(xAxis);
	}

	function buildChart(node) {
		console.log({ annual });
		if (annual) {
			console.log("foo", node);
			buildAnnualChart(node);
		} else {
			console.log("bar", node);
			buildCumulativeChart(node);
		}
	}
	function buildAnnualChart(node) {
		if (!$yearly.length) return;

		// const data = $cumulative;

		const { height, width } = containerElement.getBoundingClientRect();
		canvasHeight = height - margins.top - margins.bottom;
		canvasWidth = width - margins.left - margins.right;

		const stackedChart = StackedAreaChart($yearly, {
			x: d => d.year,
			y: d => d[type],
			z: d => d.name,
			width,
			height,
		});

		console.log(stackedChart);
		containerElement.appendChild(stackedChart);
	}
	onMount(() => {});
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

	.chart__header {
		font: bold var(--font-size) / 1.3em var(--sans-serif-fonts);
		max-width: calc(100% - var(--controls-width));
	}

	.chart__controls {
		width: var(--controls-width);
		height: 1rem;
		display: flex;
		gap: var(--gap);

		position: absolute;
		top: 0;
		right: 0;
	}

	.chart__controls > * {
		flex: 1 1;
		font: var(--font-size-very-small) / 1.3em var(--sans-serif-fonts);
		text-transform: uppercase;
		color: var(--color-gray);
		border: none;
		background-color: transparent;
		cursor: pointer;
		padding: 0;
	}
	.chart__controls :global(svg) {
		fill: var(--color-gray);
		height: 100%;
		width: 100%;
	}

	.chart :global(canvas) {
		position: absolute;
		top: var(--canvas-top);
		right: var(--canvas-right);
		height: var(--canvas-height);
		width: var(--canvas-width);
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

<div class="chart stack" aria-labelledby="chart-{id}">
	<div class="chart__controls">
		<button>
			<span class="visually-hidden">Expand this chart</span>
			<Expand />
		</button>
		<button>
			<span class="visually-hidden">Expand this chart</span>
			<Share />
		</button>
	</div>
	<h2 id="chart-{id}" class="chart__header">
		{header}
		<MoreInformation text={definition} {id} flip={index % 2 !== 0} />
	</h2>
	<div class="chart__container" bind:this={containerElement} />
</div>
