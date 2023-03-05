<script>
	import { isLoading } from "../stores.js";
	import { fade } from "svelte/transition";

	let id = `loading-${Math.random()}`;
</script>

<style>
	.loading {
		position: absolute;
		inset: 0;
		z-index: 100;
		background-color: rgba(223, 222, 222, 0.95);
		display: flex;
		justify-content: center;
		align-items: center;
		flex-flow: column nowrap;
		gap: 0.5rem;
		border-radius: 0.5rem;
	}

	@supports (backdrop-filter: blur(6px)) {
		.loading {
			backdrop-filter: blur(6px);
			background-color: rgba(223, 222, 222, 0.75);
		}
	}

	svg {
		width: 100px;
	}

	.loading__text {
		font: bold 0.85rem/1em var(--sans-serif-fonts);
		text-align: center;
	}

	.b {
		fill: #003a63;
	}
	.c {
		fill: #44cfcb;
	}

	.b,
	.c {
		animation: fade 1s infinite alternate ease-in-out;
		animation-delay: var(--delay);
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>

{#if $isLoading}
	<div
		class="loading"
		aria-labelledby={id}
		in:fade={{ duration: 250 }}
		out:fade={{ duration: 500 }}>
		<p {id} class="visually-hidden">This chart is processing</p>
		<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 291.18 157">
			<title>RMI logo with two triangles arranged like mountains</title>

			<path
				style:--delay="0"
				class="c"
				d="M210.69,38.44c1.18-1.85,1.18-4.88,0-6.73L192.79,3.6c-1.18-1.85-3.11-1.85-4.29,0L93.68,152.46c-1.18,1.85-.35,3.37,1.85,3.37h37.29c2.19,0,4.31-.5,4.71-1.12s.57-1.21,.4-1.32,.65-1.72,1.83-3.57L210.69,38.44Z" />
			<path
				style:--delay="0.25s"
				class="c"
				d="M285.76,155.82c2.19,0,3.03-1.51,1.85-3.37L220.82,47.61c-1.18-1.85-3.11-1.85-4.29,0l-18.35,28.8c-1.18,1.85-1.18,4.88,0,6.73l44.15,69.31c1.18,1.85,3.94,3.37,6.13,3.37h37.29Z" />

			<path
				style:--delay="0.5s"
				class="b"
				d="M106.54,106.8c1.27,1.79,3.3,1.77,4.52-.06l17.34-25.91c1.22-1.82,1.23-4.81,.01-6.64l-20.29-30.57c-1.21-1.83-3.17-4.84-4.35-6.69l-11.16-17.52c-1.18-1.85-3.11-1.85-4.29,0L3.57,152.46c-1.18,1.85-.35,3.37,1.85,3.37H38.11c2.19,0,4.28-.45,4.63-1.01s.51-1.09,.36-1.19,.68-1.7,1.86-3.55l41.55-65.24c1.18-1.85,3.18-1.9,4.45-.11l15.58,22.06Z" />
		</svg>
		<span class="loading__text">Loading</span>
	</div>
{/if}
