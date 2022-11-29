<script>
	// UTILS
	import { slugify } from "../utils/slugify.js";
	import { multipliers } from "../stores.js";

	// COMPONENTS
	import MoreInformation from "./MoreInformation.svelte";
	import Button from "./Button.svelte";

	export let togglesLabel = "Knobs and dials";
	export let toggles = [];

	let visible = false;

	const doc = document ? document.body : null;
	function openControls(e) {
		if (doc) doc.classList.add("scroll-lock");
		visible = true;
	}
	function closeControls(e) {
		if (doc) doc.classList.remove("scroll-lock");
		visible = false;
	}

	function onSubmit(e) {
		console.log("DO SOMETHING!");
	}
</script>

<style>
	.toggles {
		height: 100%;
		width: 100%;
		position: fixed;
		top: 0;

		transition: right var(--speed-transition) ease-in-out;
		right: 100%;

		overflow: scroll;
	}

	.toggles.visible {
		right: 0;
	}

	.toggles__btn-group {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--gap);
		flex-wrap: wrap;
		padding-bottom: var(--gap);
		border-bottom: 1px solid var(--color-gray);
	}

	.toggles__btn-group > * {
		flex: 1 1;
	}

	.toggles__label {
		display: flex;
		align-items: flex-start;
		gap: 0.25rem;
	}

	.toggles__btn {
		font-size: 1em;
		accent-color: var(--color-accent);
	}

	.label {
		font-size: var(--font-size-small);
		flex-basis: 100%;
		margin: 0;
	}

	@media all and (min-width: 1024px) {
		.open,
		.close {
			display: none;
		}

		.toggles {
			--button-height: 3rem;
			position: relative;
			right: unset;
			height: 100%;
			overflow: visible;
		}

		.toggles__form {
			position: absolute;
			top: 0;
			left: 0;
			height: 100%;
			width: 100%;
			overflow: visible;
		}

		.toggles__ui {
			flex: 1 1;
			max-height: calc(100% - var(--button-height));
			overflow-y: scroll;
			overflow-x: visible;
		}

		.toggles__buttons {
			flex: 0 0 var(--button-height);
			display: flex;
			gap: var(--gap);
		}
	}
</style>

<button class="open" on:click={openControls}>Controls</button>
<div class="toggles" class:visible>
	<button class="close" on:click={closeControls}>X</button>
	<form class="toggles__form stack" on:submit|preventDefault={onSubmit}>
		<h2 class="header">{togglesLabel}</h2>
		<div class="toggles__ui stack--margin">
			{#each toggles as { label, definition, buttons = [] }}
				<div class="toggles__btn-group">
					<h3 class="label">
						{label}
						<MoreInformation text={definition} fullwidth={true} />
					</h3>
					{#each buttons as { text, value, group = "foo" }}
						<label class="toggles__label sans-serif" for={slugify(text)}>
							<input
								class="toggles__btn"
								type="radio"
								bind:group={$multipliers[group]}
								id={slugify(text)}
								name={slugify(label)}
								{value} />
							{text}
						</label>
					{/each}
				</div>
			{/each}
		</div>
		<div class="toggles__buttons">
			<Button>Reset</Button>
			<Button type="submit" active={true}>Submit</Button>
		</div>
	</form>
</div>
