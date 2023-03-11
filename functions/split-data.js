const fs = require("node:fs/promises");
const path = require("node:path");
const { parse } = require("json2csv");
const groupBy = require("lodash.groupby");
const { slugify } = require("./utils/slugify.js");

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
	const sectorOverallStyles = sectors
		.map(([sector, industries]) => {
			const slug = slugify(sector);
			return `[data-highlight-sector="${slug}"] [data-sector="${slug}"]`;
		})
		.join(",");
	const industryOverallStyles = sectors.map(([sector, industries]) => {
		return industries
			.map(industry => {
				const slug = slugify(industry);
				return `[data-highlight-industry="${slug}"] [data-industry="${slug}"]`;
			})
			.join(",");
	});

	// This is an object/dict that lets us take an industry slug and get the sector slug back.
	const sectorLookup = sectors.reduce((accumulator, [sector, industries]) => {
		industries.forEach(i => {
			accumulator[slugify(i)] = slugify(sector);
		});
		return accumulator;
	}, {});

	// Write our sector metadata files to the config
	return Promise.all([
		fs.writeFile(
			path.join(__dirname, "../src/config/sectors.json"),
			JSON.stringify(sectors),
			"utf-8"
		),
		fs.writeFile(
			path.join(__dirname, "../src/config/sectorLookup.json"),
			JSON.stringify(sectorLookup),
			"utf-8"
		),
		fs.writeFile(
			path.join(__dirname, "../public/chart-overall.css"),
			`${sectorOverallStyles},${industryOverallStyles}{--color:var(--color-accent);}`,
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
		fs.readFile(path.join(__dirname, "/data.csv"), "utf-8").then(csvParse),

		fs
			.readFile(path.join(__dirname, "../src/data/sectors.json"), "utf-8")
			.then(JSON.parse),
	]).catch(console.error);

	console.log("++ Filtering out companies without specified names");
	data = data.filter(d => !!d.Company);

	getCompanies(data);

	// Group by sector for outputting
	const sectors = groupBy(data, d => d.Sector);

	getSectors(sectorMicrocopy, data);

	const industries = groupBy(data, d => d.Industry);

	return Promise.all([
		Object.entries(sectors).map(([sector, data]) => {
			// Strip unused fields from each sector sheet
			for (let d of data) {
				delete d["Sector"];
				delete d["Industry"];
				delete d["ID"];
				delete d["A3ID"];
				// delete d[Object.keys(d)[0]];
			}
			const outputPath = path.join(__dirname, `./data/${slugify(sector)}.csv`);
			console.log(`++ Writing sector ${outputPath}`);
			return fs.writeFile(outputPath, parse(data), "utf8").catch(console.error);
		}),
		Object.entries(industries).map(([industry, data]) => {
			// Strip unused fields from each sector sheet
			for (let d of data) {
				delete d["Sector"];
				delete d["Industry"];
				delete d["ID"];
				delete d["A3ID"];
				// delete d[Object.keys(d)[0]];
			}

			const outputPath = path.join(__dirname, `./data/${slugify(industry)}.csv`);
			console.log(`++ Writing industry ${outputPath}`);
			return fs.writeFile(outputPath, parse(data), "utf8").catch(console.error);
		}),
	]);
}

if (require.main === module) {
	generateSectors();
}

module.exports = { getCompanies, generateSectors };
