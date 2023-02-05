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

// Returns a lookup of lists for sectors and industries, mashed up with provided text if available.
function getSectors(microcopy = {}, data = []) {
	/*
	sectorsAndIndustries = {
		sectorOrIndustry:{
			heading:"",
			description:"",
		}
		sectorOrIndustry:{
			heading:"",
			description:"",
		}
		sectorOrIndustry:{
			heading:"",
			description:"",
		}


*/

	// Make an alphabetical list of sectors
	/*
[
	[sectorName, [industry, industry, industry, ...]],
	[sectorName, [industry, industry, industry, ...]],
	[sectorName, [industry, industry, industry, ...]],
]

*/
	const groupedSectors = groupBy(data, d => d.Sector);
	const sectors = Object.entries(groupedSectors).reduce((acc, [sector, rows]) => {
		if (!sector) return acc;
		const industries = Array.from(new Set(rows.map(r => r.Industry))).sort();
		acc.push([sector, industries]);
		return acc;
	}, []);

	// Put them in alpha order
	sectors.sort((a, b) => {
		return a[0] < b[0] ? -1 : 1;
	});

	// Make a flat lookup for all the sectors and industry
	const sectorsMicrocopy = sectors.flat(2).reduce((acc, curr) => {
		const slug = slugify(curr);
		if (microcopy[slug]) {
			acc[slug] = microcopy[slug];
		}
		return acc;
	}, {});

	// Craft a little stylesheet to help the overall chart along.
	const chartOverallStyles = sectors.flat(2).reduce((acc, curr) => {
		const slug = slugify(curr);
		console.log({ curr, slug });
		acc += `[data-active-sector="${slug}"] #${slug}{
			--color:var(--color-accent);
		}`;
		return acc;
	}, "");

	console.log(chartOverallStyles);
	// Write our sector metadata files to the config
	return Promise.all([
		fs.writeFile(
			path.join(__dirname, "../src/config/sectors.json"),
			JSON.stringify(sectors),
			"utf-8"
		),
		fs.writeFile(
			path.join(__dirname, "../src/config/chart-overall.css"),
			chartOverallStyles,
			"utf-8"
		),
		fs.writeFile(
			path.join(__dirname, "../src/config/sectorsMicrocopy.json"),
			JSON.stringify(sectorsMicrocopy),
			"utf-8"
		),
	]);
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

	getSectors(sectorMicrocopy, data);

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
