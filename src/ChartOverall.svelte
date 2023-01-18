<script>
	// UTILS

	export let header = "";
</script>

<style>
	.stack {
		--gap: 0.5rem;
	}

	.chart {
		padding: var(--gap);
		background: var(--color-gray-very-light);
	}
	.header {
		font-size: var(--font-size-small);
	}
	.chart__container {
		outline: 1px solid black;
		aspect-ratio: 16 / 9;
		position: unset;
	}
	@media all and (min-width: 1024px) {
		.chart {
			grid-column: 3;
			grid-row: 1;
		}
	}
</style>

<div class="chart chart--overall stack">
	{#if header}<h3 class="header">{header}</h3>{/if}
	<div class="chart__container" />
</div>
