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
		align-items: baseline;
		margin: 0;
	}

	select {
		position: relative;
		z-index: 2;

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
		position: absolute;
		left: 0;
		padding-bottom: 0.25em;
		border-bottom: 3px solid var(--color-accent);
	}
</style>

<p class="picker header">
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
