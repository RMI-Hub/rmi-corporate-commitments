<script>
	import { fade } from "svelte/transition";

	import { format, timeFormat } from "d3";
	import X from "../icons/X.svelte";

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
		padding-top: 2.25rem;
		background: rgba(255, 255, 255, 0.9);

		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: scroll;
		z-index: 125;
	}

	@supports (backdrop-filter: blur(6px)) {
		.data {
			backdrop-filter: blur(6px);
			background-color: rgba(255, 255, 255, 0.85);
		}
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

	.control.control--close {
		position: absolute;
		top: 0;
		right: 0;
	}
</style>

{#if visible}
	<div class="data" transition:fade={{ duration: 250 }}>
		<button class="control control--close" on:click>
			<X title="Return to the visualization" />
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
				{#each data as row, index}
					<tr>
						<th scope="row">{timeFormat("%Y")(row.year)}</th>
						<td>{format(",")(row[type] || row["total annual emissions"])}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
