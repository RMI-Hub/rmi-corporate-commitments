const fs = require("node:fs/promises");
const path = require("node:path");

async function getCompanies() {
	const { csvParse } = await import("d3");
	const rawText = await fs.readFile(
		path.join(__dirname, "../src/static/data/manufacturing.csv"),
		"utf-8"
	);

	// Generate a list of our unique company names
	const companies = Array.from(
		csvParse(rawText).reduce((a, { Company }) => {
			a.add(Company);
			return a;
		}, new Set())
	);

	fs.writeFile(
		path.join(__dirname, "../src/config/companies.json"),
		JSON.stringify(companies)
	);
}

if (require.main === module) {
	getCompanies();
}

module.exports = { getCompanies };
