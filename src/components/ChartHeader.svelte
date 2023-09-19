<script>
	import { createEventDispatcher } from "svelte";

	import Data from "../icons/Data.svelte";
	import Expand from "../icons/Expand.svelte";
	import Share from "../icons/Share.svelte";
	import Toggletip from "./Toggletip.svelte";
	import { fireEvent } from "../utils/analytics.js";

	export let header = "";
	export let subheader = "";
	export let definition = "";
	export let id = "";
	export let flip = false;
	export let type;

	const dataTitle = "See the underlying data";
	const shareTitle = "Share this chart";

	let webShare = testForWebShare();

	const dispatch = createEventDispatcher();

	/**
	 * handleWebShare will, if supported, trigger a device's native share functions
	 */

	function onShare(e) {
		fireEvent("Sharing");

		navigator
			.share({
				text: document.title,
				url: window.location.href,
			})
			.catch(err => {
				console.error(`Couldn't share because of`, err);
			});
	}

	function onShowData(e) {
		dispatch("showData", { type });
		fireEvent("Chart data displayed");
	}

	function onEnlarge(e) {
		dispatch("enlarge", {});
		fireEvent("Fullscreen mode activated");
	}

	function testForWebShare() {
		/**
		 * testForWebShare returns true/false based on whether webshare is supported.
		 * You quickly can check this in Safari desktop, which supports WebShare
		 */
		if (typeof window !== "undefined") {
			return (
				(window.navigator && window.navigator.share) ||
				window.location.href.includes("localhost")
			);
		}
		return false;
	}
</script>

<style>
 .rmi-header {
		--controls-width: 100px;
		display: grid;
		gap: 0.25rem;
		grid-template: auto / minmax(1px, 1fr) var(--controls-width);
		position: relative;
	}
		.rmi-header__text {
		font: bold var(--font-size) / 1.3em var(--sans-serif-fonts);
		margin: 0;
	}

	.rmi-header__subhead {
		margin-top: 0.25rem;
		display: block;
	}

	.rmi-header__controls {
		display: flex;
		flex-flow: row-reverse nowrap;
	}
</style>

<div class="rmi-header">
	{#if header}
		<h2 {id} class="rmi-header__text">
			{@html header}
			{#if definition}
				<Toggletip text={definition} {id} {flip} />
			{/if}
			{#if subheader}
				<span class="sans-serif rmi-header__subhead">{@html subheader}</span>
			{/if}
		</h2>
	{/if}
	<div class="rmi-header__controls">
		<button class="control" on:click={onEnlarge}>
			<span class="visually-hidden">Expand this chart</span>
			<Expand />
		</button>
		<button class="control" on:click={onShowData}>
			<span class="visually-hidden">{dataTitle}</span>
			<Data title={dataTitle} />
		</button>
		{#if webShare}
			<button class="control" on:click={onShare}>
				<span class="visually-hidden">{shareTitle}</span>
				<Share title={shareTitle} />
			</button>
		{/if}
	</div>
</div>
