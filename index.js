#! /usr/bin/env node
const chalk = require("chalk");
const commandLineArgs = require("command-line-args");
const getUsage = require("command-line-usage");
const validUrl = require("valid-url");
const fs = require("fs-extra");
const NodeFauxPas = require("./NodeFauxPas.js");
const pkg = require("./package.json");

const PLUGIN_NAME = "fauxpas";

function readReport(report) {
	if (options.json) {
		console.log(JSON.stringify(report));
		return;
	}

	var errorCount = report.errorCount;
	var warningCount = report.warningCount;

	report.lines.forEach(line => {
		if (line.level === "error") {
			console.log("* " + chalk.red(line.output));
		} else if (line.level === "warn") {
			console.log("* " + chalk.yellow(line.output));
		}
	});

	if (!errorCount && !warningCount) {
		console.log(
			chalk.underline(PLUGIN_NAME) + ":",
			chalk.green("OK: No faux web fonts or mismatches detected.")
		);
	} else {
		var errorStr = errorCount + " error" + (errorCount != 1 ? "s" : "");
		var warningStr = warningCount + " mismatch" + (warningCount != 1 ? "es" : "");
		console.log(
			chalk.underline(PLUGIN_NAME) + ":",
			errorCount ? chalk.black.bgRed(errorStr) : errorStr,
			"and",
			warningCount ? chalk.black.bgYellow(warningStr) : warningStr
		);
		console.log(
			"\nFor additional help, use the faux-pas bookmarklet (https://filamentgroup.github.io/faux-pas/dist/demo.html) to highlight the elements on the page."
		);

		if (errorCount) {
			process.exitCode = 1;
		}
	}
}

const commandLineOptions = [
	{
		name: "url",
		alias: "u",
		description: "The url or path to an HTML file to test.",
		defaultOption: true,
		type: String,
		typeLabel: "[underline]{url}"
	},
	{
		name: "mismatches",
		description: "Show web font mismatches (even though they don’t result in faux rendering).",
		defaultValue: true,
		type: Boolean
	},
	{
		name: "json",
		description: "Return report as JSON.",
		defaultValue: false,
		type: Boolean
	},
	{
		name: "help",
		alias: "h",
		description: "Display this help documentation.",
		type: Boolean
	}
];

const options = commandLineArgs(commandLineOptions);

if (options.help) {
	console.log(
		getUsage([
			{
				header: PLUGIN_NAME,
				content: pkg.description
			},
			{
				header: "Options",
				optionList: commandLineOptions
			}
		])
	);
} else if (!options.url) {
	console.error(PLUGIN_NAME, "Error: URL parameter missing. Use -h for help.");
} else if (!validUrl.isUri(options.url) && !fs.pathExistsSync(options.url)) {
	console.error(
		PLUGIN_NAME,
		"Error: URL parameter needs to be a valid URL or path to an HTML file."
	);
} else {
	console.log(PLUGIN_NAME + ": requesting " + options.url);

	new NodeFauxPas(options.url, options.mismatches, function(report) {
		readReport(report);
		process.exit();
	});
}
