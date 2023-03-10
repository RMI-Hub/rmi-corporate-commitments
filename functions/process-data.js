const groupBy = require("lodash.groupby");
const { getEmissionsValues } = require("./get-emission-values.js");
let sectors = require("../src/config/sectors.json");

// /**
//  *
//  * Takes our two data sets and convers them into a stack, so we can get the overall domain and set each chart to the same scale
//  * @param {*} target
//  * @param {*} baseline
//  * @param {*} industries
//  * @returns
//  */
function getYearlyMax(target, baseline, industries, d3) {
	const { stack, max } = d3;
	let maxValue = 0;
	const stacker = stack().keys(industries);
	for (let d of [baseline.yearly]) {
		const s_data = stacker(d);
		if (!s_data.length) throw new Error("stacked data has no length. Git LFS problem?");

		maxValue = Math.max(
			maxValue,
			max(s_data[s_data.length - 1], d => d[1])
		);
	}
	// Nudge the max value a little higher so the scale definitely encapsulates it
	return maxValue;
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
