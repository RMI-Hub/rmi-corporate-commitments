<script>
	import MoreInformation from "./MoreInformation.svelte";

	export let header;
	export let id;
	export let definition;
	export let index;
</script>

<style>
	.chart {
		--controls-width: 8rem;
		position: relative;
	}

	.chart__container {
		background-color: #aaa;
		height: 300px;
	}

	.chart__header {
		font: bold var(--font-size) / 1.3em var(--sans-serif-fonts);
		max-width: calc(100% - var(--controls-width));
	}

	.chart__controls {
		width: var(--controls-width);
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
	}
</style>

<div class="chart" aria-labelledby="chart-{id}">
	<div class="chart__controls">
		<button>Expand</button>
		<button>Share</button>
	</div>
	<h2 id="chart-{id}" class="chart__header">
		{header}
		<MoreInformation text={definition} {id} flip={index % 2 !== 0} />
	</h2>
	<div class="chart__container" />
</div>
