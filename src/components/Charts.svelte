<script>
	import ChartData from "./ChartData.svelte";

	import { chartData } from "../stores.js";
	import * as d3 from "d3";
	import throttle from "lodash.throttle";

	import ChartHeader from "./ChartHeader.svelte";

	// Chart meta
	export let yearly = {};
	export let cumulative = {};
	export let type; // "baseline" or "target"

	let tooltip;
	let tooltipHidden = true;
	let tooltipX = 0;
	let tooltipY = 0;
	let tooltipCompany = "A";

	$: tooltipText = tooltips[tooltipCompany] || "";

	let canvasHeight, canvasWidth;
	let cumulativeContainer, annualContainer;

	// Cumulative placeholders
	let cumulativeSVG, annualSVG;
	let yAxisG, xAxisG, bars, barTicks;

	// ANNUAL PLACEHOLERS
	let annualYAxisG, annualXAxisG, annualTicks;

	// data tables
	let showCumulativeData = false;
	let showAnnualData = false;

	const DURATION = 500;
	const tooltips = {
		A: "AAA Lorem ipsum dolor ipsum dolor ipsum dolor ipsum dolor ipsum dolor.",
		B: "BBB Lorem ipsum dolor ipsum dolor ipsum dolor ipsum dolor ipsum dolor.",
		C: "CCC Lorem ipsum dolor ipsum dolor ipsum dolor ipsum dolor ipsum dolor.",
	};
	function yearFormatter(d) {
		const year = d.getFullYear();
		if (year % 5 === 0) {
			return d3.timeFormat("%Y")(d).slice(-2) === "25"
				? d3.timeFormat("%Y")(d)
				: d3.timeFormat("\u2019%y")(d);
		}
		return "";
	}

	function emissionsNumberFormatter(d) {
		return d3.format(".1s")(d).replace("G", "B");
	}

	const render = throttle((e, force) => {
		buildCumulativeChart(force);
		buildAnnualChart(force);
	}, 500);

	function buildCumulativeChart(force = false) {
		// CHART SCAFFOLDING
		// ------------------------------------
		const MARGINS = { top: 0, right: 5, bottom: 15, left: 25 };
		const data = $chartData?.[type]?.cumulative;
		const domain = $chartData?.cumulative_domain;
		if (!data) return;

		if (!cumulativeSVG || force) {
			const { height, width } = cumulativeContainer.getBoundingClientRect();
			canvasHeight = height - MARGINS.top - MARGINS.bottom;
			canvasWidth = width - MARGINS.left - MARGINS.right;

			cumulativeContainer.innerHTML = "";

			cumulativeSVG = d3
				.select(cumulativeContainer)
				.append("svg")
				.attr("height", height)
				.attr("width", width)
				.attr("viewBox", `0 0 ${width} ${height}`)
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
		const MARGINS = { top: 10, right: 15, bottom: 15, left: 35 };
		const data = $chartData?.[type]?.yearly;
		const companies = $chartData.companies || [];

		// This won't work if there is not data
		if (!data) return;

		if (!annualSVG) {
			const { height, width } = annualContainer.getBoundingClientRect();
			canvasHeight = height - MARGINS.top - MARGINS.bottom;
			canvasWidth = width - MARGINS.left - MARGINS.right;

			annualSVG = d3
				.select(annualContainer)
				.append("svg")
				.attr("height", height)
				.attr("width", width)
				.attr("viewBox", "0 0 " + width + " " + height)
				.attr("preserveAspectRatio", "xMinYMid")
				.attr("role", "img");

			// Fullwidth ticks
			annualTicks = annualSVG
				.append("g")
				.classed("annualTicks", true)
				.attr("transform", `translate(${width},0)`);

			// Build axes now so it's atop the bars
			annualYAxisG = annualSVG
				.append("g")
				.classed("axis", true)
				.classed("y", true)
				.attr("transform", `translate(${MARGINS.left},${MARGINS.top})`);

			// Build xAxis now so it's atop the bars
			annualXAxisG = annualSVG
				.append("g")
				.classed("axis", true)
				.classed("x", true)
				.attr("transform", `translate(${MARGINS.left}, ${canvasHeight})`);
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
			.tickSize(5)
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

		annualSVG
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
		annualXAxisG.transition().duration(DURATION).call(xAxis);
		annualYAxisG.transition().duration(DURATION).call(yAxis);

		annualTicks
			.transition()
			.duration(DURATION)
			.call(yAxis.tickFormat("").tickSize(canvasWidth + MARGINS.right, 0, 0));
	}

	function mouseover(e, d) {
		console.log("over", { d, e, this: this });
		tooltipCompany = d.key;
		tooltipHidden = false;
		this.classList.add("highlight");
	}

	function mousemove(e) {
		console.log("move", { e });
		const { clientX, clientY } = e;
		tooltipX = clientX;
		tooltipY = clientY;
	}
	function mouseleave(e) {
		console.log("leave", { e });
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
	.chart :global(.bar.highlight) {
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
	class="chart chart--yearly chart--{type} stack"
	aria-labelledby="chart-yearly-{type}">
	<ChartHeader
		type="{type}-yearly"
		flip={type === "target"}
		id="chart-yearly-{type}"
		header={yearly.header}
		definition={yearly.definition}
		on:showData={e => {
			showAnnualData = true;
		}} />
	<div class="chart__container" bind:this={annualContainer}>
		<div
			bind:this={tooltip}
			hidden={tooltipHidden ? true : null}
			id="tooltip-{type}"
			class="tooltip"
			class:flip={type === "target"}
			style:--x="{tooltipX}px"
			style:--y="{tooltipY}px">
			<span class="tooltip__name">{tooltipCompany}</span>
			<span class="tooltip__commitments">{tooltipText}</span>
		</div>
	</div>
	{#if $chartData?.[type]?.yearly}
		<ChartData
			{type}
			cumulative={false}
			data={$chartData[type].yearly}
			visible={showAnnualData}
			on:click={e => {
				showAnnualData = false;
			}} />
	{/if}
</div>
<div
	class="chart chart--cumulative chart--{type} stack"
	aria-labelledby="chart-cumulative-{type}">
	<ChartHeader
		on:showData={e => {
			showCumulativeData = true;
		}}
		flip={type === "target"}
		id="chart-cumulative-{type}"
		header={cumulative.header}
		definition={cumulative.definition} />
	<div class="chart__container" bind:this={cumulativeContainer} />
	{#if $chartData?.[type]?.cumulative}
		<ChartData
			{type}
			cumulative={true}
			data={$chartData[type].cumulative}
			visible={showCumulativeData}
			on:click={e => {
				showCumulativeData = false;
			}} />
	{/if}
</div>
