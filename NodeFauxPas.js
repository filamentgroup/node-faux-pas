const { ChromeLauncher } = require("lighthouse/lighthouse-cli/chrome-launcher");
const chrome = require("chrome-remote-interface");
const fs = require("fs-extra");
const joinpath = require("join-path");
const validUrl = require("valid-url");
const fauxPasLibJs = fs.readFileSync("node_modules/fg-faux-pas/faux-pas.js", { encoding: "utf-8" });
const LOCALHOST = "http://localhost"
const LOCALHOST_PORT = 8111;

function NodeFauxPas(url, showMismatches, reportCallback) {
	this.url = url;
	this.showMismatches = showMismatches;
	this.reportCallback = reportCallback;
	this.launcher = null;

	this.request( this.url );
}

NodeFauxPas.prototype.testValidUrl = function( url ) {
	if( !validUrl.isUri(url) && !fs.pathExistsSync(url)) {
		throw Error( "Target must be a valid URL or path to an HTML file: " + url );
	}
};

NodeFauxPas.prototype.needsWebServer = function( url ) {
	return !validUrl.isUri(url) && fs.pathExistsSync(url);
};

NodeFauxPas.prototype.request = function() {
	var url = this.url;
	this.testValidUrl( url );

	if (this.needsWebServer( url )) {
		var connect = require("connect");
		var serveStatic = require("serve-static");
		connect().use(serveStatic(__dirname)).listen(LOCALHOST_PORT, function() {
			this._request( joinpath(LOCALHOST + ":" + LOCALHOST_PORT, url) );
		}.bind( this ));
	} else {
		this._request( url );
	}
};

NodeFauxPas.prototype._request = function( url ) {
	var self = this;

	self._launchChrome().then(launcher => {
		self.launcher = launcher;

		chrome(protocol => {
			const { Page, Runtime } = protocol;

			Promise.all([Page.enable(), Runtime.enable()]).then(() => {
				Page.navigate({ url: url });

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

		// for testing
		FP.report.pageHtml = document.documentElement.innerHTML;

		return FP.report;
	}

	compare();`;

	return Runtime.evaluate({
		expression: fauxPasLibJs + compareJs,
		returnByValue: true,
		awaitPromise: true
	}).then(res1 => {
		self.reportCallback(res1.result.value);
	}).catch(function(err) {
		console.error( err );
		this.launcher.kill();
	}.bind( this ));
};

module.exports = NodeFauxPas;
