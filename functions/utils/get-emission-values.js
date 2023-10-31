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
	// If "Herd catches up to frontrunners" is TRUE, then all companies' intensities are set to minimun
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
		// If "Herd catches up to frontrunners" is FALSE, then companies with missing intensiteis are set to the user defined value ('S_Sector Emission_Intensity')
		// if T_HerdCatchesUp == False:
		// df['S_Emission_Intensity'] = np.where(df['S_Company_Emission_Intensity'].isnull() == False,
		// 									  df['S_Company_Emission_Intensity'],
		// 									  df['S_Sector_Emission_Intensity'])

		emissionIntensity = companyEmissionIntensity || sectorEmissionIntensity;
	}

	// Selected Annual Growth Rate (AGR)
	// S_AGR = "Revenue Growth (" + T_AGR + ")";
	// df["S_AGR"] = df[S_AGR];

	const adjustedGrossRevenue = row[`Growth (${agr})`];

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

	const multiplierPartialTarget = multiplierTarget < 1 ? 1 + (partial_target * (year - 2021) / 29 ) : 1;

	// OFFSETS MULTIPLIER
	// df["Multiplier (Offsets)"] = np.where(
	// 	df["Multiplier (Target)"] < 1,
	// 	1 + T_Offsets,
	// 	1
	// );

	const multiplierOffsets = multiplierTarget < 1 ? 1 + (offsets * (year - 2021) / 29 ) : 1;

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
module.exports = { getEmissionsValues };
