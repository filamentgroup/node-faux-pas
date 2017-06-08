#! /usr/bin/env node
const { ChromeLauncher } = require("lighthouse/lighthouse-cli/chrome-launcher");
const chrome = require("chrome-remote-interface");
const chalk = require("chalk");
const commandLineArgs = require("command-line-args");
const getUsage = require("command-line-usage");
const fs = require("fs");
const pkg = require("./package.json");

const PLUGIN_NAME = "fauxpas";
const fauxPasLibJs = fs.readFileSync("node_modules/fg-faux-pas/faux-pas.js", { encoding: "utf-8" });

function launchChrome() {
	const launcher = new ChromeLauncher({
		port: 9222,
		autoSelectChrome: true, // False to manually select which Chrome install.
		additionalFlags: ["--disable-gpu", "--headless"] // "--window-size=412,732",
	});

	return launcher.run().then(() => launcher).catch(err => {
		return launcher.kill().then(() => {
			// Kill Chrome if there's an error.
			throw err;
		}, console.error);
	});
}

function addScript(Runtime, testUrl) {
	const compareJs = `async function compare() {
		await document.fonts.ready;

		var FP = new FauxPas( window, {
			console: true,
			highlights: false,
			mismatches: true
		});

		FP.findAllFauxWebFonts();

		return FP.report;
	}

	compare();`;

	return Runtime.evaluate({
		expression: fauxPasLibJs + compareJs,
		returnByValue: true,
		awaitPromise: true
	}).then(res1 => {
		// console.log( res1 );
		readReport(res1.result.value, testUrl);
	});
}

function readReport(report, testUrl) {
	var errorCount = report.errorCount;
	var warningCount = report.warningCount;

	report.lines.forEach(function(line) {
		if (line.level === "error") {
			console.log("* " + chalk.red(line.output));
		} else if (line.level === "warn") {
			console.log("* " + chalk.yellow(line.output));
		}
	});

	if (!errorCount && !warningCount) {
		console.log(
			chalk.underline(PLUGIN_NAME),
			"for",
			testUrl,
			chalk.green("OK: No faux web fonts or mismatches detected.")
		);
	} else {
		console.log(
			chalk.underline(PLUGIN_NAME),
			"for",
			testUrl,
			chalk.black.bgRed(errorCount + " error" + (errorCount != 1 ? "s" : "")) +
				" and " +
				chalk.black.bgYellow(warningCount + " mismatch" + (warningCount != 1 ? "es" : "")) +
				", use the faux-pas bookmarklet for visual feedback."
		);
	}
}

const commandLineOptions = [
	{
		name: "url",
		alias: "u",
		description: "The url to test.",
		defaultOption: true,
		type: String,
		typeLabel: "[underline]{url}"
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
} else {
	launchChrome().then(launcher => {
		chrome(protocol => {
			const { Page, Runtime } = protocol;

			Promise.all([Page.enable(), Runtime.enable()]).then(() => {
				console.log(PLUGIN_NAME + ": requesting " + options.url);

				Page.navigate({ url: options.url });

				Page.loadEventFired(() => {
					addScript(Runtime, options.url).then(() => {
						protocol.close();
						launcher.kill();
					});
				});
			});
		}).on("error", err => {
			throw Error("Cannot connect to Chrome:" + err);
		});
	});
}
