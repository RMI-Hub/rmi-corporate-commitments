import throttle from "lodash.throttle";
import groupBy from "lodash.groupby";
import { csv } from "d3";

// THis is our data cache
const data = new Map();
/**
 * Looks at the `activeSector` and loads the appropriate data file from our cache. If the data is not in the cache,
 * then it goes and gets it. This function is throttle to once every 250ms.
 */
export const fetchData = throttle(
	async ({ intensity, activeSector, growth }) => {
		return new Promise(async (resolve, reject) => {
			console.log("NEW DATA FETCHING", { intensity, activeSector });
			let sectorData;
			if (data.has(activeSector)) {
				// This data is already fetched and cached. Use it.
				sectorData = data.get(activeSector);
			} else {
				// This data is not cached. Get it. Cache it.
				sectorData = await csv(`/data/${activeSector}.csv`).catch(e => {
					console.error(e);
					reject(e);
				});
				data.set(activeSector, sectorData);
			}

			const yearly = sectorData.map(d => {
				return {
					name: d.company,
					year: new Date(d.year, 0, 1),
					// Rev * growth * multiplier
					baseline: d.revenue * d[growth] * d[intensity],
					// TK: This
					target: d.revenue * d[growth] * d[intensity],
				};
			});

			// Generate the cumulative figures, grouped by year
			const grouped = groupBy(yearly, d => d["year"]);

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
			console.log({ yearly, cumulative });

			const baseline = {
				yearly: yearly.map(a => {
					const { baseline, name, year } = a;
					return {
						year,
						name,
						baseline,
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
				yearly: yearly.map(a => {
					const { name, target, year } = a;
					return {
						year,
						name,
						target,
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
				target,
				baseline,
			});
		});
	},
	250,
	{ leading: true }
);
