<script>
	import { isLoading } from "../stores.js";
	import { fade } from "svelte/transition";

	let id = `loading-${Math.random()}`;
</script>

<style>
	.loading {
		position: absolute;
		inset: 0;

		background-color: rgba(255, 255, 0, 0.7);
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>

{#if $isLoading}
	<div class="loading" aria-labelledby={id} transition:fade>
		<p {id} class="visually-hidden">This chart is processing</p>
		<span>*</span>
	</div>
{/if}
