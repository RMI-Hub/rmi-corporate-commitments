import { writable } from "svelte/store";

export const target = writable([]);
export const baseline = writable([]);
export const multipliers = writable({
	scope: "scope1",
	growth: "growth_sp",
	sector_emission_intensity: "company",
});
