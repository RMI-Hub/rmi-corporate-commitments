import { timeFormat, format } from "d3";

export function yearFormatter(d) {
	const year = d.getFullYear();
	if (year % 5 === 0) {
		return timeFormat("%Y")(d).slice(-2) === "25"
			? timeFormat("%Y")(d)
			: timeFormat("\u2019%y")(d);
	}
	return "";
}

// TODO: WHy is this rounding so weird?
export function emissionsNumberFormatter(d) {
	if (d > 1000000000) {
		return `${Math.floor(d / 1000000000)}B`;
	}
	return format(".1s")(d).replace("G", "B");
}
