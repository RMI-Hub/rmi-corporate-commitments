import App from "./App.svelte";
import microcopy from "./config/microcopy.json";
import toggles from "./config/toggles.json";
import presets from "./config/presets.json";
import sectors from "./config/sectors.json";
import sectorsMicrocopy from "./config/sectorsMicrocopy.json";

const app = new App({
	hydrate: true,
	target: document.getElementById("rmi"),
	props: {
		...microcopy,
		presets,
		toggles,
		sectors,
		sectorsMicrocopy,
	},
});

export default app;
