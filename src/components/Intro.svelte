<script>
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
</style>

<header class="container">
	{#if headline}<h1 class="header">{headline}</h1>{/if}
	{#if intro}
		<p>{@html intro}</p>
	{/if}
</header>
