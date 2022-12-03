const fs = require("node:fs/promises");
const path = require("node:path");
const { parse } = require("json2csv");
const groupBy = require("lodash.groupby");

async function getCompanies(data) {
	// Generate a list of our unique company names
	const companies = Array.from(
		data.reduce((a, { Company }) => {
			a.add(Company);
			return a;
		}, new Set())
	);

	fs.writeFile(
		path.join(__dirname, "../src/config/companies.json"),
		JSON.stringify(companies)
	);
}

async function generateSectors() {
	const { csvParse } = await import("d3");

	let data = await fs
		.readFile(path.join(__dirname, "../src/data/data.csv"), "utf-8")
		.then(csvParse)
		.catch(console.error);

	getCompanies(data);

	// Group by sector for outputting
	const sectors = groupBy(data, d => d.Sector);

	return Promise.all(
		Object.entries(sectors).map(([sector, data]) => {
			// Strip unused fields from each sector sheet
			data.forEach(d => {
				delete d["Sector"];
				delete d[Object.keys(d)[0]];
			});

			return fs
				.writeFile(
					path.join(__dirname, `../public/data/${sector.toLowerCase()}.csv`),
					parse(data),
					"utf8"
				)
				.catch(console.error);
		})
	);
}

if (require.main === module) {
	generateSectors();
}

module.exports = { getCompanies, generateSectors };
