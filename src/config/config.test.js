const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");

const Ajv = require("ajv/dist/2020");
const ajv = new Ajv({ verbose: true, allowUnionTypes: true });

// describe("Validate config files", validateSchemas);

async function validateSchemas() {
	const files = await fs.readdir("./src/config");

	// Look for our schema files and collect the filenames/slugs
	const tests = files.reduce((acc, curr) => {
		if (curr.includes(".schema.json")) {
			acc.add(curr.replace(/.json/, "").replace(/.schema/, ""));
		}
		return acc;
	}, new Set());

	// For each schema file, test its corresponding json. Config files without schemas are assumed to be immaculate
	for (let t of tests) {
		await test(`JSON validation: >> ${t.toUpperCase()}`, async () => {
			const [data, schema] = await Promise.all([
				fs
					.readFile(`./src/config/${t}.json`, "utf8")
					.then(JSON.parse)
					.catch(e => {
						assert(false, e);
					}),
				fs
					.readFile(`./src/config/${t}.schema.json`, "utf8")
					.then(JSON.parse)
					.catch(e => {
						assert(false, e);
					}),
			]);
			const validator = ajv.compile(schema);

			const v = await validator(data).catch(e => {
				// Our json did not validate, so throw an error.
				const { instancePath, schemaPath, message } = e.errors[0];
				throw new Error(
					`ERROR: ${instancePath} ${message} \n\n See schema: ${schemaPath}`
				);
			});
		});
	}
}
validateSchemas();
