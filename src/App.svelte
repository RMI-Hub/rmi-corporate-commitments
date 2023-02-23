<script>
	// COMPONENTS
	import PoweredBy from "./components/PoweredBy.svelte";
	import Toggles from "./components/Toggles.svelte";
	import Intro from "./components/Intro.svelte";
	import PickerSector from "./components/PickerSector.svelte";
	import ChartYearly from "./components/ChartYearly.svelte";
	import ChartYearlyCanvas from "./components/ChartYearlyCanvas.svelte";
	import ChartCumulative from "./components/ChartCumulative.svelte";

	// UTILS

	import {
		chartData,
		multipliers,
		activeSector,
		highlightIndustry,
		highlightSector,
	} from "./stores.js";
	import { fetchData } from "./utils/fetch-data.js";
	import { slugify } from "./utils/slugify.js";

	import { afterUpdate, onMount } from "svelte";

	export let headline = "";
	export let intro = "";
	export let overallMicrocopy = {};
	export let togglesMicrocopy = {};
	export let presetsMicrocopy = {};
	export let sectorsMicrocopy = {};
	export let sectors = [];
	export let charts = {};
	export let toggles = [];
	export let presets = {};

	// let activeSector = Object.keys(sectors)[0];

	const CHART_UPDATE_DURATION = 500;

	// Let's stash our initial toggles
	const defaultMultipliers = Object.assign({}, $multipliers);

	// our chart types
	const chartForms = {
		yearly: ChartYearlyCanvas,
		cumulative: ChartCumulative,
	};

	$: sectorSlug = slugify($activeSector);
	$: sectorHeader = sectorsMicrocopy?.[sectorSlug]?.heading ?? $activeSector;
	$: sectorDescription = sectorsMicrocopy?.[sectorSlug]?.description ?? "";

	// Handle update will run any time these store values update
	$: ($multipliers || $activeSector) && handleUpdate();

	// fetches data when needed
	async function handleUpdate(e) {
		$chartData = await fetchData({
			activeSector: sectorSlug,
			multipliers: $multipliers,
		}).catch(console.error);

		console.log("NEW DATA", {
			$chartData,
			$multipliers,
		});
		window.dispatchEvent(new Event("renderCharts"));
	}

	// afterUpdate(() => {
	// 	console.log({ $activeSector, sectorSlug, $highlightIndustry, $highlightSector });
	// });
</script>

<style>
	.container {
		--controls-width: 18rem;
		display: grid;
		gap: var(--gap);
	}

	@media all and (min-width: 1024px) {
		.container {
			height: 98vh;
			min-height: 800px;
			grid-template-columns: var(--controls-width) repeat(2, minmax(1px, 1fr));
			grid-template-rows: auto repeat(2, minmax(1px, 1fr)) auto;
		}

		.sector-heading {
			position: relative;
			grid-column: 2/-1;
		}

		.controls {
			padding: var(--gap);
			background: var(--color-background-controls);
			grid-row: 1 / -2;
			grid-column: 1;
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
<section
	class="container"
	aria-labelledby="sector-heading"
	data-highlight-sector={$highlightSector}
	data-highlight-industry={$highlightIndustry}>
	<div class="sector-heading">
		<h2 id="sector-heading" class="visually-hidden">About {sectorHeader}</h2>
		<PickerSector {sectors} {sectorHeader} bind:value={$activeSector} />
		<p>{@html sectorDescription}</p>
	</div>
	{#each Object.entries(charts) as [type, typeInfo], index}
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
			{overallMicrocopy}
			{defaultMultipliers}
			{toggles}
			{...togglesMicrocopy}
			{presets}
			{presetsMicrocopy} />
	</div>
</section>
<PoweredBy />
