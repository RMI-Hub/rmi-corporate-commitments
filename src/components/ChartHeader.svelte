<script>
	import { create } from "d3";
	import { createEventDispatcher } from "svelte";

	import Data from "../icons/Data.svelte";
	import Expand from "../icons/Expand.svelte";
	import Share from "../icons/Share.svelte";
	import MoreInformation from "./MoreInformation.svelte";

	export let header = "";
	export let definition = "";
	export let id = "";
	export let flip = false;
	export let type;

	const dataTitle = "See the underlying data";
	const shareTitle = "Share this chart";

	const dispatch = createEventDispatcher();

	function share(e) {
		console.log("sharing");
	}
	function showData(e) {
		console.log("showing");
		dispatch("showData", { type });
	}
</script>

<style>
	.header {
		--controls-width: 130px;
		display: grid;
		gap: 0.25rem;
		grid-template: auto / minmax(1px, 1fr) var(--controls-width);
	}
	.header__text {
		font: bold var(--font-size) / 1.3em var(--sans-serif-fonts);
		margin: 0;
	}

	.control {
		font: var(--font-size-very-small) / 1.3em var(--sans-serif-fonts);
		text-transform: uppercase;
		color: var(--color-gray);

		border: none;
		background-color: transparent;
		cursor: pointer;
		padding: 0;
		border-radius: 50%;

		aspect-ratio: 1/1;
		height: 2rem;
		width: 2rem;

		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.control :global(svg) {
		fill: var(--color-gray);
		height: 60%;
		width: 60%;
		transition: fill var(--speed-transition) ease;
	}

	/* HOVER */
	.control:hover {
		background-color: var(--color-gray-light);
	}

	.control:where(:hover, :focus) :global(svg) {
		fill: var(--color-slate);
	}

	/* FOCUS */
	.control:focus {
		outline: 2px solid var(--color-accent);
	}
</style>

<div class="header">
	{#if header}
		<h2 {id} class="header__text">
			{header}
			{#if definition}
				<MoreInformation text={definition} {id} {flip} />
			{/if}
		</h2>
	{/if}
	<div class="header__controls">
		<button class="control">
			<span class="visually-hidden">Expand this chart</span>
			<Expand />
		</button>
		<button class="control" on:click={showData}>
			<span class="visually-hidden">{dataTitle}</span>
			<Data title={dataTitle} />
		</button>
		<button class="control" on:click={share}>
			<span class="visually-hidden">{shareTitle}</span>
			<Share title={shareTitle} />
		</button>
	</div>
</div>
