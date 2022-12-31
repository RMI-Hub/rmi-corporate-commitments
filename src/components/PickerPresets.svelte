<script>
	import { marked } from "marked";
	import { onMount } from "svelte";
	import { activeSector, multipliers } from "../stores.js";

	export let presets = {};
	export let presetsLabel = "";
	export let presetsDescription = "";
	export let presetButtonLabel = "";
	export let presetButtonLabelActive = "Now displayed";
	export let column = false;

	let scrollContainer;
	let activePreset = null;
	let scrollIncrement = 100;
	let visiblePreset = 1;
	$: keys = Object.keys(presets);

	// Are the first and/or last presets in the carousel visible?
	const visible = {
		first: false,
		last: false,
	};
	function activatePreset({ toggles = {}, sector_or_industry, id }) {
		activePreset = id;

		// Are we mandating a sector or industry?
		if (sector_or_industry) $activeSector = sector_or_industry;

		// Assign our new settings
		$multipliers = { ...$multipliers, ...toggles };
	}

	function onForward(e) {
		visiblePreset++;
		scrollContainer.scrollBy({
			behavior: "smooth",
			left: scrollIncrement,
			top: 0,
		});
	}
	function onBack(e) {
		visiblePreset--;
		scrollContainer.scrollBy({
			behavior: "smooth",
			left: -1 * scrollIncrement,
			top: 0,
		});
	}

	function initPreset(node) {
		const observer = new IntersectionObserver(
			entries => {
				entries.forEach(entry => {
					const { index = null } = entry.target.dataset;
					console.log({ index });
					if (entry.isIntersecting) {
						visiblePreset = +index + 1;
					}
					if (index === "0") {
						visible["first"] = entry.isIntersecting;
					} else if (+index + 1 === Object.values(presets).length) {
						visible["last"] = entry.isIntersecting;
					}
				});
			},
			{
				rootMargin: "0px 0px 0px 0px",
				threshold: 1,
			}
		);
		observer.observe(node);
	}

	onMount(() => {
		scrollIncrement = scrollContainer.offsetWidth * 0.95;
	});
</script>

