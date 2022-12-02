import App from "./App.svelte";
import microcopy from "./config/microcopy.json";
import toggles from "./config/toggles.json";
import sectors from "./config/sectors.json";
import companies from "./config/companies.json";

const app = new App({
	hydrate: true,
	target: document.getElementById("rmi"),
	props: {
		...microcopy,
		toggles,
		companies,
		sectors,
	},
});

export default app;
