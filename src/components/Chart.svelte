<script>
	import MoreInformation from "./MoreInformation.svelte";

	export let header;
	export let id;
	export let definition;
	export let index;
</script>

<style>
	.chart__container {
		background-color: #aaa;
		height: 300px;
	}

	.chart__header {
		font: bold 1.25rem/1.3em var(--sans-serif-fonts);
	}
</style>

<div class="chart" aria-labelledby="chart-{id}">
	<h2 id="chart-{id}" class="chart__header">
		{header}
		<MoreInformation text={definition} {id} flip={index % 2 !== 0} />
	</h2>
	<div class="chart__container" />
</div>
