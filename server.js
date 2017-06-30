const assert = require("assert");
const connect = require("connect");
const serveStatic = require("serve-static");
const pkg = require("./package.json");

connect().use(serveStatic(__dirname)).listen(
	pkg.NFP_VARS.port,
	function() {
		console.log(pkg.NFP_VARS.testStartupMessage);
	}.bind(this)
);
