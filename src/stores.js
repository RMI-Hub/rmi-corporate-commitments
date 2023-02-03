import { writable } from "svelte/store";
import presets from "./config/presets.json";
import sectors from "./config/sectors.json";

export const chartData = writable({});
// Sectors is an array of arrays, hence this line here
export const activeSector = writable(sectors[0][0]);

// These are the default multipliers
const { initial = null } = presets;
export const multipliers = writable(initial.toggles);
