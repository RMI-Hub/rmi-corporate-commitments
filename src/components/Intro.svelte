<script>
	import { marked } from "marked";
	export let headline, intro;
</script>

<style>
	.rmi-container.stack {
		margin-bottom: var(--gap);
	}
	.header {
		font-weight: bold;
		font-size: clamp(2.5rem, 4vw, 3rem);
	}
	.rmi-container {
		padding-block: 0;
	}

	.rmi-container :global(p) {
		font-size: var(--font-size);
	}
</style>

<header class="rmi-container stack">
	{#if headline}<h1 class="header">{headline}</h1>{/if}
	{#if intro}
		{@html marked.parse(intro)}
	{/if}
</header>
