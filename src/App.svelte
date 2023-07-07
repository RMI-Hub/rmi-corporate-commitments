<script>
	// COMPONENTS
	import PoweredBy from "./components/PoweredBy.svelte";
	import Toggles from "./components/Toggles.svelte";
	import Intro from "./components/Intro.svelte";
	import PickerSector from "./components/PickerSector.svelte";
	import ChartYearlyCanvas from "./components/ChartYearlyCanvas.svelte";
	import ChartCumulative from "./components/ChartCumulative.svelte";

	// UTILS

	import {
		chartData,
		isLoading,
		multipliers,
		activeSector,
		highlightIndustry,
		highlightSector,
	} from "./stores.js";
	import { fetchData } from "./utils/fetch-data.js";
	import { slugify } from "./utils/slugify.js";
	import { marked } from "marked";

	import { afterUpdate, onMount } from "svelte";

	export let headline = "";
	export let intro = "";
	export let powered_by_cta = "";
	export let overallMicrocopy = {};
	export let togglesMicrocopy = {};
	export let presetsMicrocopy = {};
	export let sectors = [];
	export let charts = {};
	export let toggles = [];
	export let presets = {};

	const CHART_UPDATE_DURATION = 500;

	// Let's stash our initial toggles
	const defaultMultipliers = Object.assign({}, $multipliers);

	// our chart types
	const chartForms = {
		yearly: ChartYearlyCanvas,
		cumulative: ChartCumulative,
	};

	$: sectorSlug = slugify($activeSector);

	// Handle update will run any time these store values update
	$: ($multipliers || $activeSector) && handleUpdate();

	// fetches data when needed
	async function handleUpdate(e) {
		$isLoading = true;
		$chartData = await fetchData({
			activeSector: sectorSlug,
			multipliers: $multipliers,
		}).catch(console.error);

		const est = $multipliers.use_estimated;

		if (window.location.href.includes("localhost")) {
				console.log("NEW DATA", {
				$chartData,
				$multipliers
			});

				console.log(
					`++ ${$activeSector} (use_estimated == ${est}) sector has ${$chartData.companies.length} companies`
				);
			}
		
		window.dispatchEvent(new Event("renderCharts"));
	}
</script>

<style>
	.rmi-container {
		--controls-width: 100%;
		display: grid;
		gap: var(--gap);
	}

	.controls {
		background: var(--color-background-controls);
	}

	.estimate {
		padding: 0.5rem;
		background-color: var(--color-gray-light);
	}

	.estimate :global(p) {
		font: 12px/1.3em var(--sans-serif-fonts);
	}

	.estimate :global(strong) {
		text-transform: uppercase;
	}

	@media all and (min-width: 1024px) {
		.rmi-container {
			--controls-width: 18rem;
			height: 98vh;
			min-height: 800px;
			grid-template-columns: var(--controls-width) repeat(2, minmax(1px, 1fr));
			grid-template-rows: auto minmax(1px, 6fr) auto minmax(1px, 4fr) auto;
		}

		.estimate {
			grid-column: 2 / -1;
			grid-row: 3;
		}
		.sector-heading {
			position: relative;
			grid-column: 2/-1;
		}

		.controls {
			padding: var(--gap) var(--gap) 0 var(--gap);
			grid-row: 1 / -2;
			grid-column: 1;
		}

		.rmi-container :global(.chart--cumulative) {
			grid-row: 4;
		}
		.rmi-container :global(.chart--baseline) {
			grid-column: 2;
		}
	}
</style>

<Intro {headline} {intro} />
<section
	class="rmi-container"
	aria-labelledby="sector-heading"
	data-highlight-sector={$highlightSector}
	data-highlight-industry={$highlightIndustry}>
	<div class="sector-heading">
		<h2 id="sector-heading" class="visually-hidden">About {$activeSector}</h2>
		<PickerSector {sectors} bind:value={$activeSector} />
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
	<div class="estimate">
		{@html marked.parse(overallMicrocopy.estimated_explainer)}
	</div>
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
<PoweredBy cta={powered_by_cta} />
