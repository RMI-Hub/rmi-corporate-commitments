<script>
	export let sectors = {};
	export let sectorHeader;
	export let value;

	let button; // The main menu button
	let showMenu = false;

	const menuItems = [];

	function open() {
		showMenu = true;
	}
	function close() {
		showMenu = false;
		button.focus();
	}
	function registerMenuItem(node) {
		menuItems.push(node);
	}

	function onKeydown(e) {
		const { target, key } = e;
		const targetIndex = menuItems.indexOf(target);
		switch (key) {
			case "Space":
			case "Enter":
				if (target === button) {
					showMenu ? close() : open();
				} else {
					// this is a menu item
					const { sector } = target.dataset;
					value = sector;
					console.log("New sector", sector, target);
					close();
				}
				break;
			case "Escape":
				console.log("Closing, escape key");
				close();
				break;
			case "Down": // IE/Edge specific value
			case "ArrowDown":
				if (target === button) {
					menuItems[0].focus();
				} else {
					let nextIndex = targetIndex + 1;
					if (nextIndex >= menuItems.length) nextIndex = currentIndex;
					menuItems[nextIndex].focus();
				}
				break;
			case "Up": // IE/Edge specific value
			case "ArrowUp":
				// Skip this if it's the top button
				if (target === button) return;

				// Move up to the main button from the top menu item
				if (targetIndex === 0) button.focus;

				// Move back a menu item
				menuItems[targetIndex - 1].focus();
				break;
		}
	}
</script>

<style>
	.picker {
		font: bold var(--font-size-large) / 1.3em var(--sans-serif-fonts);
		display: flex;
		gap: 0.33em;

		align-items: stretch;
		margin: 0;
	}

	select {
		position: relative;
		z-index: 2;

		width: 100%;
		height: calc(var(--font-size-large) + 0.3em);
		appearance: none;
		background-color: transparent;
		border: none;
		border-radius: 0;

		color: transparent;

		font-size: 1rem;
		font-weight: inherit;
		padding: 0 0 0.25rem 0;
	}

	.picker__label-wrap {
		position: relative;
		flex: 1 1;
	}
	.picker__label {
		font-size: inherit;
		font-weight: inherit;
		background-color: transparent;
		border: none;
		position: absolute;
		left: 0;
		padding: 3px 1.5rem 0.25em 0;
		border-bottom: 3px solid var(--color-accent);
		cursor: pointer;
	}
	.picker__label::after {
		content: "";
		display: inline-block;
		width: 0.5rem;
		height: 0.5rem;

		position: absolute;
		top: 50%;
		right: 0;

		border-left: 2px solid currentColor;
		border-bottom: 2px solid currentColor;
		transform: translate(0, -50%) rotate(45deg);
		transform-origin: center;
		transition: transform var(--speed-transition);
	}
	.picker__label:hover,
	.picker__label:focus {
		outline: none;
	}
	.open.picker__label::after,
	.open.picker__label::after {
		transform: translate(0, -50%) rotate(-45deg);
	}

	.menu {
		position: absolute;
		top: 100%;
		left: 0;
		padding-top: var(--gap);
		z-index: 10;
		transition: all var(--speed-transition) ease-in-out;
		opacity: 0;
		transform: translate(0, -15px);
	}

	.menu.visible {
		opacity: 1;
		transform: translate(0);
	}
	.menu__select {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.menu__btn {
		display: block;
		width: 100%;
		text-align: left;
		font: bold var(--font-size) / 1em var(--sans-serif-fonts);
		padding: 0.5rem 0.5rem 0.5rem 1rem;
		background-color: var(--color-blue-medium);
		color: var(--color-slate);
		box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.4);
		border-bottom: 3px solid rgba(255, 255, 255, 0.8);
		cursor: pointer;
		position: relative;
		transition: background-color var(--speed-transition) ease-in-out,
			color var(--speed-transition) ease-in-out;
	}

	.menu__btn:last-child {
		border-bottom: none;
	}

	.menu__btn::before {
		content: "";
		display: block;
		height: 0.35rem;
		width: 0.35rem;
		background-color: transparent;
		border-radius: 50%;

		position: absolute;
		top: 50%;
		left: 0.5rem;
		transform: translate(-50%, -50%);
		transition: background-color var(--speed-transition);
	}

	.menu__btn:first-child {
		border-radius: 0.5rem 0.5rem 0 0;
	}
	.menu__btn:last-child {
		border-radius: 0 0 0.5rem 0.5rem;
	}

	.menu__btn[aria-selected],
	.menu__btn:hover,
	.menu__btn:focus {
		background-color: var(--color-accent);
		color: var(--color-accent-text);
		border-color: rgba(255, 255, 255, 0.5);
		outline: none;
	}
	.menu__btn:hover::before,
	.menu__btn:focus::before {
		background-color: currentColor;
	}

	.not-mobile {
		display: none;
	}

	@media all and (min-width: 768px) {
		.mobile {
			display: none;
		}
		.not-mobile {
			display: block;
		}

		.picker__label {
			position: relative;
		}
	}
</style>

<p class="picker header mobile" arial-label="About the {value} sector">
	About
	<span class="picker__label-wrap">
		<span class="picker__label">
			{sectorHeader}
		</span>

		<select bind:value>
			{#each Object.entries(sectors) as [value, { heading }]}
				<option label={heading} {value} />
			{/each}
		</select>
	</span>
</p>

<div class="picker not-mobile" arial-label="About the {value} sector">
	<span class="header">About</span>
	<button
		bind:this={button}
		on:keydown|preventDefault={onKeydown}
		on:mouseover={open}
		on:mouseleave={close}
		on:focus={open}
		on:focusin={open}
		on:blur={close}
		on:focusout={close}
		on:click|self={e => {
			if (showMenu) {
				close();
			} else {
				open();
			}
		}}
		aria-controls="sector-menu"
		aria-expanded={showMenu}
		class="picker__label"
		class:open={showMenu}>
		{sectorHeader}

		<div class="menu" class:visible={showMenu}>
			<menu id="sector-menu" class="menu__select">
				{#each Object.entries(sectors) as [id, { heading }]}
					<!-- aria-activedescendant:  Set to the ID of the focused item, if there is one.-->
					<li
						data-sector={id}
						id="sector-menu-{id.toLowerCase()}"
						role="button"
						class="menu__btn"
						aria-selected={id === value ? true : null}
						on:click={e => {
							value = id;
							close();
						}}
						on:keydown|preventDefault={onKeydown}
						use:registerMenuItem>
						{heading}
					</li>
				{/each}
			</menu>
		</div>
	</button>
</div>
