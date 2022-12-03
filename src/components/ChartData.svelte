<script>
	import { fly } from "svelte/transition";

	import { format, timeFormat } from "d3";
	import Chart from "../icons/Chart.svelte";

	export let type;
	export let data = [];
	export let visible = false;
	export let cumulative = true;

	let caption = `Data for ${
		cumulative ? "cumulative" : "yearly"
	} ${type} emissions by year`;
	$: keys = Object.keys(data[0]);
</script>

<style>
	.data {
		padding: var(--gap);
		padding-top: 0;
		background: rgba(255, 255, 255, 0.9);

		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: scroll;
	}

	.close {
		margin: 0 0 0 auto;
		position: sticky;
		top: 0;
		right: 0;

		width: var(--tap-target);
		height: var(--tap-target);

		background-color: rgba(255, 255, 255, 0.75);
		transition: background-color var(--speed-transition);
		border-radius: 50%;
		border: none;
		padding: 0;
		cursor: pointer;

		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close :global(svg) {
		width: 60%;
		height: 60%;
		fill: var(--color-gray);
		transition: fill var(--speed-transition);
	}
	.close:hover :global(svg) {
		fill: var(--color-slate);
	}
	.close:hover {
		background-color: var(--color-gray);
	}
	.close:hover :global(svg) {
		fill: var(--color-slate);
	}
	.data__table {
		font: var(--font-size-very-small) / 1.3em var(--sans-serif-fonts);
		width: 100%;
		border-collapse: collapse;
	}
	.data__table thead th {
		text-transform: uppercase;
	}
	.data__table :is(th, td) {
		text-align: right;
		padding: 0.25rem;
	}

	.data__table :is(th, td):first-child {
		text-align: left;
	}

	.data__table tr:nth-child(even) :is(th, td) {
		background: var(--color-apricot-light);
	}
</style>

{#if visible}
	<div
		class="data"
		in:fly={{ duration: 250, y: 300 }}
		out:fly={{ duration: 250, y: 300 }}>
		<button class="close" on:click>
			<Chart title="Return to the visualization" />
		</button>
		<table class="data__table">
			<caption class="visually-hidden">{caption}</caption>
			<thead>
				{#if cumulative}
					<tr>
						<th scope="col">Year</th>
						<th scope="col">Cumulative {type} emissions</th>
					</tr>
				{:else}
					<tr>
						{#each keys as key}
							<th scope="col">{key}</th>
						{/each}
					</tr>
				{/if}
			</thead>
			<tbody>
				{#each data as row}
					{#if cumulative}
						<tr>
							<th scope="row">{timeFormat("%Y")(row.year)}</th>
							<td>{format(",")(row[type])}</td>
						</tr>
					{:else}
						<tr>
							{#each keys as key, index}
								{#if index === 0}
									<th scope="row">{timeFormat("%Y")(row[key])}</th>
								{:else}
									<td>{format(",")(row[key])}</td>
								{/if}
							{/each}
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
{/if}
