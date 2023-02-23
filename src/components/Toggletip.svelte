<script>
	/**
	 * This toggling tooltip takes a text and populated a status live region for screen readers. For visual display, it needs to be in a relative container.
	 */

	import { onMount } from "svelte";
	import { fly } from "svelte/transition";
	import { marked } from "marked";

	// Concepts cribbed from here:
	// - https://inclusive-components.design/tooltips-toggletips/
	// - https://codepen.io/heydon/pen/Vzwdpy

	export let text = "";

	let showInfo = false;
	let btn;
	let fallback;
	$: info = showInfo ? marked.parse(text) : "";

	function handleClick(e) {
		showInfo = true;
	}

	function handleCloseClick(e) {
		const { target } = e;
		if (target !== btn) {
			close();
		}
	}

	function handleKeyDown(e) {
		if (e.key.toLowerCase() === "escape") showInfo = false;
	}
	function close(e) {
		showInfo = false;
	}
	onMount(() => {
		fallback.remove();
	});
</script>

<style>
	.more {
		--color-background: var(--color-gray);
		--icon-size: 1.15rem;

		display: inline-block;
	}

	.more__status {
		/* the bubble element, added inside the toggletip live region */
		position: absolute;
		top: calc(var(--icon-size) + 0.5rem);
		left: 5%;
		width: 90%;
		z-index: 10000;

		background: var(--color-slate);
		padding: 0.75rem;
		border-radius: 0.5rem;

		box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
	}

	.more__status :global(p) {
		font: bold var(--font-size-small) / 1.3em var(--sans-serif-fonts);
		color: white;
		margin-top: 0;
	}

	.more__status :global(p:last-child) {
		margin: 0;
	}
	.more__btn {
		/* The "i" icon */
		font: bold var(--font-size-small) / 1em var(--serif-fonts);
		font-style: italic;

		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--icon-size);
		height: var(--icon-size);
		border: none;
		padding: 0;
		border-radius: 50%;
		cursor: pointer;
		background: var(--color-background);

		transition: background var(--speed-transition-fast) ease-in-out;
		color: white;
	}

	.more:is(:hover, :focus) {
		--color-background: var(--color-gray-dark);
	}

	.more__fallback :global(p) {
		/* Visible w/o javascript */
		font: var(--font-size-small) / 1.3em var(--sans-serif-fonts);
	}
</style>

<svelte:window on:click={handleCloseClick} />
<span class="more">
	<button
		bind:this={btn}
		on:click={handleClick}
		on:keydown={handleKeyDown}
		on:blur={close}
		class="more__btn"
		aria-label="More information"
		type="button"
		data-toggletip-content={text}>i</button>
	{#if info}
		<span class="more__status" transition:fly={{ duration: 250, y: -20 }} role="status">
			{@html info}</span>
	{/if}
</span>
<div class="more__fallback" bind:this={fallback}>{marked.parse(text)}</div>
