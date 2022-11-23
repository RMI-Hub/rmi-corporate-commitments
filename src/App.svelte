<script>
	import Chart from "./components/Chart.svelte";
	import PoweredBy from "./components/PoweredBy.svelte";
	import Toggles from "./components/Toggles.svelte";
	import Intro from "./components/Intro.svelte";

	export let charts = {};
	export let toggles = [];
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
			grid-template-rows: repeat(2, minmax(1px, 1fr)) auto;
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

<Intro />
<div class="container">
	{#each Object.entries(charts) as [id, data], index}
		<div class="chart chart--{index}">
			<Chart {...data} {id} {index} />
		</div>
	{/each}
	<div class="controls"><Toggles {toggles} /></div>
	<PoweredBy />
</div>
