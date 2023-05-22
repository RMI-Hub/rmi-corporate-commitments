import { writable } from "svelte/store";
import { slugify } from "./utils/slugify.js";
import { initial } from "./config/presets.json";
import sectors from "./config/sectors.json";

export const chartData = writable({});
// Sectors is an array of arrays, hence this line here
export const activeSector = writable(sectors[0][0]);
export const highlightSector = writable(slugify(sectors[0][0]));
export const highlightIndustry = writable(null);

// These are the default multipliers
export const multipliers = writable(initial.toggles);

// A boolean that lets us know if the current configuration is a preset (true), or if it includes any user configuration (false)
export const isPreset = writable(true);

// Are we actively waiting for data?
export const isLoading = writable(false);
