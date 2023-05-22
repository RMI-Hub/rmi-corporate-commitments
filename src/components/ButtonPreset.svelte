<script>
	import Arrow from "../icons/Arrow.svelte";
	import Toggletip from "./Toggletip.svelte";

	export let active = false;
	export let label;
	export let description;
	export let id;
</script>

<style>
	.preset {
		/* Sit atop the animated hover element */
		position: relative;
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

		background: linear-gradient(from left, rgba(0, 0, 0, 0.2), rgba(255, 255, 255, 1));
	}

	.preset::before {
		content: "";
		position: absolute;
		top: 0;
		right: var(--btn-hover-bg-right);
		width: 0;
		height: 100%;
		background-color: var(--btn-bg-color);
		transition: width var(--speed-transition) ease-in-out;
		z-index: -1;
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

	/* HOVER/FOCUS/ACTIVE */

	.active .preset__icon,
	.preset:is(:hover, :focus) .preset__icon {
		--btn-icon-bg-color: var(--color-accent);
		transform: translate(0.37rem, 0) scale(1.05);
	}
	.active::before,
	.preset:is(:hover, :focus)::before {
		width: var(--controls-width);
	}
	.active {
		--btn-bg-color: white;
	}
</style>

<button class="preset" class:active on:click>
	<span class="preset__label">{label}</span>
	{#if description}
		<Toggletip text={description} {id} flip={false} />
	{/if}
	<span class="preset__icon">
		<Arrow />
	</span>
</button>
