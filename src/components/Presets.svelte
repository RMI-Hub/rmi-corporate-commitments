<script>
	export let presets = {};
	export let open = false;

	function handleOpen(e) {
		open = !open;
	}
</script>

<style>
	.presets {
		width: 100%;
		overflow: scroll;
		display: flex;
		align-items: flex-start;
		margin: var(--gap) 0;
	}
	.presets__list {
		margin: 0;
		padding: 0;
		list-style: none;

		display: flex;
		gap: 0.5rem;
	}

	.preset {
		flex: 0 0 fit-content;
	}

	.preset__btn {
		font: bold var(--font-size-small) / 1em var(--sans-serif-fonts);
		color: var(--color-gray);
		text-transform: uppercase;
		border: 1px solid var(--color-gray);

		border-radius: 5px;
		background-color: transparent;
		padding: 0.5rem;
		cursor: pointer;
		transition: border-color var(--speed-transition-fast) ease,
			color var(--speed-transition-fast) ease,
			background-color var(--speed-transition-fast) ease;
	}

	.preset__btn:hover,
	.preset__btn:focus {
		border-color: var(--color-accent);
		background-color: var(--color-accent);
		color: var(--color-accent-text);
	}
	.preset__toggle {
		font-weight: bold;
		border: none;
		background-color: transparent;
		cursor: pointer;
		min-height: var(--tap-target);
		padding: 0.5rem 0;
		min-width: fit-content;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-right: var(--gap);
	}
	.preset__toggle__icon {
		display: inline-block;
		background: var(--color-font);
		width: 0.6rem;
		height: 0.6rem;
		clip-path: polygon(50% 0, 100% 100%, 0 100%);
		transform: rotate(90deg);
		transition: transform var(--speed-transition) ease-in-out;
	}
	/* OPEN STATE */
	.open .presets__list {
		flex-wrap: wrap;
	}

	.open .preset__toggle__icon {
		transform: rotate(180deg);
	}
</style>

<div class="presets container" class:open>
	<button class="preset__toggle" on:click={handleOpen}>
		Case studies
		<span class="preset__toggle__icon" />
		<span class="visually-hidden">Open this list of preset charts</span>
	</button>
	<ul class="presets__list">
		{#each Object.entries(presets) as [id, { label }]}
			<li class="preset"><button class="preset__btn">{label}</button></li>
		{/each}
	</ul>
</div>