<style>
	.presets {
		--button-width: 3rem;
		--button-rotate: 45deg;
		--button-shift-x: -58%;

		--row-text: 1;
		--row-btn: 1;
		--row-list: 2;

		--col-text: 1;
		--col-list: 1 / -1;
		--col-btn-back: 2;
		--col-btn-fwd: 3;

		width: 100%;
		margin: var(--gap) 0;

		display: grid;
		grid-template: auto minmax(1px, 1fr) / minmax(1px, 1fr) repeat(
				2,
				var(--button-width)
			);
		gap: var(--gap);
		align-items: center;
	}

	.presets :global(*) {
		scrollbar-color: transparent transparent; /* thumb and track color */
		scrollbar-width: 0px;
	}

	.presets :global(*)::-webkit-scrollbar,
	.presets :global(*)::-webkit-scrollbar-track,
	.presets :global(*)::-webkit-scrollbar-thumb {
		background: transparent;
		border: none;
		width: 0;
	}

	.presets__text {
		grid-row: var(--row-text);
		grid-column: var(--col-text);
	}

	.presets__list {
		grid-row: var(--row-list);
		grid-column: var(--col-list);
		margin: 0;
		padding: 0 0 1rem 0;
		list-style: none;
		scroll-snap-type: x mandatory;

		display: flex;
		align-items: stretch;
		width: 100%;
		overflow-x: scroll;
	}

	.preset {
		--gap: 0.5rem;
		flex: 1 1 25%;
		min-width: 15rem;
		max-width: 20rem;
		padding: var(--gap);
		transition: background-color var(--speed-transition) ease-in-out;
		scroll-snap-align: start;
	}

	.preset:first-child {
		padding-left: 0;
	}
	.preset:last-child {
		padding-right: 0;
	}

	.preset--active {
		background-color: var(--color-blue-baby);
		background: linear-gradient(to bottom, var(--color-blue-baby), white 85%);
	}

	.preset :global(p) {
		font: var(--font-size-small) / var(--line-height) var(--sans-serif-fonts);
		margin: 0;
	}

	.preset__btn {
		font: var(--font-size-small) / var(--line-height) var(--sans-serif-fonts);
		text-align: center;
		margin-top: auto;
		background-color: var(--color-accent);
		color: var(--color-accent-text);
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		border: 2px solid transparent;
		position: relative;
	}
	.preset__btn::after {
		content: "";
		display: block;
		background-color: var(--color-accent);
		height: 1rem;
		width: 2rem;
		clip-path: polygon(0 0, 100% 0, 50% 100%, 0 0);

		position: absolute;
		top: 100%;
		left: 50%;
		transform: translate(-50%, 0) scale(1, 0);
		transform-origin: top center;
		transition: transform var(--speed-transition) ease-in-out;
	}

	button.preset__btn:not(:disabled):hover,
	button.preset__btn:not(:disabled):focus {
		opacity: 0.7;
	}

	.preset__btn:disabled {
		background-color: transparent;
		color: var(--color-accent);
		border-color: 2px solid var(--color-accent);
	}
	.preset__btn:disabled::after {
		transform: translate(-50%, 0) scale(1);
	}

	.btn {
		grid-row: var(--row-btn);
		grid-column: var(--col-btn-fwd);

		padding: 0;
		height: var(--button-width);
		width: var(--button-width);
		border: 2px solid var(--color-accent);
		border-radius: 50%;
		background-color: transparent;
		cursor: pointer;
		position: relative;
		transition: border-color var(--speed-transition) ease-in-out,
			opacity var(--speed-transition) ease-in-out;
	}

	.btn:not(:disabled):is(:hover, :focus) {
		background-color: var(--color-gray-light);
	}

	.btn:disabled {
		/* --color-accent: var(--color-gray-very-light); */
		opacity: 0.2;
		cursor: not-allowed;
	}

	.btn::after {
		flex: 0 0;
		content: "";
		display: block;
		height: 33%;
		width: 33%;
		border-top: 3px solid var(--color-accent);
		border-right: 3px solid var(--color-accent);

		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(var(--button-shift-x), -50%) rotate(var(--button-rotate));
		transition: border-color var(--speed-transition) ease-in-out;
	}
	.btn--back {
		grid-row: var(--row-btn);
		grid-column: var(--col-btn-back);
	}
	.btn--back::after {
		--button-shift-x: -35%;
		--button-rotate: -135deg;
	}

	/* COLUMN LAYOUT (i.e .in the toggles column) */

	.presets.column {
		--row-btn: 3;
		--row-list: 2;
		--col-text: 1 / -1;
		--col-btn-back: 1;
		--col-btn-fwd: 3;

		margin: 0;
		padding: 0;
		grid-template-columns: var(--button-width) minmax(1px, 1fr) var(--button-width);
	}

	.column .btn--fwd {
		justify-self: end;
	}
	.column .preset {
		padding: 0;
	}

	.column .preset--active {
		background: transparent;
	}

	.column .preset__btn::after {
		content: none;
	}

	.column .presets_now-showing {
		font: var(--font-size-small) / var(--line-height) var(--sans-serif-fonts);
		text-align: center;
	}
</style>

<div class="presets container" class:column aria-labelledby="presets-header">
	<div class="presets__text">
		<h2 id="presets-header" class="header">{presetsLabel}</h2>
		{@html marked.parse(presetsDescription)}
	</div>
	<ul class="presets__list" bind:this={scrollContainer}>
		{#each Object.entries(presets) as [id, { label = "", description = "", suggestedSectors = [], toggles = { }, sector_or_industry = null }], index (id)}
			{@const isActive = id === activePreset}
			<li
				id="preset-{id}"
				class="preset stack"
				class:preset--active={isActive}
				data-index={index}
				use:initPreset>
				<h3 class="sublabel">{label} {id}</h3>
				{#if description}{@html marked.parse(description)}{/if}
				{#if suggestedSectors.length > 0}
					{@const s = [...suggestedSectors]}
					{@const last = s.pop()}
					{@const or = s.length > 0 ? "or" : ""}
					{@const sectorNames = s.join(", ")}
					{@const suggestedText = `Try it with the <strong>${sectorNames} ${or} ${last}</strong>
				${suggestedSectors.length > 0 ? "sectors" : "sector"}`}
					<p class="preset__suggestion">{@html suggestedText}</p>
				{/if}

				<button
					disabled={isActive}
					class="preset__btn"
					on:click={e => {
						activatePreset({ toggles, sector_or_industry, id });
					}}>{isActive ? presetButtonLabelActive : presetButtonLabel}</button>
			</li>
		{/each}
	</ul>
	<button class="btn btn--back" disabled={visible.first} on:click={onBack}>
		<span class="visually-hidden">Move the presets carousel backwards</span>
	</button>
	{#if column}
		<p class="presets_now-showing">
			<strong>{visiblePreset}</strong> of <strong>{Object.keys(presets).length}</strong>
		</p>
	{/if}
	<button class="btn btn--fwd" disabled={visible.last} on:click={onForward}>
		<span class="visually-hidden">Move the presets carousel forward</span>
	</button>
</div>
