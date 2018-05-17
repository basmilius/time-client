const rollup = require("rollup");
const babel = require("rollup-plugin-babel");
const multiEntry = require("rollup-plugin-multi-entry");
const nodeResolve = require("rollup-plugin-node-resolve");
const obfuscate = require("rollup-plugin-javascript-obfuscator");
const uglify = require("rollup-plugin-uglify");
const minify = require("rollup-plugin-babel-minify");

const pkg = require("../package.json");

async function run()
{
	const bundle = await rollup.rollup({
		input: [
			"./src/main.js"
		],
		external: Object.keys(pkg.dependencies),
		plugins: [
			multiEntry(),
			nodeResolve({
				browser: true,
				jsnext: true,
				main: true
			}),
			babel({
				babelrc: false,
				exclude: "node_modules/**",
				presets: ["es2015-rollup", "stage-1"],
				plugins: ["transform-regenerator"]
			}),
			minify({
				comments: false,
				mangle: {
					exclude: ["PIXI"],
					properties: true,
					topLevel: true
				},
				removeConsole: true,
				removeDebugger: true
			})
			// obfuscate(),
			// uglify({
			// 	compress: {
			// 		drop_console: true,
			// 		drop_debugger: true,
			// 		keep_fargs: false,
			// 		keep_infinity: true,
			// 		passes: 1,
			// 		toplevel: true
			// 	},
			// 	mangle: {
			// 		properties: false,
			// 		toplevel: true
			// 	}
			// })
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
