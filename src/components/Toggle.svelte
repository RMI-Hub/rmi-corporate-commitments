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
		clip-path: inset(50%);
		height: 1px;
		overflow: hidden;
		position: absolute;
		white-space: nowrap;
		width: 1px;
	}

	.label {
		font-size: var(--font-size-small);
		flex-basis: 100%;
		margin: 0;
	}

	.toggles__box {
		flex: 0 0;
		position: relative;
		display: block;
		min-width: 1.5em;
		min-height: 1.5em;
		max-width: 1.5em;
		max-height: 1.5em;
	}

	.toggles__box::after,
	.toggles__box::before {
		display: block;
		content: "";
		position: absolute;
		border-radius: 50%;
	}
	.toggles__box::before {
		border: 2px solid var(--color-font);
		inset: 0;
	}

	.toggles__box::after {
		width: 50%;
		height: 50%;
		top: 50%;
		left: 50%;
		background: var(--color-accent);
		transform: translate(-50%, -50%) scale(0);
		transition: transform var(--speed-transition) ease-in-out;
	}
	input:checked + .toggles__box::after {
		transform: translate(-50%, -50%) scale(1);
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
				class="toggles__btn "
				type="radio"
				id={slugify(text)}
				name={slugify(label)}
				on:click={e => {
					$isPreset = false;
				}}
				{value}
				bind:group={$multipliers[id]} />
			<span class="toggles__box" />
			{text}
		</label>
	{/each}
</div>
