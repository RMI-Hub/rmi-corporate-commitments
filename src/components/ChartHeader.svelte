<script>
	import Expand from "../icons/Expand.svelte";
	import Share from "../icons/Share.svelte";
	import MoreInformation from "./MoreInformation.svelte";

	export let header = "";
	export let definition = "";
	export let id = "";
	export let flip = false;
</script>

<style>
	.header {
		font: bold var(--font-size) / 1.3em var(--sans-serif-fonts);
		max-width: calc(100% - var(--controls-width));
	}

	.controls {
		width: var(--controls-width);
		height: 1rem;
		display: flex;
		gap: var(--gap);

		position: absolute;
		top: 0;
		right: 0;
	}

	.controls > * {
		flex: 1 1;
		font: var(--font-size-very-small) / 1.3em var(--sans-serif-fonts);
		text-transform: uppercase;
		color: var(--color-gray);
		border: none;
		background-color: transparent;
		cursor: pointer;
		padding: 0;
	}
	.controls :global(svg) {
		fill: var(--color-gray);
		height: 100%;
		width: 100%;
	}
</style>

<div class="controls">
	<button>
		<span class="visually-hidden">Expand this chart</span>
		<Expand />
	</button>
	<button>
		<span class="visually-hidden">Expand this chart</span>
		<Share />
	</button>
</div>
{#if header}
	<h2 {id} class="header">
		{header}
		{#if definition}
			<MoreInformation text={definition} {id} {flip} />
		{/if}
	</h2>
{/if}
