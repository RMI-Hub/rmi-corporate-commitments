/**
 *	Util function that takes a string and makes it a nice, slugified version. To do this, we:
	- split the words, then join on hyphens
	- make it lower case
	- pull punctuation
 * 
 * @param  {String} words A string with as many words as you want.
 * @returns {String} Slugified version of `words`
 */
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

module.exports = { slugify };
