<script>
	// UTILS
	import "../config/chart-overall.css";
	import C from "../icons/chart-overall.svg";
	export let header = "";
</script>

<style>
	.stack {
		--gap: 0.5rem;
	}

	.chart {
		height: unset;
		position: sticky;
		top: 0;
		background: rgba(255, 255, 255, 0.95);
		z-index: 3;
		padding: 0.5rem;
	}
	.header {
		font-size: var(--font-size-small);
	}
	.chart__container {
		border: 1px dashed black;
		aspect-ratio: 16 / 9;
		position: unset;
	}
</style>

<div class="chart chart--overall stack">
	{#if header}<h3 class="header">{header}</h3>{/if}
	<div class="chart__container">
		{@html C}
	</div>
</div>
