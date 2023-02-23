const groupBy = require("lodash.groupby");
let sectors = require("../src/config/sectors.json");

/**
 *
 * Takes our two data sets and convers them into a stack, so we can get the overall domain and set each chart to the same scale
 * @param {*} target
 * @param {*} baseline
 * @param {*} industries
 * @returns
 */
function getYearlyMax(target, baseline, industries, d3) {
	const { stack, max } = d3;
	let maxValue = 0;
	const stacker = stack().keys(industries);
	for (let d of [baseline.yearly]) {
		const s_data = stacker(d);
		console.log(s_data);
		maxValue = Math.max(
			maxValue,
			max(s_data[s_data.length - 1], d => d[1])
		);
	}
	// Nudge the max value a little higher so the scale definitely encapsulates it
	return maxValue;
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
		scope = "Scope 1",
		sector_emission_intensity = "Min",
		agr = "s&p",
		end_target = "Current",
		interim_target = "Current",
		slowdown = 2022,
		partial_target = 0,
		offsets = 0,
		herd_catch_up = false,
	} = multipliers;

	const { Year: year, Company } = row;
	const companyType = row?.["Company Type"];
	// ------------------------------------------------------------------------
	// ---- Baseline ------------------------------------------------------------
	// ------------------------------------------------------------------------

	/*
	Notes:
	- The `row` variable is the dataframe/df
	- The user-selected toggle values are python case
*/
	// Selected sector intensity (S_Sector_Emission_Intensity)
	// S_Sector_Emission_Intensity = T_Scope + ' Intensity (Sector ' + T_Sector_Emission_Intensity + ') (tCO2e/USD)'
	// df['S_Sector_Emission_Intensity'] = df[S_Sector_Emission_Intensity]

	let sectorEmissionIntensity =
		row[
			`${scope} Emission Intensity (Sector ${sector_emission_intensity}) (tCO2e/USD)`
		];

	// Selected company intensity (S_Company_Emission_Intensity)
	// S_Company_Emission_Intensity = T_Scope + ' Intensity (Company) (tCO2e/USD)'
	// df['S_Company_Emission_Intensity'] = df[S_Company_Emission_Intensity]

	const companyEmissionIntensity =
		row[`${scope} Emission Intensity (Company) (tCO2e/USD)`];

	// Selected Intensity
	// If "Herd catches up to frontrunners" is TRUE, then all industries' intensities are set to minimun
	// if T_HerdCatchesUp == True:
	let emissionIntensity;
	if (herd_catch_up) {
		// Herd_Sector_Emission_Intensity = T_Scope + ' Intensity (Sector Min) (tCO2e/USD)'
		const herdSectorEmissionIntensity =
			row[`${scope} Intensity (Sector Min) (tCO2e/USD)`];
		// df['S_Emission_Intensity'] = np.where(df['Company Type'] == 'Herd',
		// 									  df[Herd_Sector_Emission_Intensity],
		// 									  df['S_Emission_Intensity'])
		emissionIntensity =
			companyType === "Herd" ? herdSectorEmissionIntensity : sectorEmissionIntensity;

		// df['S_Emission_Intensity'] = np.where((df['S_Company_Emission_Intensity'].isnull() == False) & (df['S_Emission_Intensity'].isnull()),
		// 									  df['S_Company_Emission_Intensity'],
		// 									  df['S_Sector_Emission_Intensity'])
	} else {
		// If "Herd catches up to frontrunners" is FALSE, then industries with missing intensiteis are set to the user defined value ('S_Sector Emission_Intensity')
		// if T_HerdCatchesUp == False:
		// df['S_Emission_Intensity'] = np.where(df['S_Company_Emission_Intensity'].isnull() == False,
		// 									  df['S_Company_Emission_Intensity'],
		// 									  df['S_Sector_Emission_Intensity'])

		emissionIntensity = companyEmissionIntensity || sectorEmissionIntensity;
	}

	// Selected Annual Growth Rate (AGR)
	// S_AGR = "Revenue Growth (" + T_AGR + ")";
	// df["S_AGR"] = df[S_AGR];

	const adjustedGrossRevenue = row[`Revenue Growth (${agr})`];
	// START YEAR EMISSIONS
	// df["Start Year Emissions"] =
	// df["S_Emission_Intensity"] * df["Start Year Revenue (USD)"];

	const startYearEmissions = emissionIntensity * row["Start Year Revenue (USD)"];

	// BASELINE MULTIPLIER
	// df["Multiplier (Baseline)"] = df["S_AGR"];

	const multiplierBaseline = adjustedGrossRevenue;

	// BASELINE TRAJECTORY
	// df["Trajectory (Baseline)"] =
	// 	df["Start Year Emissions"] * df["Multiplier (Baseline)"];

	const baseline = startYearEmissions * multiplierBaseline;

	// baseline_check =
	// 	df[
	// 		[
	// 			"A3ID",
	// 			"Company",
	// 			"Sector",
	// 			"Year",
	// 			"S_Sector_Emission_Intensity",
	// 			"S_Company_Emission_Intensity",
	// 			"S_Emission_Intensity",
	// 			"S_AGR",
	// 			"Multiplier (Baseline)",
	// 			"Trajectory (Baseline)",
	// 		]
	// 	];

	// ------------------------------------------------------------------------
	// ---- TARGET ------------------------------------------------------------
	// ------------------------------------------------------------------------

	// End Target Delta
	// S_End_Target = "End Target (" + T_End_Target + ")";
	// df["S_End_Target"] = df[S_End_Target];

	// df["S_End_Target"] = np.where(
	// 	df["S_End_Target"].isnull() == True,
	// 	df["Multiplier (Baseline)"],
	// 	df["S_End_Target"]
	// 	); // Use Baseline Multiplier if company does not have end target

	const endTarget = row[`End Target (${end_target})`] || multiplierBaseline;
	// Interim Target Delta
	// S_Interim_Target = "Interim Target (" + T_Interim_Target + ")";
	// df["S_Interim_Target"] = df[S_Interim_Target];

	// df["S_Interim_Target"] = np.where(
	// 	df["S_Interim_Target"].isnull() == True,
	// 	df["S_End_Target"],
	// 	df["S_Interim_Target"]
	// ); // Use S_End_Target if company does not have interim target

	const interimTarget = row[`Interim Target (${interim_target})`] || endTarget;

	// TARGET MULTIPLIER
	// df["Multiplier (Target)"] = df[["S_End_Target", "S_Interim_Target"]].min((axis = 1)); // Row-wise minimum between End Target Delta and Interim Target Delta

	// df["Multiplier (Target)"] = np.where(
	// 	df["Multiplier (Target)"].isnull() == True,
	// 	df["Multiplier (Baseline)"],
	// 	df["Multiplier (Target)"]
	// ); // Use Baseline Multiplier if both End Target Delta and Interim Target Delta are missing

	let multiplierTarget = Math.min(endTarget, interimTarget) || multiplierBaseline;

	// ADDITIONAL TOGGLES

	// SLOWDOWN MULTIPLIER
	// df["Multiplier (Slowdown)"] =
	// 	df[
	// 		"Slowdown (" +
	// 			str(T_Slowdown) +
	// 			") End Target (" +
	// 			T_End_Target +
	// 			") Revenue Growth (" +
	// 			T_AGR +
	// 			")"
	// 	];

	const multiplierSlowdown =
		row[`Slowdown (${slowdown}) End Target (${end_target}) Revenue Growth (${agr})`];

	// // PARTIAL TARGETS MULTIPLIER
	// df["Multiplier (Partial Targets)"] = np.where(
	// 	df["Multiplier (Target)"] < 1,
	// 	1 + T_Partial_Target,
	// 	1
	// );

	const multiplierPartialTarget = multiplierTarget < 1 ? 1 + partial_target : 1;

	// OFFSETS MULTIPLIER
	// df["Multiplier (Offsets)"] = np.where(
	// 	df["Multiplier (Target)"] < 1,
	// 	1 + T_Offsets,
	// 	1
	// );

	const multiplierOffsets = multiplierTarget < 1 ? 1 + offsets : 1;

	//// FINAL SCENARIO

	// SCENARIO MULTIPLIER
	// df["Multiplier (Scenario)"] =
	// 	df["Multiplier (Slowdown)"] *
	// 	df["Multiplier (Partial Targets)"] *
	// 	df["Multiplier (Offsets)"];

	const multiplierScenario =
		multiplierSlowdown * multiplierPartialTarget * multiplierOffsets;

	// // SCENARIO TRAJECTORY
	// df["Trajectory (Scenario)"] =
	// 	df["Start Year Emissions"] * df["Multiplier (Scenario)"];

	const target = startYearEmissions * multiplierScenario;

	return { baseline, target };
}

/**
 * Looks at the `activeSector` and loads the appropriate data file from our cache. If the data is not in the cache,
 * then it goes and gets it. This function is throttle to once every 250ms.
 */
function processData(rawData, multipliers = {}, d3) {
	const strings = ["A3ID", "Company", "Sector", "Industry", "Year", "Company Type"];

	// Check the cache for our data, or fetch it.
	let sectorData = d3.csvParse(rawData, row => {
		for (let [key, value] of Object.entries(row)) {
			if (!strings.includes(key)) {
				row[key] = +value || null;
			}
		}
		return row;
	});

	// These are all the unique industries in the dataset
	const industries = sectors.map(s => s[1]).flat();

	// Split out the yearly figures
	const yearly = sectorData.map(row => {
		return {
			name: row.Company,
			name: row.Sector,
			name: row.Industry,
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
	const cumulative = Object.entries(grouped).reduce((accumulator, [year, yearData]) => {
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
	}, []);
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
	// cumulative_domain[1] = cumulative_domain[1] * 1.1;

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

	const yearly_max = getYearlyMax(target, baseline, industries, d3);
	return {
		// cumulative_domain,
		// target,
		baseline,
		yearly_max,
		industries,
	};
}

module.exports = { processData };
