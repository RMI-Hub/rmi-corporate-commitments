/*
 * Takes our two data sets and convers them into a stack, so we can get the overall domain and set each chart to the same scale
 * @param {*} target
 * @param {*} baseline
 * @param {*} companies
 * @returns
 */
async function getYearlyMax(target, baseline, companies, d3, isOverallChart = false) {
	const { stack, max } = d3;
	let maxValue = 0;
	const stacker = stack().keys(companies);
	for (let d of [target.yearly, baseline.yearly]) {
		const s_data = stacker(d);
		maxValue = Math.max(
			maxValue,
			max(s_data[s_data.length - 1], d => d[1])
		);
	}
	// If this is not the overall chart, then nudge the max value a little higher
	// so the scale definitely encapsulates it
	return isOverallChart ? maxValue : maxValue * 1.1;
}

module.exports = { getYearlyMax };
