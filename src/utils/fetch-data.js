import throttle from "lodash.throttle";
import groupBy from "lodash.groupby";
import { csv, stack, max } from "d3";

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
function getYearlyMax(target, baseline, companies) {
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
 * Takes a row of data and returns an aobject of the baseline and target values
 *
 * @param {object} params
 * @param {object} params.row | A row of data from the CSV. One row per company per year.
 * @param {object} params.multipliers | The collection of toggles as configured by the user
 *
 * @returns {object} The values {target, baseline} for that company in that year
 */
function getEmissionsValues({ row = {}, multipliers = {} }) {
	const {
		scope,
		agr,
		sector_emission_intensity,
		end_target,
		interim_target,
		partial_target,
		offsets,
		slowdown,
	} = multipliers;

	const { Year: year } = row;

	// Sector intensity
	const sectorEmissionIntensity =
		row[`${scope} Intensity (Sector ${sector_emission_intensity})`] || null;

	// Company intensity
	// TODO: Add units
	const companyEmissionIntensity =
		row[`${scope} Intensity (Company) (tCO2e/USD)`] || null;

	// Selected intensity
	const emissionIntensity = companyEmissionIntensity
		? companyEmissionIntensity
		: sectorEmissionIntensity;

	// # Selected Annual Growth Rate (AGR)
	const multiplierBaseline = row[`Revenue Growth (${agr})`];

	// # START YEAR EMISSIONS
	// df['Start Year Emissions'] = df['S_Emission_Intensity'] * df['Start Year Revenue']

	const startYearEmissions = emissionIntensity * row["Start Year Revenue"];

	// # BASELINE MULTIPLIER
	// df['Multiplier (Baseline)'] = df['S_AGR']
	// # BASELINE TRAJECTORY
	// df['Trajectory (Baseline)'] = df['Start Year Emissions'] * df['Multiplier (Baseline)']

	const baseline = startYearEmissions * multiplierBaseline;

	// ------------------------------------------------------------------------
	// ---- TARGET ------------------------------------------------------------
	// ------------------------------------------------------------------------

	// 	# End Target Delta
	const endTargetDelta = row[`End Target (${end_target})`] || multiplierBaseline;

	// # Interim Target Delta
	const interimTargetDelta =
		row[`Interim Target (${interim_target})`] || endTargetDelta;

	// # TARGET MULTIPLIER
	const multiplierTarget =
		Math.min(endTargetDelta, interimTargetDelta) || multiplierBaseline;

	// # ADDITIONAL TOGGLES

	// Slowdown (2040) End Target (Top 50% None to NZT) Revenue Growth (S&P)
	const multiplierSlowdown =
		row[`Slowdown (${slowdown}) End Target (${end_target}) Revenue Growth (${agr})`];

	const multiplierPartialTargets = multiplierTarget < 1 ? 1 + partial_target : 1;

	const multiplierOffsets = multiplierTarget < 1 ? 1 + offsets : 1;

	const multiplierScenario =
		multiplierSlowdown * multiplierPartialTargets * multiplierOffsets;

	const target = multiplierScenario * startYearEmissions;
	return { baseline, target };
}

/**
 * Looks at the `activeSector` and loads the appropriate data file from our cache. If the data is not in the cache,
 * then it goes and gets it. This function is throttle to once every 250ms.
 */
export const fetchData = throttle(
	async ({ activeSector, multipliers }) => {
		return new Promise(async (resolve, reject) => {
			// Check the cache for our data, or fetch it.
			let sectorData;
			if (sectors.has(activeSector)) {
				// This data is already fetched and cached. Use it.
				sectorData = sectors.get(activeSector);
			} else {
				// This data is not cached. Get it. Cache it.

				const dataURL = `data/${activeSector}.csv`;

				sectorData = await csv(dataURL)
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
						reject(e);
					});
				sectors.set(activeSector, sectorData);
			}

			// These are all the unique companies in the sector
			const companies = [...new Set(sectorData.map(s => s.Company))];

			// Split out the yearly figures
			const yearly = sectorData.map(d => {
				return {
					name: d.Company,
					year: d.Year,
					...getEmissionsValues({ row: d, multipliers }),
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

			let yearly_max = getYearlyMax(target, baseline, companies);
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
