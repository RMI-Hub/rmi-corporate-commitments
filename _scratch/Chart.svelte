<script>
	import Expand from "../src/icons/Expand.svelte";
	import Share from "../src/icons/Share.svelte";
	import MoreInformation from "../src/components/MoreInformation.svelte";
	import { target, baseline } from "../src/stores.js";
	import { afterUpdate, onMount } from "svelte";
	import * as d3 from "d3";

	import { StackedAreaChart } from "../src/utils/stacked-area-chart.js";
	import ChartHeader from "../src/components/ChartHeader.svelte";

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
			.attr("viewBox", "0 0 " + width + " " + height)
			.attr("preserveAspectRatio", "xMinYMid")
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
		if (annual) {
			buildAnnualChart(node);
		} else {
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

		// containerElement.appendChild(stackedChart);
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

<svelte:window
	on:renderCharts={e => {
		console.log("TIME TO RENDER", e);
	}} />
<div class="chart stack" aria-labelledby="chart-{id}">
	<ChartHeader {id} {header} {definition} />
	<div class="chart__container" bind:this={containerElement} />
</div>
