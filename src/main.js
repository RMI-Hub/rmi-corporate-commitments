import App from "./App.svelte";
import microcopy from "./config/microcopy.json";
import toggles from "./config/toggles.json";
import sectors from "./config/sectors.json";

const app = new App({
	hydrate: true,
	target: document.getElementById("rmi"),
	props: {
		...microcopy,
		toggles,
		sectors,
	},
});

export default app;
