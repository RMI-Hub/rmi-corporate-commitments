const throttle = require("lodash.throttle");
const groupBy = require("lodash.groupby");
const { getEmissionsValues } = require("./get-emission-values.js");
const fs = require("fs/promises");
const path = require("path");

// THis is our data cache
const sectors = new Map();

/**
 *
 * Takes our two data sets and convers them into a stack, so we can get the overall domain and set each chart to the same scale
 * @param {*} target
 * @param {*} baseline
 * @param {*} companies
 * @returns
 */
async function getYearlyMax(target, baseline, companies) {
	const { stack, max } = await import("d3");
	let maxValue = 0;
	const stacker = stack().keys(companies);
	for (let d of [target.yearly, baseline.yearly]) {
		const s_data = stacker(d);
		maxValue = Math.max(
			maxValue,
			max(s_data[s_data.length - 1], d => d[1])
		);
	}
	// Nudge the max value a little higher so the scale definitely encapsulates it
	return maxValue * 1.1;
}

/**
 * Looks at the `activeSector` and loads the appropriate data file from our cache. If the data is not in the cache,
 * then it goes and gets it. This function is throttle to once every 250ms.
 */
const data = throttle(
	async ({ activeSector, multipliers = DEFAULT_MULTIPLIERS }) => {
		return new Promise(async (resolve, reject) => {
			// Get D3
			const { csvParse } = await import("d3");

			// Check the cache for our data, or fetch it.
			let sectorData;
			if (sectors.has(activeSector)) {
				// This data is already fetched and cached. Use it.
				sectorData = sectors.get(activeSector);
			} else {
				// This data is not cached. Get it. Cache it.

				const dataPath = path.join(__dirname, `data/${activeSector}.csv`);
				sectorData = await fs
					.readFile(dataPath, "utf-8")
					.catch(console.error)
					.then(csvParse)
					.then(d => {
						// Except for sector and company coerce to numbers or null
						return d.map(row => {
							for (let [key, value] of Object.entries(row)) {
								if (["sector", "company", "industry"].includes(key.toLowerCase())) {
									continue;
								}
								row[key] = +value ? +value : null;
							}
							return row;
						});
					})
					.catch(e => {
						console.error(e);
						console.error(`Trying to get ${dataURL}`);
						reject(e);
					});
				sectors.set(activeSector, sectorData);
			}

			// These are all the unique companies in the sector
			const companies = [...new Set(sectorData.map(s => s.Company))];

			// Split out the yearly figures
			const yearly = sectorData.map(row => {
				return {
					name: row.Company,
					year: row.Year,
					...getEmissionsValues({ row, multipliers }),
				};
			});

			// Generate the cumulative figures, grouped by year
			const grouped = groupBy(yearly, d => d["year"]);

			const stack = Object.entries(grouped).map(([year, data]) => {
				const datum = { year: new Date(year, 0, 1), baseline: {}, target: {} };
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
						year: new Date(year, 0, 1),
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
					acc[1] = Math.max(baseline, target, acc[1]);
					return acc;
				},
				[0, 0]
			);
			// Nudge the domain up a little so that the top tick covers all the bars
			cumulative_domain[1] = cumulative_domain[1] * 1.1;

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

			const yearly_max = await getYearlyMax(target, baseline, companies);

			resolve({
				cumulative_domain,
				target,
				baseline,
				yearly_max,
				companies,
			});
		});
	},
	250,
	{ leading: true }
);

module.exports = { data };
