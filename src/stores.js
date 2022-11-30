import { writable } from "svelte/store";

export const multipliers = writable({
	scope: "scope1",
	growth: "growth_sp",
	sector_emission_intensity: "company",
});
export const chartData = writable({});
