<script>
	import Chart from "./components/Chart.svelte";
	import PoweredBy from "./components/PoweredBy.svelte";
	import Toggles from "./components/Toggles.svelte";
	import Intro from "./components/Intro.svelte";

	export let headline = "";
	export let intro = "";
	export let charts = {};
	export let toggles = [];

	export let sectors = {
		sector1: {
			heading: "Sector 1",
			description:
				"Lorem ipsum dolor sit amet consectetur adipisicing elit. In modi unde, perferendis quaerat fugit laborum nulla vel odit blanditiis eaque aperiam eius nemo neque doloribus illo! Quos distinctio ullam velit?",
		},
	};

	let activeSector = "sector1";

	$: sectorHeader = sectors[activeSector].heading;
	$: sectorDescrption = sectors[activeSector].description;
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
<div class="container">
	<div class="sector-heading">
		<h2 class="header">{sectorHeader}</h2>
		<p>{@html sectorDescrption}</p>
	</div>
	{#each Object.entries(charts) as [id, data], index}
		<div class="chart chart--{index}">
			<Chart {...data} {id} {index} />
		</div>
	{/each}
	<div class="controls"><Toggles {toggles} /></div>
	<PoweredBy />
</div>
