import { writable } from "svelte/store";
import presets from "./config/presets.json";
import sectors from "./config/sectors.json";

export const chartData = writable({});
export const activeSector = writable(Object.keys(sectors)[0]);

// These are the default multipliers
const { initial = null } = presets;
export const multipliers = writable(initial.toggles);
