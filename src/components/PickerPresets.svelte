<script>
	import { marked } from "marked";
	import { onMount } from "svelte";
	import Arrow from "../icons/Arrow.svelte";
	import { activeSector, multipliers } from "../stores.js";
	import Toggletip from "./Toggletip.svelte";

	export let presets = {};
	export let presetsLabel = "";
	export let presetsDescription = "";
	export let column = false;

	let activePreset = "initial";
	function activatePreset({ toggles = {}, sector_or_industry, id }) {
		activePreset = id;

		// Are we mandating a sector or industry?
		if (sector_or_industry) $activeSector = sector_or_industry;

		// Assign our new settings
		$multipliers = { ...$multipliers, ...toggles };
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
	.preset {
		position: relative;
	}
	.preset__btn {
		/* Sit atop the animated hover element */
		position: relative;
		z-index: 2;
		font: bold var(--font-size-small) / var(--line-height) var(--sans-serif-fonts);
		text-align: left;
		background-color: transparent;
		color: var(--color-font);
		border: none;
		cursor: pointer;
		padding: 0 var(--btn-padding);
		height: calc(var(--btn-icon-size));
		width: 100%;
		transition: background-color var(--speed-transition) ease-in-out,
			color var(--speed-transition) ease-in-out;

		display: flex;
		align-items: center;
		gap: var(--gap);
	}

	.preset::after {
		content: "";
		position: absolute;
		top: 0;
		right: var(--btn-hover-bg-right);
		width: 0;
		height: 100%;
		max-width: calc(100% - var(--btn-hover-bg-right));
		background-color: var(--btn-bg-color);
		transition: width var(--speed-transition) ease-in-out;
	}

	.preset__icon {
		height: var(--btn-icon-size);
		width: var(--btn-icon-size);
		background-color: var(--btn-icon-bg-color);
		border-radius: 50%;
		margin: 0 0 0 auto;
		display: flex;
		align-items: center;
		justify-content: center;
		transform: scale(1.05);
		transition: transform var(--speed-transition) ease-in-out;
	}

	.preset__icon :global(svg) {
		width: 60%;
		height: 60%;
		fill: var(--color-accent-text);
	}

	.preset--active .preset__icon,
	.preset:is(:hover, :focus) .preset__icon {
		--btn-icon-bg-color: var(--color-accent);
		transform: translate(0.2rem, 0) scale(1.05);
	}
	/* HOVER/FOCUS/ACTIVE */
	.preset--active::after,
	.preset:is(:hover, :focus)::after {
		width: 100%;
	}
	.preset--active {
		--btn-bg-color: white;
	}
</style>

<div class="presets" class:column aria-labelledby="presets-header">
	<h2 id="presets-header" class="header">{presetsLabel}</h2>
	{#if presetsDescription}{@html marked.parse(presetsDescription)}{/if}

	<ul class="presets__list stack">
		{#each Object.entries(presets) as [id, { label = "", description = "", toggles = { }, sector_or_industry = null }], index (id)}
			{@const isActive = id === activePreset}
			<li class="preset" class:preset--active={isActive}>
				<button
					class="preset__btn"
					on:click={e => {
						activatePreset({ toggles, sector_or_industry, id });
					}}>
					{label}
					{#if description}
						<Toggletip text={description} {id} flip={false} />
					{/if}
					<span class="preset__icon">
						<Arrow />
					</span>
				</button>
			</li>{/each}
	</ul>
</div>
