<script>
	export let muted = false;
	export let active = false;
	export let disabled = null;
	export let type = null;
</script>

<style>
	button {
		--btn-color-text: var(--color-slate);
		--btn-color-background: transparent;
		--btn-color-border: var(--color-slate);

		flex: 1 1;
		padding: 0.5rem;
		font: bold var(--font-size-small) / 1.3em var(--sans-serif-fonts);
		border-radius: 6px;
		border: 2px solid var(--btn-color-border);
		cursor: pointer;
		color: var(--btn-color-text);
		background-color: var(--btn-color-background);
		transition: opacity var(--speed-transition-fast) ease-in-out;
	}

	button:hover {
		opacity: 0.7;
	}

	button:focus {
		outline: 2px solid var(--color-accent);
		outline-offset: 3px;
	}

	.active {
		--btn-color-text: var(--color-white);
		--btn-color-background: var(--color-blue-dark);
		--btn-color-border: var(--color-blue-dark);
	}
</style>

<button on:click {type} class:muted class:active {disabled}><slot /></button>
