<script>
	import { marked } from "marked";
	export let headline, intro;
</script>

<style>
	.header {
		font-weight: bold;
		font-size: clamp(2.5rem, 4vw, 3rem);
	}
	.container {
		padding-block: 0;
	}

	.container :global(p) {
		font-size: var(--font-size);
	}
</style>

<header class="container stack">
	{#if headline}<h1 class="header">{headline}</h1>{/if}
	{#if intro}
		{@html marked.parse(intro)}
	{/if}
</header>
