const assert = require("assert");
const NodeFauxPas = require("../NodeFauxPas.js");
const joinpath = require("join-path");
const pkg = require("../package.json");

const LOCALHOST = "http://localhost";
const LOCALHOST_PORT = pkg.NFP_VARS.port;

// Testing server, run with mocha --delay
const childProcess = require('child_process');
const server = childProcess.spawn('node', ['server.js'], {});

server.stdout.on('data', (data) => {
	console.log( data.toString() );

	if( data.toString().trim() === pkg.NFP_VARS.testStartupMessage.trim() ) {
		run();
	}
});

server.stderr.on('data', (data) => {
	console.log(`stderr: ${data}`);
});

server.on('close', (code) => {
	console.log(`Testing server exited with code ${code}`);
});

// After all tests have finished
after(function() {
	server.kill();
});

function getUrl( path ) {
	return joinpath( LOCALHOST + ":" + LOCALHOST_PORT, path );
}

describe("faux-pas", function() {
	describe("No web fonts", function() {
		it("should have no errors", function(done) {
			var nFP = new NodeFauxPas(getUrl( "test/samples/0000.html" ), true, function(report) {
				assert.ok(report.pageHtml.indexOf( "<title>0000</title>" ) > -1);
				assert.equal(0, report.declaredCount);
				assert.equal(0, report.errorCount);
				assert.equal(0, report.warningCount);
				done();
			});
		});
	});

	describe("Only Bold Italic loaded", function() {
		it("should have no errors", function(done) {
			var nFP = new NodeFauxPas(getUrl( "test/samples/0001.html" ), true, function(report) {
				assert.ok(report.pageHtml.indexOf( "<title>0001</title>" ) > -1);
				assert.equal(report.declaredCount, 1);
				assert.equal(report.errorCount, 0);
				assert.equal(report.warningCount, 5);
				done();
			});
		});
	});

	describe("Only Italic loaded", function() {
		it("should have errors", function(done) {
			var nFP = new NodeFauxPas(getUrl( "test/samples/0010.html" ), true, function(report) {
				assert.ok(report.pageHtml.indexOf( "<title>0010</title>" ) > -1);
				assert.equal(report.declaredCount, 1);
				assert.equal(report.errorCount, 4);
				assert.equal(report.warningCount, 1);
				done();
			});
		});
	});

	describe("Only Bold loaded", function() {
		it("should have errors", function(done) {
			var nFP = new NodeFauxPas(getUrl( "test/samples/0100.html" ), true, function(report) {
				assert.ok(report.pageHtml.indexOf( "<title>0100</title>" ) > -1);
				assert.equal(report.declaredCount, 1);
				assert.equal(report.errorCount, 4);
				assert.equal(report.warningCount, 1);
				done();
			});
		});
	});

	describe("Only Roman loaded", function() {
		it("should have errors", function(done) {
			var nFP = new NodeFauxPas(getUrl( "test/samples/1000.html" ), true, function(report) {
				assert.ok(report.pageHtml.indexOf( "<title>1000</title>" ) > -1);
				assert.equal(report.declaredCount, 1);
				assert.equal(report.errorCount, 6);
				assert.equal(report.warningCount, 0);
				done();
			});
		});
	});
});
