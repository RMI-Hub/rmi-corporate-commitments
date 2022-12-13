<script>
	export let sectors = {};
	export let sectorHeader;
	export let value;
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
		position: absolute;
		left: 0;
		top: 0;
		height: 100%;
		z-index: 2;
		cursor: pointer;
		width: 100%;

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
		padding: 3px 1.5rem 0.25em 0;
		border-bottom: 3px solid var(--color-accent);
	}
	.picker__label::after {
		content: "";
		display: inline-block;
		width: 0.5rem;
		height: 0.5rem;

		position: absolute;
		top: 50%;
		right: 0;

		border-left: 2px solid currentColor;
		border-bottom: 2px solid currentColor;
		transform: translate(0, -50%) rotate(-45deg);
		transform-origin: center;
		transition: transform var(--speed-transition);
	}
	.picker__label:hover,
	.picker__label:focus {
		outline: none;
	}
</style>

<p class="picker header " arial-label="About the {value} sector">
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
