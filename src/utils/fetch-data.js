import throttle from "lodash.throttle";
import groupBy from "lodash.groupby";
import { csv } from "d3";

// THis is our data cache
const sectors = new Map();
/**
 * Looks at the `activeSector` and loads the appropriate data file from our cache. If the data is not in the cache,
 * then it goes and gets it. This function is throttle to once every 250ms.
 */
export const fetchData = throttle(
	async ({ activeSector, multipliers }) => {
		return new Promise(async (resolve, reject) => {
			// Tease out the multipliers
			const { scope, sector_emission_intensity, growth } = multipliers;
			const intensity = `${scope}_intensity_${sector_emission_intensity}`;
			// const target = `TKTK`;

			// Check the cache for our data, or fetch it.
			let sectorData;
			if (sectors.has(activeSector)) {
				// This data is already fetched and cached. Use it.
				sectorData = sectors.get(activeSector);
			} else {
				// This data is not cached. Get it. Cache it.
				sectorData = await csv(`/data/${activeSector}.csv`).catch(e => {
					console.error(e);
					reject(e);
				});
				sectors.set(activeSector, sectorData);
			}

			// Split out the yearly figures
			const yearly = sectorData.map(d => {
				return {
					name: d.company,
					year: new Date(d.year, 0, 1),
					// Rev * growth * multiplier
					baseline: d.revenue * d[growth] * d[intensity],

					// TODO: This is fudged
					target: d.revenue * d[growth] * d[intensity] * 0.65,
				};
			});

			// Generate the cumulative figures, grouped by year
			const grouped = groupBy(yearly, d => d["year"]);

			const stack = Object.entries(grouped).map(([year, data]) => {
				const datum = { year: new Date(year), baseline: {}, target: {} };
				for (const { name, baseline, target } of data) {
					datum.baseline[name] = baseline;
					datum.target[name] = target;
				}

				return datum;
			});

			// Running totals, to track the overall accumulation
			let runningTotalBaseline = 0;
			let runningTotalTarget = 0;

			// Reduce the grouped into an array of objects, one per year
			const cumulative = Object.entries(grouped).reduce(
				(accumulator, [year, yearData]) => {
					// Get our annual totals
					const { baseline, target } = yearData.reduce(
						(a, c) => {
							// Add 'em up
							if (c.baseline) a.baseline += +c.baseline;
							if (c.target) a.target += +c.target;
							return a;
						},
						{ baseline: 0, target: 0 }
					);

					// Add the annual totals to the running totals
					runningTotalBaseline += baseline;
					runningTotalTarget += target;

					// Store our new values
					accumulator.push({
						year: new Date(year),
						baseline: runningTotalBaseline,
						target: runningTotalTarget,
					});
					return accumulator;
				},
				[]
			);
			// These are the min and max values for the charts, so they are on the same scale
			const cumulative_domain = cumulative.reduce(
				(acc, curr) => {
					const { baseline, target } = curr;
					// acc[0] = Math.min(baseline, target, acc[0]);
					acc[1] = Math.max(baseline, target, acc[1]);
					return acc;
				},
				[0, 0]
			);

			const baseline = {
				yearly: stack.map(a => {
					const { baseline, year } = a;
					return {
						year,
						...baseline,
					};
				}),
				cumulative: cumulative.map(c => {
					const { year, baseline } = c;
					return {
						year,
						baseline,
					};
				}),
			};

			const target = {
				yearly: stack.map(a => {
					const { target, year } = a;
					return {
						year,
						...target,
					};
				}),
				cumulative: cumulative.map(c => {
					const { year, target } = c;
					return {
						year,
						target,
					};
				}),
			};

			resolve({
				cumulative_domain,
				target,
				baseline,
			});
		});
	},
	250,
	{ leading: true }
);
