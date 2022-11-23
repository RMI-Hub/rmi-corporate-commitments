<script>
	import Chart from "./components/Chart.svelte";
	import PoweredBy from "./components/PoweredBy.svelte";
	import Toggles from "./components/Toggles.svelte";
	import Intro from "./components/Intro.svelte";
	import PickerSector from "./components/PickerSector.svelte";
	import Presets from "./components/Presets.svelte";

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
	export let sectors = {
		sector1: {
			heading: "Manufacturing",
			description:
				"Lorem ipsum dolor sit amet consectetur adipisicing elit. In modi unde, perferendis quaerat fugit laborum nulla vel odit blanditiis eaque aperiam eius nemo neque doloribus illo! Quos distinctio ullam velit?",
		},
		sector2: {
			heading: "Pharmaceuticals",
			description:
				"In modi unde, perferendis quaerat fugit laborum nulla vel odit blanditiis eaque aperiam eius nemo neque doloribus illo! Quos distinctio ullam velit? Lorem ipsum dolor sit amet consectetur adipisicing elit. ",
		},
		sector3: {
			heading: "Fancy computer chips",
			description:
				"Lorem ipsum dolor adipisicing elit. In modi unde, perferendis quaerat fugit laborum nulla vel odit blanditiis eaque aperiam eius nemo neque doloribus ullam velit?",
		},
	};

	let activeSector = "sector1";

	$: sectorHeader = sectors[activeSector].heading;
	$: sectorDescription = sectors[activeSector].description;
</script>

<style>
	.container {
		--controls-width: 20rem;
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
<Presets {presets} />
<section class="container" aria-labelledby="sector-heading">
	<div class="sector-heading">
		<h2 id="sector-heading" class="visually-hidden">About {sectorHeader}</h2>
		<PickerSector {sectors} {sectorHeader} bind:value={activeSector} />
		<p>{@html sectorDescription}</p>
	</div>
	{#each Object.entries(charts) as [id, data], index}
		<div class="chart chart--{index}">
			<Chart {...data} {id} {index} />
		</div>
	{/each}
	<div class="controls"><Toggles {toggles} /></div>
	<PoweredBy />
</section>
