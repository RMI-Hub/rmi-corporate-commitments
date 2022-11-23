<script>
	import Expand from "../icons/Expand.svelte";
	import Share from "../icons/Share.svelte";
	import MoreInformation from "./MoreInformation.svelte";

	export let header;
	export let id;
	export let definition;
	export let index;
</script>

<style>
	.chart {
		--controls-width: 5rem;
		position: relative;
		height: 100%;
	}

	.chart__container {
		margin-top: auto;
		background-color: #aaa;
		height: 300px;
	}

	.chart__header {
		font: bold var(--font-size) / 1.3em var(--sans-serif-fonts);
		max-width: calc(100% - var(--controls-width));
	}

	.chart__controls {
		width: var(--controls-width);
		height: 1rem;
		display: flex;
		gap: var(--gap);

		position: absolute;
		top: 0;
		right: 0;
	}

	.chart__controls > * {
		flex: 1 1;
		font: var(--font-size-very-small) / 1.3em var(--sans-serif-fonts);
		text-transform: uppercase;
		color: var(--color-gray);
		border: none;
		background-color: transparent;
		cursor: pointer;
		padding: 0;
	}
	.chart__controls :global(svg) {
		fill: var(--color-gray);
		height: 100%;
		width: 100%;
	}
</style>

<div class="chart stack" aria-labelledby="chart-{id}">
	<div class="chart__controls">
		<button>
			<span class="visually-hidden">Expand this chart</span>
			<Expand />
		</button>
		<button>
			<span class="visually-hidden">Expand this chart</span>
			<Share />
		</button>
	</div>
	<h2 id="chart-{id}" class="chart__header">
		{header}
		<MoreInformation text={definition} {id} flip={index % 2 !== 0} />
	</h2>
	<div class="chart__container" />
</div>
