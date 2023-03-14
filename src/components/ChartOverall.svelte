<script>
	// UTILS
	// import "../config/chart-overall.css";
	import C from "../icons/chart-overall.svg";
	export let header = "";
</script>

<style>
	.stack {
		--gap: 0.5rem;
	}

	.chart {
		--color: var(--color-blue-medium);
		height: unset;
		position: sticky;
		top: 0;
		z-index: 3;
		padding: 0 0 0.5rem 0;
	}

	.chart::before {
		content: "";
		position: absolute;
		inset: 0;
		background: var(--color-background-controls);
		opacity: 0.9;
	}

	.header {
		position: relative;
		font-size: var(--font-size-small);
	}
	.chart__container {
		border: 6px solid white;
		position: relative;
		background-color: white;
	}

	.chart--overall :global(svg .path) {
		fill: var(--color);
	}
</style>

<div class="chart chart--overall stack">
	{#if header}<h3 class="header">{header}</h3>{/if}
	<div class="chart__container">
		{@html C}
	</div>
</div>
