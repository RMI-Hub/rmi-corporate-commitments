<script>
	export let x, y;
	export let flip = false;
	export let hidden = true;
</script>

<style>
	.tooltip {
		font: var(--font-size-small) / 1.3em var(--sans-serif-fonts);
		width: 200px;
		border: 1px solid var(--color-slate);
		border-radius: 0.5rem;
		padding: 0.75rem;
		background-color: white;
		transition: opacity var(--speed-transition);

		position: fixed;
		top: var(--y);
		left: var(--x);
		z-index: 10;
	}

	.tooltip[hidden] {
		opacity: 0;
	}

	@media all and (min-width: 1024px) {
		.tooltip.flip {
			transform: translate(-100%, 0);
		}
	}
</style>

<div {hidden} class="tooltip" class:flip style:--x="{x}px" style:--y="{y}px">
	<slot />
</div>
