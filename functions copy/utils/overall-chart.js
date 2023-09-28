/**
 * jsdom is a pure-JavaScript implementation of many web standards, notably the WHATWG DOM and HTML Standards, for use with Node.js
 * https://www.npmjs.com/package/jsdom
 */

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs/promises");
const path = require("path");
const { slugify } = require("./slugify.js");
const { processData } = require("./process-data.js");
const presets = require("../../src/config/presets.json");
const sectorLookup = require("../../src/config/sectorLookup.json");

/**
 * 	Primary function to pre-render a static SVG area chart of our entire dataset. Writes the file to `./src` for inclusion with the dashboard
 *
 * @returns Promise<SVG>
 */

async function chart() {
	const [d3, rawData] = await Promise.all([
		import("d3"),
		fs.readFile(path.resolve(__dirname, "../data.csv"), "utf8"),
	]);
	// // Create flat list of industries for the area chart
	// const industries = sectors.map(s => s[1]).flat(2);

	const { baseline, industries, cumulative_domain, target, yearly_max } = processData(
		rawData,
		presets.initial.toggles,
		d3
	);

	console.log(`++ There are ${industries.length} industries`);

	const { stack, scaleLinear, scaleTime, area, curveCardinal } = d3;

	const data = baseline.yearly;

	const dom = new JSDOM(`<!DOCTYPE html><body></body>`);

	let body = d3.select(dom.window.document.querySelector("body"));

	const HEIGHT = 900;
	const WIDTH = 1600;

	const MARGINS = { top: 0, right: 0, bottom: 0, left: 0 };
	const canvasHeight = HEIGHT - MARGINS.top - MARGINS.bottom;
	const canvasWidth = WIDTH - MARGINS.left - MARGINS.right;

	let svg = body
		.append("svg")
		.attr("width", "100%")
		.attr("height", "100%")
		.attr("viewbox", `0 0 ${WIDTH} ${HEIGHT}`)
		.attr("preserveAspectRatio", "xMinYMin")
		.attr("role", "img")
		.attr("xmlns", "http://www.w3.org/2000/svg")
		.classed("overall", true);

	const paths = svg
		.append("g")
		.classed("paths", true)
		.attr("transform", `translate(0,${MARGINS.top})`);

	// This will generate the areas, one per industry
	const stacker = stack().keys(industries);
	const s_data = stacker(data);

	// ---- X -------------------------
	const xScale = scaleTime()
		.domain(d3.extent(data, d => d.year))
		.range([0, canvasWidth]);

	// ---- Y -------------------------
	const yScale = scaleLinear().domain([0, yearly_max]).range([canvasHeight, 0]);

	const areaGenerator = area()
		.curve(curveCardinal)
		.x(d => xScale(d.data.year))
		.y0(d => yScale(d[0]))
		.y1(d => yScale(d[1]));

	paths
		.selectAll(".path")
		.data(s_data)
		.join("path")
		.attr("data-industry", d => slugify(d.key))
		.attr("data-sector", d => sectorLookup[slugify(d.key)])
		.classed("path", true)
		.attr("transform", `translate(${MARGINS.left},0)`)
		.attr("d", areaGenerator);

	return fs.writeFile(
		path.join(__dirname, "../../src/icons/chart-overall.svg"),
		body.html(),
		"utf8"
	);
}

if (require.main === module) {
	chart();
}
