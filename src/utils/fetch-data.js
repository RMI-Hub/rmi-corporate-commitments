import throttle from "lodash.throttle";

function getDataURL() {
	if (window.location.href.includes("local")) {
		return "http://127.0.0.1:5001/rmi-st-corporate-commitments/us-central1/data/";
	}

	return "TKTK";
}

/**
 * Pings our cloud function to get the data. This function is throttle to once every 250ms.
 */
export const fetchData = throttle(
	async ({ activeSector, multipliers }) => {
		const u = new URL(getDataURL());
		u.searchParams.set("sector", activeSector);
		u.searchParams.set("multipliers", JSON.stringify(multipliers));

		const data = await fetch(u.toString())
			.then(d => d.json())
			.catch(console.error);
		console.log({ data });
		return data;
	},
	250,
	{
		leading: true,
	}
);
