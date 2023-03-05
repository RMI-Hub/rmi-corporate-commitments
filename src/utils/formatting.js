import { timeFormat, format } from "d3";

export function yearFormatter(d) {
	try {
		const year = d.getFullYear();
		if (year % 5 === 0) {
			return timeFormat("%Y")(d).slice(-2) === "25"
				? timeFormat("%Y")(d)
				: timeFormat("\u2019%y")(d);
		}
		return "";
	} catch (e) {
		console.error(e);
		return "";
	}
}

export function emissionsNumberFormatter(d) {
	return format("~s")(d).replace("G", "B");
}
