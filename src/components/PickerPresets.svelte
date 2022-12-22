<script>
	import { marked } from "marked";
	import { onMount } from "svelte";
	import { activeSector, multipliers } from "../stores.js";

	export let presets = {};
	export let presetsLabel = "";
	export let presetsDescription = "";
	export let presetButtonLabel = "";
	export let presetButtonLabelActive = "Now displayed";

	let scrollContainer;
	let activePreset = null;
	let scrollIncrement = 100;

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
		scrollContainer.scrollBy({
			behavior: "smooth",
			left: scrollIncrement,
			top: 0,
		});
	}
	function onBack(e) {
		scrollContainer.scrollBy({
			behavior: "smooth",
			left: -1 * scrollIncrement,
			top: 0,
		});
	}

	function watchForPreset(element, value) {
		if (typeof window !== "undefined" && window.IntersectionObserver && element) {
			const observer = new IntersectionObserver(
				entries => {
					entries.forEach(entry => {
						// set the src attribute and bail
						console.log(value, {
							isIntersecting: entry.isIntersecting,
							intersectionRatio: entry.intersectionRatio,
							"entry.intersectionRatio >= 1": entry.intersectionRatio >= 1,
						});
						if (entry.isIntersecting) visible[value] = entry.intersectionRatio >= 1;
					});
				},
				{
					rootMargin: "0px 0px 0px 0px",
				}
			);
			observer.observe(element);
		}
	}

	function initPreset(node) {
		const { index = null } = node.dataset;
		if (index === "0") {
			watchForPreset(node, "first");
		} else if (+index + 1 === Object.values(presets).length) {
			watchForPreset(node, "last");
		}
	}

	onMount(() => {
		scrollIncrement = scrollContainer.offsetWidth * 0.55;
	});
</script>

<style>
	.presets {
		--button-width: 3rem;
		--button-rotate: 45deg;
		--button-shift-x: -58%;
		width: 100%;
		margin: var(--gap) 0;

		display: grid;
		grid-template: auto minmax(1px, 1fr) / var(--button-width) minmax(1px, 1fr) var(
				--button-width
			);
		grid-template: auto minmax(1px, 1fr) / minmax(1px, 1fr) repeat(
				2,
				var(--button-width)
			);
		gap: var(--gap);
		align-items: center;
	}

	#presets__text {
		grid-row: 1;
		grid-column: 1;
	}
	.presets__list-container {
		grid-row: 2;
		grid-column: 1/-1;
		overflow-y: hidden;
		overflow-x: scroll;
	}

	@supports (scroll-snap-align: start) {
		.presets__list-container {
			scroll-snap-type: x mandatory;
		}

		.preset {
			scroll-snap-align: start;
		}
	}

	.presets__list {
		margin: 0;
		padding: 0 0 1rem 0;
		list-style: none;

		display: flex;
		align-items: stretch;
		width: fit-content;
		overflow-x: scroll;
	}

	.preset {
		flex: 1 1;
		min-width: 15rem;
		max-width: 20rem;
		padding: var(--gap);
		transition: background-color var(--speed-transition) ease-in-out;
		--gap: 0.5rem;
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
		grid-row: 1;
		grid-column: 3;

		padding: 0;
		height: var(--button-width);
		width: var(--button-width);
		border: 2px solid var(--color-accent);
		border-radius: 50%;
		background-color: transparent;
		cursor: pointer;
		position: relative;
		transition: border-color var(--speed-transition) ease-in-out,
			background-color var(--speed-transition) ease-in-out;

		/* display: flex;
		align-items: center;
		justify-content: center; */
	}

	.btn:not(:disabled):is(:hover, :focus) {
		background-color: var(--color-gray-light);
	}

	.btn:disabled {
		--color-accent: var(--color-gray-very-light);
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
		grid-row: 1;
		grid-column: 2;
	}
	.btn--back::after {
		--button-shift-x: -35%;
		--button-rotate: -135deg;
	}
</style>

<section class="presets container" aria-labelledby="presets-header">
	<div class="presets__text">
		<h2 id="presets-header" class="label">{presetsLabel}</h2>
		{@html marked.parse(presetsDescription)}
	</div>
	<div class="presets__list-container" bind:this={scrollContainer}>
		<ul class="presets__list">
			{#each Object.entries(presets) as [id, { label = "", description = "", suggested = [], toggles = { }, sector_or_industry = null }], index (id)}
				{@const isActive = id === activePreset}
				<li
					id="preset-{id}"
					class="preset stack"
					class:preset--active={isActive}
					data-index={index}
					use:initPreset>
					<h3 class="sublabel">{label} {id}</h3>
					{#if description}{@html marked.parse(description)}{/if}
					{#if suggested}
						{@const last = suggested.pop()}
						{@const or = suggested.length > 0 ? "or" : ""}
						{@const sectorNames = suggested.join(", ")}
						{@const suggestedText = `Try it with the <strong>${sectorNames} ${or} ${last}</strong>
				${suggested.length > 0 ? "sectors" : "sector"}`}
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
	</div>
	<button class="btn btn--back" disabled={visible.first} on:click={onBack}>
		<span class="visually-hidden">Move the presets carousel backwards</span>
	</button>

	<button class="btn btn--fwd" disabled={visible.last} on:click={onForward}>
		<span class="visually-hidden">Move the presets carousel forward</span>
	</button>
</section>
