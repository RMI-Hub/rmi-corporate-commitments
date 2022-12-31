<script>
	// COMPONENTS
	import PoweredBy from "./components/PoweredBy.svelte";
	import Toggles from "./components/Toggles.svelte";
	import Intro from "./components/Intro.svelte";
	import PickerSector from "./components/PickerSector.svelte";
	import PickerPresets from "./components/PickerPresets.svelte";
	import ChartYearly from "./components/ChartYearly.svelte";
	import ChartCumulative from "./components/ChartCumulative.svelte";

	// UTILS

	import { chartData, multipliers, activeSector } from "./stores.js";
	import { fetchData } from "./utils/fetch-data.js";

	export let headline = "";
	export let intro = "";
	export let togglesMicrocopy = {};
	export let presetsMicrocopy = {};
	export let charts = {};
	export let toggles = [];
	export let presets = {};
	export let sectors = {};

	// let activeSector = Object.keys(sectors)[0];

	const CHART_UPDATE_DURATION = 500;

	// Let's stash our initial toggles
	const defaultMultipliers = Object.assign({}, $multipliers);

	// our chart types
	const chartForms = {
		yearly: ChartYearly,
		cumulative: ChartCumulative,
	};

	$: sectorHeader = sectors?.[$activeSector].heading ?? "";
	$: sectorDescription = sectors?.[$activeSector].description ?? "";

	// Handle update will run any time these store values update
	$: ($multipliers || $activeSector) && handleUpdate();

	// fetches data when needed
	async function handleUpdate(e) {
		$chartData = await fetchData({
			activeSector: $activeSector,
			multipliers: $multipliers,
		}).catch(console.error);

		console.log("NEW DATA", {
			$chartData,
		});
		window.dispatchEvent(new Event("renderCharts"));
	}
</script>

<style>
	.container {
		--controls-width: 17rem;
		display: grid;
		gap: var(--gap);
	}

	@media all and (min-width: 1024px) {
		.container {
			grid-template-columns: var(--controls-width) repeat(2, minmax(1px, 1fr));
			grid-template-rows: auto repeat(2, minmax(1px, 1fr)) auto;
		}

		.sector-heading {
			position: relative;
			grid-column: 2 /-1;
		}

		.controls {
			padding: var(--gap);
			background: var(--color-gray-light);
			grid-row: 1 / -2;
			grid-column: 1;
		}

		.container :global(.powered) {
			grid-row: -1;
			grid-column: 1/-1;
		}

		.container :global(.chart--cumulative) {
			grid-row: 3;
		}
		.container :global(.chart--baseline) {
			grid-column: 2;
		}
	}
</style>

<Intro {headline} {intro} />
<!-- <PickerPresets {presets} {...presetsMicrocopy} /> -->
<section class="container" aria-labelledby="sector-heading">
	<div class="sector-heading">
		<h2 id="sector-heading" class="visually-hidden">About {sectorHeader}</h2>
		<PickerSector {sectors} {sectorHeader} bind:value={$activeSector} />
		<p>{@html sectorDescription}</p>
	</div>
	{#each Object.entries(charts) as [type, typeInfo]}
		<!-- For each type (target, baseline) ....-->
		{#each Object.entries(typeInfo) as [chartForm, chartInfo]}
			<!-- Put each configured chart -->
			<svelte:component
				this={chartForms[chartForm]}
				DURATION={CHART_UPDATE_DURATION}
				{type}
				{...chartInfo} />
		{/each}
	{/each}
	<div class="controls">
		<Toggles
			{defaultMultipliers}
			{toggles}
			{...togglesMicrocopy}
			{presets}
			{presetsMicrocopy} />
	</div>
	<PoweredBy />
</section>
