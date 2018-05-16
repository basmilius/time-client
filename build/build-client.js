const rollup = require("rollup");
const multiEntry = require("rollup-plugin-multi-entry");
const nodeResolve = require("rollup-plugin-node-resolve");
const uglify = require("rollup-plugin-uglify");

async function run()
{
	const bundle = await rollup.rollup({
		input: [
			"./src/main.js"
		],
		plugins: [
			multiEntry(),
			nodeResolve({
				browser: true,
				jsnext: true,
				main: true
			}),
			uglify({
				compress: {
					drop_console: true,
					drop_debugger: true,
					keep_fargs: false,
					keep_infinity: true,
					passes: 1,
					toplevel: true
				},
				mangle: {
					properties: true,
					toplevel: true
				}
			})
		]
	});

	await bundle.write({
		file: "./dist/bundle.js",
		format: "iife",
		sourcemap: true,
		sourcemapFile: "./dist/bundle.js.map"
	});
}

run().then("Done!");
