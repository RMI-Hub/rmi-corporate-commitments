<script>
	export let sectors = {};
	import { fly } from "svelte/transition";
	export let sectorHeader;
	export let value;

	let showMenu = false;

	const isMobile = false;

	function open() {
		showMenu = true;
	}
	function close() {
		showMenu = false;
	}
</script>

<style>
	.picker {
		font: bold var(--font-size-large) / 1.3em var(--sans-serif-fonts);
		display: flex;
		gap: 0.33em;

		align-items: stretch;
		margin: 0;
	}

	select {
		position: relative;
		z-index: 2;

		width: 100%;
		height: calc(var(--font-size-large) + 0.3em);
		appearance: none;
		background-color: transparent;
		border: none;
		border-radius: 0;

		color: transparent;

		font-size: 1rem;
		font-weight: inherit;
		padding: 0 0 0.25rem 0;
	}

	.picker__label-wrap {
		position: relative;
		flex: 1 1;
	}
	.picker__label {
		font-size: inherit;
		font-weight: inherit;
		background-color: transparent;
		border: none;
		position: absolute;
		left: 0;
		padding-bottom: 0.25em;
		padding-left: 3px;
		border-bottom: 3px solid var(--color-accent);
		cursor: pointer;
	}
	.picker__label::after {
		content: "";
		display: inline-block;
		width: 0.5rem;
		height: 0.5rem;
		margin: 0 0 0 0.75rem;
		border-left: 2px solid currentColor;
		border-bottom: 2px solid currentColor;
		transform: rotate(-45deg) translate(0, -50%);
	}

	.menu {
		position: absolute;
		top: 100%;
		left: 0;
		padding-top: var(--gap);
		z-index: 10;
	}
	.menu__btn {
		display: block;
		width: 100%;
		text-align: left;
		font: bold var(--font-size) / 1em var(--sans-serif-fonts);
		padding: 0.5rem;
		border: none;
		background-color: white;
		cursor: pointer;
		transition: background-color var(--speed-transition) ease-in-out,
			color var(--speed-transition) ease-in-out;
	}

	.menu__select {
		box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.4);
		background-color: white;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.menu__btn:hover {
		background-color: var(--color-gray-light);
	}
	.menu__btn:focus {
		outline: 2px solid var(--color-accent);
	}

	.menu__btn.active {
		background-color: var(--color-accent);
		color: var(--color-accent-text);
	}

	.not-mobile {
		display: none;
	}

	@media all and (min-width: 768px) {
		.mobile {
			display: none;
		}
		.not-mobile {
			display: block;
		}

		.picker__label {
			position: relative;
		}
	}
</style>

<p class="picker header mobile" arial-label="About the {value} sector">
	About
	<span class="picker__label-wrap">
		<span class="picker__label">
			{sectorHeader}
		</span>

		<select bind:value>
			{#each Object.entries(sectors) as [value, { heading }]}
				<option label={heading} {value} />
			{/each}
		</select>
	</span>
</p>

<div class="picker not-mobile" arial-label="About the {value} sector">
	<span class="header">About</span>
	<button
		on:keydown={e => {
			console.log(e);
			if (e.key.toLowerCase() === "escape") close();
		}}
		on:mouseover={open}
		on:mouseleave={close}
		on:focus={open}
		on:blur={close}
		on:click|self={e => {
			if (showMenu) {
				close();
			} else {
				open();
			}
		}}
		class="picker__label">
		{sectorHeader}
		{#if showMenu}
			<div class="menu" transition:fly={{ y: -25, duration: 250 }}>
				<menu class="menu__select">
					{#each Object.entries(sectors) as [id, { heading }]}
						<li>
							<button
								class="menu__btn"
								class:active={id === value}
								on:click={e => {
									value = id;
									close();
								}}>
								{heading}</button>
						</li>
					{/each}
				</menu>
			</div>
		{/if}
	</button>
</div>
