<script>
	// COMPONENTS
	import Chart from "./components/Chart.svelte";
	import PoweredBy from "./components/PoweredBy.svelte";
	import Toggles from "./components/Toggles.svelte";
	import Intro from "./components/Intro.svelte";
	import PickerSector from "./components/PickerSector.svelte";
	import PickerPresets from "./components/PickerPresets.svelte";

	// UTILS
	import * as d3 from "d3";
	import { yearly, cumulative, multipliers } from "./stores.js";
	import { afterUpdate, onMount } from "svelte";
	import groupBy from "lodash.groupby";
	import throttle from "lodash.throttle";

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

	let activeSector = "manufacturing";

	// THis is our data cache
	const data = new Map();

	$: sectorHeader = sectors[activeSector].heading;
	$: sectorDescription = sectors[activeSector].description;

	// scope2_intensity_sector_min
	$: intensity = `${$multipliers.scope}_intensity_${$multipliers.sector_emission_intensity}`;

	async function handleSectorChange(e) {
		const { sector } = e.detail;
		fetchData();
	}

	onMount(async () => {
		fetchData();
	});

	/**
	 * Looks at the `activeSector` and loads the appropriate data file from our cache. If the data is not in the cache,
	 * then it goes and gets it. This function is throttle to once every 250ms.
	 */
	const fetchData = throttle(
		async () => {
			console.log("NEW DATA FETCHING", { $multipliers, intensity });
			let sectorData;
			if (data.has(activeSector)) {
				// This data is already fetched and cached. Use it.
				sectorData = data.get(activeSector);
			} else {
				// This data is not cached. Get it. Cache it.
				sectorData = await d3.csv(`/data/${activeSector}.csv`).catch(console.error);
				data.set(activeSector, sectorData);
			}

			$yearly = sectorData.map(d => {
				return {
					name: d.company,
					year: new Date(d.year, 0, 1),
					// Rev * growth * multiplier
					baseline: d.revenue * d[$multipliers.growth] * d[intensity],
					// TK: This
					target: d.revenue * d[$multipliers.growth] * d[intensity],
				};
			});

			// Generate the cumulative figures, grouped by year
			const grouped = groupBy($yearly, d => d["year"]);

			// Running totals, to track the overall accumulation
			let runningTotalBaseline = 0;
			let runningTotalTarget = 0;

			// Reduce the grouped into an array of objects, one per year
			$cumulative = Object.entries(grouped).reduce((accumulator, [year, yearData]) => {
				// Get our annual totals
				const { baseline, target } = yearData.reduce(
					(a, c) => {
						// Add 'em up
						if (c.baseline) a.baseline += +c.baseline;
						if (c.target) a.target += +c.target;
						return a;
					},
					{ baseline: 0, target: 0 }
				);

				// Add the annual totals to the running totals
				runningTotalBaseline += baseline;
				runningTotalTarget += target;

				// Store our new values
				accumulator.push({
					year: new Date(year),
					baseline: runningTotalBaseline,
					target: runningTotalTarget,
				});
				return accumulator;
			}, []);

			console.log("NEW DATA!", { $yearly, $cumulative });
		},
		250,
		{ leading: true }
	);
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
	}
</style>

<Intro {headline} {intro} />
<PickerPresets {presets} />
<section class="container" aria-labelledby="sector-heading">
	<div class="sector-heading">
		<h2 id="sector-heading" class="visually-hidden">About {sectorHeader}</h2>
		<PickerSector
			{sectors}
			{sectorHeader}
			bind:value={activeSector}
			on:sectorChange={handleSectorChange} />
		<p>{@html sectorDescription}</p>
	</div>
	{#each Object.entries(charts) as [id, data], index}
		<div class="chart chart--{index}">
			<Chart {...data} {id} {index} />
		</div>
	{/each}
	<div class="controls"><Toggles {toggles} on:input={fetchData} /></div>
	<PoweredBy />
</section>
