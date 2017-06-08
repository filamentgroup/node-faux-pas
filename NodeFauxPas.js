const { ChromeLauncher } = require("lighthouse/lighthouse-cli/chrome-launcher");
const chrome = require("chrome-remote-interface");
const fs = require("fs");
const fauxPasLibJs = fs.readFileSync("node_modules/fg-faux-pas/faux-pas.js", { encoding: "utf-8" });

function NodeFauxPas(url, showMismatches, reportCallback) {
	this.url = url;
	this.showMismatches = showMismatches;
	this.reportCallback = reportCallback;
}

NodeFauxPas.prototype.request = function() {
	var self = this;

	self._launchChrome().then(launcher => {
		chrome(protocol => {
			const { Page, Runtime } = protocol;

			Promise.all([Page.enable(), Runtime.enable()]).then(() => {
				Page.navigate({ url: self.url });

				Page.loadEventFired(() => {
					self._addScript(Runtime).then(() => {
						protocol.close();
						launcher.kill();
					});
				});
			});
		}).on("error", err => {
			throw Error("Cannot connect to Chrome:" + err);
		});
	});
};

NodeFauxPas.prototype._launchChrome = function() {
	const launcher = new ChromeLauncher({
		port: 9222,
		autoSelectChrome: true,
		additionalFlags: ["--disable-gpu", "--headless"]
	});

	return launcher.run().then(() => launcher).catch(err => {
		return launcher.kill().then(() => {
			// Kill Chrome if there's an error.
			throw err;
		}, console.error);
	});
};

NodeFauxPas.prototype._addScript = function(Runtime) {
	var self = this;

	const compareJs = `async function compare() {
		await document.fonts.ready;

		var FP = new FauxPas( window, {
			console: true,
			highlights: false,
			mismatches: ${this.showMismatches}
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
		self.reportCallback(res1.result.value);
	});
};

module.exports = NodeFauxPas;
