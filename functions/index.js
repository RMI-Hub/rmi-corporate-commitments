const functions = require("firebase-functions");
const express = require("express");
const { data } = require("./data.js");
const cors = require("cors");

const app = express();
const DEFAULT_MULTIPLIERS = {
	scope: "Scope 1",
	sector_emission_intensity: "Min",
	agr: "S&P",
	end_target: "Current",
	interim_target: "Current",
	slowdown: 2022,
	partial_target: 0,
	offsets: 0,
	herd_catch_up: false,
};
app.use(cors({ origin: "*" }));

app.get("/", async (req, res) => {
	let { sector, multipliers = "{}" } = req.query;
	if (!sector) {
		res.status(500).send(`${sector} is not a sector.`);
	}
	// Make sure we have a complete set of multiplers
	multipliers = { ...DEFAULT_MULTIPLIERS, ...JSON.parse(multipliers) };
	const d = await data({
		activeSector: sector,
		multipliers: multipliers,
	});

	res.status(200).json(d);
});

exports.data = functions.https.onRequest(app);
