import * as path from "path";
import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import json from "@rollup/plugin-json";
import replace from "@rollup/plugin-replace";
import css from "rollup-plugin-css-only";
import svg from "rollup-plugin-svg-import";
const production = !process.env.ROLLUP_WATCH;
const PROJECT_SLUG = path.basename(__dirname);

export default {
	input: "src/main.js",
	output: {
		sourcemap: true,
		format: "iife",
		name: "app",
		file: "public/bundle.js",
	},
	plugins: [
		svelte({
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production,
				// Enable hydratabe apps
				hydratable: true,
				accessors: !production,
			},
		}),
		// we'll extract any component CSS out into
		// a separate file - better for performance
		css({ output: "bundle.css" }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration —
		// consult the documentation for details:
		// https://github.com/rollup/rollup-plugin-commonjs
		resolve({
			browser: true,
			dedupe: importee => importee === "svelte" || importee.startsWith("svelte/"),
		}),
		commonjs(),

		json(), // so we can import json files

		// use process.env in browser code
		replace({
			"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "dev"),
			preventAssignment: true,
		}),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload("public"),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser(),

		svg({
			// process SVG to DOM Node or String. Default: false
			stringify: true,
		}),
	],
	watch: {
		clearScreen: false,
	},
};
