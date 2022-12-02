import { writable } from "svelte/store";

export const multipliers = writable({
	scope: "Scope 1",
	sector_emission_intensity: "Min",
	agr: "S&P",
	end_target: "Current",
	interim_target: "Current",
	slowdown: 2022,
	partial_target: 0.25,
	offsets: 0,
});
export const chartData = writable({});
