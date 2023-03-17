<script>
	// UTILS
	import { slugify } from "../utils/slugify.js";
	import { multipliers, isPreset } from "../stores.js";
	import { marked } from "marked";

	// COMPONENTS
	import Toggletip from "./Toggletip.svelte";

	export let longform = false;
	export let label = "";
	export let definition = "";
	export let id = "";
	export let buttons = [];
</script>

<style>
	.toggle {
		position: relative; /* contains toggle tip*/
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: calc(var(--gap) / 2) var(--gap);
		flex-wrap: wrap;
		padding-bottom: var(--gap);
		border-bottom: 1px solid var(--color-gray);
	}

	.toggle__label {
		font-size: var(--font-size);
		flex: 0 0 100%;
		margin: 0;
	}
	.toggle__sublabel {
		flex: 0 0 100%;
		margin: 0;
	}

	.toggle__container {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		cursor: pointer;
	}

	.longform .toggle__container {
		flex: 1 1 100%;
	}

	.toggle__container__btn {
		clip-path: inset(50%);
		height: 1px;
		overflow: hidden;
		position: absolute;
		white-space: nowrap;
		width: 1px;
	}

	.toggle__container__box {
		flex: 0 0;
		position: relative;
		display: block;
		min-width: 1.5em;
		min-height: 1.5em;
		max-width: 1.5em;
		max-height: 1.5em;
	}

	.toggle__container__box::after,
	.toggle__container__box::before {
		display: block;
		content: "";
		position: absolute;
		border-radius: 50%;
	}
	.toggle__container__box::before {
		border: 2px solid var(--color-font);
		inset: 0;
	}

	.toggle__container__box::after {
		width: 50%;
		height: 50%;
		top: 50%;
		left: 50%;
		background: var(--color-accent);
		transform: translate(-50%, -50%) scale(0);
		transition: transform var(--speed-transition) ease-in-out;
	}
	input:checked + .toggle__container__box::after {
		transform: translate(-50%, -50%) scale(1);
	}

	.toggle__container__text {
		margin: 0;
		font: var(--font-size-small) / 1.3em var(--sans-serif-fonts);
	}
</style>

<div class="toggle" class:longform>
	<h3 class="label toggle__label">
		{label}
		<!-- <Toggletip text={definition} /> -->
	</h3>
	<p class="toggle__sublabel sans-serif">{@html marked.parseInline(definition)}</p>
	{#each buttons as { text, value }}
		<label class="toggle__container sans-serif" for={slugify(text)}>
			<input
				class="toggle__container__btn"
				type="radio"
				id={slugify(text)}
				name={slugify(label)}
				on:click={e => {
					$isPreset = false;
				}}
				{value}
				bind:group={$multipliers[id]} />
			<span class="toggle__container__box" />
			<p class="toggle__container__text">{@html marked.parseInline(text)}</p>
		</label>
	{/each}
</div>
