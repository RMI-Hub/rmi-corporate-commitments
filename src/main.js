import App from "./App.svelte";
import microcopy from "./microcopy.json";

const app = new App({
	hydrate: true,
	target: document.getElementById("rmi"),
	props: {
		...microcopy,
	},
});

export default app;
