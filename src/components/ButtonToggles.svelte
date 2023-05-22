<script>
	import { fade } from "svelte/transition";
	export let visible = false;

	$: label = visible ? "Close" : "Controls";
</script>

<style>
	.open {
		display: block;
		width: max(3rem, 44px);
		aspect-ratio: 1/1;

		border: 3px solid rgba(255, 255, 255, 0.8);
		border-radius: 50%;

		background-color: var(--color-accent);

		position: fixed;
		bottom: 1rem;
		right: 1rem;

		box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
		z-index: 10000;
		cursor: pointer;
	}

	.icon {
		fill: var(--color-accent-text);
		width: 50%;
		height: 50%;

		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
	.icon--check {
		fill: none;
		stroke-width: 30px;
		stroke: var(--color-accent-text);
	}
	@media all and (min-width: 1024px) {
		.open {
			display: none;
		}
	}
</style>

<button class="open" on:click>
	{#if visible}
		<svg
			transition:fade={{ duration: 75 }}
			class="icon icon--check"
			width="100%"
			height="100%"
			viewBox="0 0 500 500"
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			xml:space="preserve"
			xmlns:serif="http://www.serif.com/"
			style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;">
			<g transform="matrix(2.84379,0,0,2.84379,-318.032,-345.468)">
				<path d="M125.791,226.241L166.694,267.144L275.789,158.049" />
			</g>
		</svg>
	{:else}
		<svg
			transition:fade={{ duration: 75 }}
			class="icon icon--filters"
			role="img"
			width="100%"
			height="100%"
			viewBox="0 0 500 500"
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			xml:space="preserve"
			xmlns:serif="http://www.serif.com/"
			style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
			<title>{label}</title><g>
				<g transform="matrix(1.32287,0,0,1.32287,-32.3196,-126.21)">
					<circle cx="65.262" cy="135.986" r="39.686" />
				</g>
				<g transform="matrix(0.968782,0,0,1.71306,55.1159,-44.8342)">
					<path
						d="M457.942,57.509C457.942,48.533 445.057,41.246 429.186,41.246L143.456,41.246C127.585,41.246 114.7,48.533 114.7,57.509C114.7,66.484 127.585,73.771 143.456,73.771L429.186,73.771C445.057,73.771 457.942,66.484 457.942,57.509Z" />
				</g>
			</g>
			<g transform="matrix(1,0,0,1,0,3.33333)">
				<g transform="matrix(1.32287,0,0,1.32287,-32.3196,0.362666)">
					<circle cx="65.262" cy="135.986" r="39.686" />
				</g>
				<g transform="matrix(0.968782,0,0,1.71306,55.1159,81.7384)">
					<path
						d="M457.942,57.509C457.942,48.533 445.057,41.246 429.186,41.246L143.456,41.246C127.585,41.246 114.7,48.533 114.7,57.509C114.7,66.484 127.585,73.771 143.456,73.771L429.186,73.771C445.057,73.771 457.942,66.484 457.942,57.509Z" />
				</g>
			</g>
			<g transform="matrix(1,0,0,1,0,6.66667)">
				<g transform="matrix(1.32287,0,0,1.32287,-32.3196,126.935)">
					<circle cx="65.262" cy="135.986" r="39.686" />
				</g>
				<g transform="matrix(0.968782,0,0,1.71306,55.1159,208.311)">
					<path
						d="M457.942,57.509C457.942,48.533 445.057,41.246 429.186,41.246L143.456,41.246C127.585,41.246 114.7,48.533 114.7,57.509C114.7,66.484 127.585,73.771 143.456,73.771L429.186,73.771C445.057,73.771 457.942,66.484 457.942,57.509Z" />
				</g>
			</g>
			<g>
				<g transform="matrix(1.32287,0,0,1.32287,-32.3196,263.508)">
					<circle cx="65.262" cy="135.986" r="39.686" />
				</g>
				<g transform="matrix(0.968782,0,0,1.71306,55.1159,344.883)">
					<path
						d="M457.942,57.509C457.942,48.533 445.057,41.246 429.186,41.246L143.456,41.246C127.585,41.246 114.7,48.533 114.7,57.509C114.7,66.484 127.585,73.771 143.456,73.771L429.186,73.771C445.057,73.771 457.942,66.484 457.942,57.509Z" />
				</g>
			</g>
		</svg>
	{/if}
	<span class="visually-hidden">{label}</span>
</button>
