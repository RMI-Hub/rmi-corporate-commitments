<script>
	import { marked } from "marked";
	import { multipliers, isPreset } from "../stores.js";
	import ButtonPreset from "./ButtonPreset.svelte";
	import { fireEvent } from "../utils/analytics.js";

	export let presets = {};
	export let presetsLabel = "";
	export let presetsDescription = "";
	export let column = false;

	let activePreset = "initial";
	function activatePreset({ toggles = {}, id }) {
		activePreset = id;
		// When clicking a preset, start not with the chosen
		// multipliers, but the default settings. Assign our new settings
		$multipliers = Object.assign({}, presets.initial.toggles, toggles);

		$isPreset = true;

		fireEvent(`Preset selected: ${id}`);
	}
</script>

<style>
	.presets__list {
		--btn-padding: 0.5rem;
		--gap: 0.5rem;
		--btn-bg-color: rgba(0, 0, 0, 0.1);
		--btn-hover-bg-right: calc((var(--btn-icon-size) / 2) + var(--btn-padding));
		--btn-icon-size: 2rem;
		--btn-icon-bg-color: var(--color-blue-medium);

		list-style: none;
		margin: 0;
		padding: 0;
		align-items: stretch;
	}
	.presets__list li {
		margin: 0;
	}
</style>

<div class="presets" class:column aria-labelledby="presets-header">
	<h2 id="presets-header" class="header">{presetsLabel}</h2>
	{#if presetsDescription}{@html marked.parse(presetsDescription)}{/if}

	<ul class="presets__list stack">
		{#each Object.entries(presets) as [id, { label = "", description = "", toggles = { } }], index (id)}
			{@const isActive = id === activePreset}
			<li class="preset">
				<ButtonPreset
					{label}
					{description}
					{id}
					active={isActive && $isPreset}
					on:click={e => {
						activatePreset({ toggles, id });
					}} />
			</li>{/each}
	</ul>
</div>
