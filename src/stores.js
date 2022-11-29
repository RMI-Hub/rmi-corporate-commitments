import { writable } from "svelte/store";

export const yearly = writable([]);
export const cumulative = writable([]);
export const multipliers = writable({ scope: "scope1", growth: "growth_sp" });
