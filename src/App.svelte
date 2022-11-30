<script>
	// COMPONENTS
	import PoweredBy from "./components/PoweredBy.svelte";
	import Toggles from "./components/Toggles.svelte";
	import Intro from "./components/Intro.svelte";
	import PickerSector from "./components/PickerSector.svelte";
	import PickerPresets from "./components/PickerPresets.svelte";
	import Charts from "./components/Charts.svelte";

	// UTILS

	import { chartData, multipliers } from "./stores.js";
	import { afterUpdate, onMount } from "svelte";
	import { fetchData } from "./utils/fetch-data.js";

	export let headline = "";
	export let intro = "";
	export let charts = {};
	export let toggles = [];

	export let presets = {
		preset1: {
			label: "Energy dramatic change",
		},
		preset2: {
			label: "Industrials slow change",
		},
		preset3: {
			label: "Energy dramatic change",
		},
		preset4: {
			label: "Industrials slow change",
		},
		preset5: {
			label: "Energy dramatic change",
		},
		preset6: {
			label: "Industrials slow change",
		},
	};
	export let sectors = {};

	let data = {};
	let activeSector = "manufacturing";

	// Let's stash our initial toggles
	const defaultMultipliers = Object.assign({}, $multipliers);

	$: sectorHeader = sectors[activeSector].heading;
	$: sectorDescription = sectors[activeSector].description;
	$: ($multipliers || activeSector) && handleUpdate();

	async function handleUpdate(e) {
		$chartData = await fetchData({ activeSector, multipliers: $multipliers }).catch(
			console.error
		);
		console.log("NEW DATA", {
			$chartData,
		});
		window.dispatchEvent(new Event("renderCharts"));
	}

	onMount(async () => {
		// await handleUpdate();
	});
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
<PickerPresets {presets} />
<section class="container" aria-labelledby="sector-heading">
	<div class="sector-heading">
		<h2 id="sector-heading" class="visually-hidden">About {sectorHeader}</h2>
		<PickerSector {sectors} {sectorHeader} bind:value={activeSector} />
		<p>{@html sectorDescription}</p>
	</div>
	{#each Object.entries(charts) as [type, chartInfo]}
		<Charts {...chartInfo} data={data[type]} {type} />
	{/each}
	<div class="controls">
		<Toggles {defaultMultipliers} {toggles} />
	</div>
	<PoweredBy />
</section>
