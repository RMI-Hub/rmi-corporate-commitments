<script>
	import { activeSector, highlightIndustry, highlightSector } from "../stores.js";
	import { slugify } from "../utils/slugify.js";
	import X from "../icons/X.svelte";
	import { fireEvent } from "../utils/analytics.js";

	export let sectors = {};
	export let sectorHeader;
	export let value;

	let buttonDescription = "Click/tap here to change industry or sector.";

	let visible = false;
	let btn; // ref for the main button
	let sectorButtons = [];
	let activeSectorButtonIndex = -1;
	function close(e = {}) {
		if (e.target != btn) {
			document.body.classList.remove("scroll-lock");
			visible = false;
		}
	}

	function initArrowKeys(e) {
		const { type } = e;

		switch (type) {
			case "blur":
			case "focusout":
				document.body.classList.remove("scroll-lock");
				window.removeEventListener("keydown", onKeydown);
				break;
			case "focus":
			case "focusin":
				document.body.classList.add("scroll-lock");
				window.addEventListener("keydown", onKeydown);
				break;
		}
	}
	function onKeydown(e) {
		switch (e.key.toLowerCase()) {
			case "up":
			case "arrowup":
				console.log("up");
				activeSectorButtonIndex = Math.max(0, activeSectorButtonIndex - 1);
				break;
			case "down":
			case "arrowdown":
				if (!visible) {
					visible = true;
				} else {
					activeSectorButtonIndex = Math.min(
						sectorButtons.length - 1,
						activeSectorButtonIndex + 1
					);
				}

				break;
		}
		if (sectorButtons[activeSectorButtonIndex])
			sectorButtons[activeSectorButtonIndex].focus();
	}
	function initSector(node) {
		sectorButtons.push(node);
	}
</script>

<style>
	.wrapper {
		--margin-bottom: var(--gap);
		--carat-width: 0.5rem;
		margin: 0 0 var(--margin-bottom) 0;
		display: flex;
		gap: 0.5em;
		align-items: center;
	}

	.picker {
		flex: 1 1;
		width: fit-content;
		position: relative;
	}
	.picker__button {
		text-align: left;
		padding: 0;
		border: none;
		background-color: transparent;
		cursor: pointer;

		padding: 0 calc(var(--carat-width) * 2) 0 0;
		position: relative;
	}
	.picker__button::before,
	.picker__button::after {
		content: "";
		display: block;
	}
	.picker__button::after {
		height: 3px;
		width: 100%;

		position: absolute;
		top: calc(100% + 0.25 * var(--margin-bottom));
		left: 0;

		background-color: var(--color-accent);
	}

	.picker__button::before {
		height: var(--carat-width);
		width: var(--carat-width);
		border: 2px solid var(--color-accent);
		border-top: none;
		border-right: none;

		position: absolute;
		top: 50%;
		right: 0;
		transform: translate(0, -50%) rotate(-45deg);
	}

	.picker__list {
		/* A fixed modal-ey thing */
		list-style: none;
		padding: var(--gap);
		margin: 0;
		background-color: var(--color-gray-light);
		width: 100%;
		height: 100%;

		position: fixed;
		top: 0;
		left: 0;
		z-index: 10;
		z-index: 1000; /* Enough to sit atop everything, one hopes */
	}

	.picker__list[hidden] {
		display: none;
	}

	.picker__list li {
		border-bottom: 1px solid rgba(255, 255, 255, 0.5);
		border-bottom: 1px solid rgba(255, 255, 255, 0.5);
	}

	.picker__btn {
		cursor: pointer;
		font: var(--font-size-small) / 1em var(--sans-serif-fonts);
		border: none;
		padding: 1rem;
		width: 100%;
		text-align: left;
		background-color: transparent;
	}

	.picker__btn:is(:hover, :focus, .picker__btn--active) {
		background-color: var(--color-accent);
		color: var(--color-accent-text);
		outline: 4px solid var(--color-accent);
	}
	.picker__btn--active {
		text-decoration: underline;
	}

	.picker__btn:focus {
		outline: 2px solid var(--color-accent);
	}

	.picker__btn--sector {
		font-weight: bold;
	}
	.picker__btn--industry {
		padding-left: 2rem;
		font-size: 0.9em;
	}

	.picker__close {
		position: fixed;
		padding: 0;
		cursor: pointer;
		background-color: transparent;
		top: 0;
		right: 0;
		width: var(--tap-target);
		height: var(--tap-target);
		min-width: 3rem;
		min-height: 3rem;
		z-index: 11;
		border: none;
		display: flex;
	}

	.picker__close[hidden] {
		display: none;
	}

	.picker__close :global(svg) {
		width: 45%;
		height: 45%;
		margin: auto;
		stroke: var(--color-gray);
	}
	@media screen and (min-width: 768px) {
		.picker__close {
			display: none;
		}

		.picker__list {
			/* Make a proper dropdown */
			padding: 0;
			margin-top: var(--gap);
			position: absolute;
			top: 100%;
			max-width: 250px;
			height: unset;

			max-height: 24rem;
			overflow: scroll;
			box-shadow: 4px 4px 7px rgba(0, 0, 0, 0.35);
		}
	}
</style>

<svelte:window
	on:click={close}
	on:keydown={e => {
		if (["Escape", "Esc"].includes(e.key)) close();
	}} />

<div class="wrapper">
	<span class="header">About</span>
	<div class="picker" on:focusin={initArrowKeys} on:focusout={initArrowKeys}>
		<button
			bind:this={btn}
			class="picker__button header"
			aria-label="About the {value} sector"
			aria-describedby="sector-industry-description"
			aria-controls="sector-industry-list"
			aria-expanded={visible}
			on:click|stopPropagation={e => {
				fireEvent("sector picker opened");
				visible = !visible;
			}}>
			<span class="picker__label">
				{sectorHeader}
			</span>
			<p id="sector-industry-description" class="visually-hidden">
				{buttonDescription}
			</p>
		</button>
		<ul id="sector-industry-list" class="picker__list" hidden={!visible}>
			{#each sectors as [sector, industries]}
				{#if sector && sector !== ""}
					{@const sectorSlug = slugify(sector)}
					<li>
						<button
							use:initSector
							class:picker__btn--active={sectorSlug === slugify($activeSector)}
							class="picker__btn picker__btn--sector"
							on:click={e => {
								$activeSector = sector;
								$highlightSector = sectorSlug;
								$highlightIndustry = null;
								fireEvent(`New sector/industry chosen: ${sector}`);
							}}>{sector}</button>
					</li>
					{#each industries as industry}
						{@const industrySlug = slugify(industry)}
						<li>
							<button
								use:initSector
								class="picker__btn picker__btn--industry"
								class:picker__btn--active={industrySlug === slugify($activeSector)}
								on:click={e => {
									$highlightIndustry = industrySlug;
									$highlightSector = null;
									$activeSector = industry;
									fireEvent(`New sector/industry chosen: ${sector}/${industry}`);
								}}>{industry}</button>
						</li>
					{/each}
				{/if}
			{/each}
		</ul>
		<button on:click={close} class="picker__close" hidden={!visible}>
			<X title="Close this list" />
			<span class="visually-hidden">Close this list</span>
		</button>
	</div>
</div>
