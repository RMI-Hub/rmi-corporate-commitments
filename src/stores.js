import { writable } from "svelte/store";
import sectors from "./config/sectors.json";

// These are the default multipliers and will pre-configure the toggles
export const multipliers = writable({
	scope: "Scope 1",
	sector_emission_intensity: "Min",
	agr: "S&P",
	end_target: "Current",
	interim_target: "Current",
	slowdown: 2022,
	partial_target: 0,
	offsets: 0,
});
export const chartData = writable({});
export const activeSector = writable(Object.keys(sectors)[0]);
