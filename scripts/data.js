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

function getSectors(microcopy = {}, sectors = []) {
	const sectorsComplete = sectors.reduce((acc, curr) => {
		const sectorSlug = slugify(curr);
		const { heading = null, description = null } = microcopy?.[sectorSlug] ?? {};

		acc[sectorSlug] = {
			heading: heading || curr,
			description,
		};

		return acc;
	}, {});

	return fs.writeFile(
		path.join(__dirname, "../src/config/sectors.json"),
		JSON.stringify(sectorsComplete),
		"utf-8"
	);
}

async function generateSectors() {
	const { csvParse } = await import("d3");

	let [data, sectorMicrocopy] = await Promise.all([
		fs.readFile(path.join(__dirname, "../src/data/data.csv"), "utf-8").then(csvParse),

		fs
			.readFile(path.join(__dirname, "../src/data/sectors.json"), "utf-8")
			.then(JSON.parse),
	]).catch(console.error);

	getCompanies(data);

	// Group by sector for outputting
	const sectors = groupBy(data, d => d.Sector);

	getSectors(sectorMicrocopy, Object.keys(sectors));

	return Promise.all(
		Object.entries(sectors).map(([sector, data]) => {
			// Strip unused fields from each sector sheet
			for (let d of data) {
				delete d["Sector"];
				delete d["ID"];
				delete d["A3ID"];
				// delete d[Object.keys(d)[0]];
			}

			return fs
				.writeFile(
					path.join(__dirname, `../public/data/${slugify(sector)}.csv`),
					parse(data),
					"utf8"
				)
				.catch(console.error);
		})
	);
}
function slugify(words = null) {
	if (!words) return;
	let slug = words
		.trim()
		.split(" ")
		.join("-") // Effective replaces all whitespace with dashes
		.toLowerCase()
		.replace(/[^a-z0-9-_]/g, "") // Deletes all non alphanumeric characters, except dashes and underscores
		.replace(/^-|-$|^_|_$/, ""); // Deletes any leading or trailing dashes or underscores
	return slug;
}

if (require.main === module) {
	generateSectors();
}

module.exports = { getCompanies, generateSectors };
