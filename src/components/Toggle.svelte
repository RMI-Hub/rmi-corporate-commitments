<script>
	// UTILS
	import { slugify } from "../utils/slugify.js";
	import { multipliers, isPreset } from "../stores.js";

	// COMPONENTS
	import Toggletip from "./Toggletip.svelte";

	export let longform = false;
	export let label = "";
	export let definition = "";
	export let id = "";
	export let buttons = [];
</script>

<style>
	.toggles__btn-group {
		position: relative; /* contains toggle tip*/
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: calc(var(--gap) / 2) var(--gap);
		flex-wrap: wrap;
		padding-bottom: var(--gap);
		border-bottom: 1px solid var(--color-gray);
	}

	.toggles__btn-group > * {
		flex: 1 1;
	}

	.toggles__label {
		display: flex;
		align-items: flex-start;
		gap: 0.25rem;
		cursor: pointer;
	}
	.longform .toggles__label {
		flex: 1 1 100%;
	}

	.toggles__btn {
		font-size: 1em;
		accent-color: var(--color-accent);
	}

	.label {
		font-size: var(--font-size-small);
		flex-basis: 100%;
		margin: 0;
	}
</style>

<div class="toggles__btn-group" class:longform>
	<h3 class="label">
		{label}
		<Toggletip text={definition} />
	</h3>
	{#each buttons as { text, value }}
		<label class="toggles__label sans-serif" for={slugify(text)}>
			<input
				class="toggles__btn"
				type="radio"
				id={slugify(text)}
				name={slugify(label)}
				on:click={e => {
					$isPreset = false;
				}}
				{value}
				bind:group={$multipliers[id]} />
			{text}
		</label>
	{/each}
</div>
