<script>
	// UTILS
	import { slugify } from "../utils/slugify.js";
	import { multipliers } from "../stores.js";
	import { marked } from "marked";

	// COMPONENTS
	import Button from "./Button.svelte";
	import Toggletip from "./Toggletip.svelte";
	import PickerPresets from "./PickerPresets.svelte";

	export let togglesLabel;
	export let togglesDescription = "";
	export let toggles = [];
	export let defaultMultipliers = {};

	// FOR THE PRESETS
	export let presets = {};
	export let presetsMicrocopy = {};

	let visible = false;

	const doc = document ? document.body : null;
	function openControls(e) {
		if (doc) doc.classList.add("scroll-lock");
		visible = true;
	}
	function closeControls(e) {
		if (doc) doc.classList.remove("scroll-lock");
		visible = false;
	}
	function onReset(e) {
		$multipliers = defaultMultipliers;
	}
</script>

<style>
	.toggles {
		height: 100%;
		width: 100%;
		position: fixed;
		top: 0;

		transition: right var(--speed-transition) ease-in-out;
		right: 100%;

		overflow: scroll;
	}

	.toggles.visible {
		right: 0;
	}

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

	@media all and (min-width: 1024px) {
		.open,
		.close {
			display: none;
		}

		.toggles {
			--button-height: 3rem;
			position: relative;
			right: unset;
			height: 100%;
		}

		.toggles__form {
			position: absolute;
			top: 0;
			left: 0;
			height: 100%;
			width: 100%;
			overflow: visible;
		}

		.toggles__ui {
			flex: 1 1;
			max-height: calc(100% - var(--button-height));
		}

		.toggles__buttons {
			flex: 0 0 var(--button-height);
			display: flex;
			gap: var(--gap);
		}
	}
</style>

<button class="open" on:click={openControls}>Controls</button>
<div class="toggles" class:visible>
	<button class="close" on:click={closeControls}>X</button>
	<div class="toggles__form stack">
		<PickerPresets {presets} {...presetsMicrocopy} column={true} />
		<h2 class="header">{togglesLabel}</h2>
		{#if togglesDescription}{@html marked.parse(togglesDescription)}{/if}
		<div class="toggles__ui stack--margin">
			{#each toggles as { label, definition, id, buttons = [], longform = false }}
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
								{value}
								bind:group={$multipliers[id]} />
							{text}
						</label>
					{/each}
				</div>
			{/each}
		</div>
		<div class="toggles__buttons">
			<Button on:click={onReset}>Reset</Button>
			<!-- <Button type="submit" active={true}>Submit</Button> -->
		</div>
	</div>
</div>
