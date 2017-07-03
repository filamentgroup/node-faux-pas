const assert = require("assert");
const NodeFauxPas = require("../NodeFauxPas.js");
const joinpath = require("join-path");
const pkg = require("../package.json");

const LOCALHOST = "http://localhost";
const LOCALHOST_PORT = pkg.NFP_VARS.port;

// Testing server, run with mocha --delay
const childProcess = require("child_process");
const server = childProcess.spawn("node", ["server.js"], {});

server.stdout.on("data", data => {
	console.log(data.toString());

	if (data.toString().trim() === pkg.NFP_VARS.testStartupMessage.trim()) {
		run();
	}
});

server.stderr.on("data", data => {
	console.log(`stderr: ${data}`);
});

server.on("close", code => {
	console.log(`Testing server exited with code ${code}`);
});

// After all tests have finished
after(function() {
	server.kill();
});

function getUrl(path) {
	return joinpath(LOCALHOST + ":" + LOCALHOST_PORT, path);
}

function reportTextCount(report, level, text) {
	var result = 0;
	report.lines.forEach(function(line) {
		if( line.level === level ) {
			if( line.output.indexOf( text ) > -1 ) {
				result++;
			}
		}
	});
	return result;
}
function reportErrorCount(report, text) {
	return reportTextCount(report, 'error', text);
}
function reportWarningCount(report, text) {
	return reportTextCount(report, 'warn', text);
}


describe("faux-pas", function() {
	describe("No web fonts", function() {
		var report;

		before(function(done) {
			new NodeFauxPas(getUrl("test/samples/0000.html"), true, function(r) {
				report = r;
				done();
			});
		});

		it("should have the right title", function() {
			assert.ok(report.pageHtml.indexOf("<title>0000</title>") > -1);
		});

		it("should have no web fonts", function() {
			assert.equal(0, report.declaredCount);
		});

		it("should have no errors", function() {
			assert.equal(0, report.errorCount);
		});

		it("should have no warnings", function() {
			assert.equal(0, report.warningCount);
		});

		it("should have no errors", function() {
			assert.equal(0, report.errorCount);
			assert.equal(reportErrorCount(report, 'id="roman"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_italic_bold"'), 0);
		});

		it("should have no warnings", function() {
			assert.equal(0, report.warningCount);
			assert.equal(reportWarningCount(report, 'id="roman"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic_bold"'), 0);
		});
	});

	describe("Only Bold Italic loaded", function() {
		var report;

		before(function(done) {
			new NodeFauxPas(getUrl("test/samples/0001.html"), true, function(r) {
				report = r;
				done();
			});
		});

		it("should have the right title", function() {
			assert.ok(report.pageHtml.indexOf("<title>0001</title>") > -1);
		});

		it("should have the right number of web fonts", function() {
			assert.equal(1, report.declaredCount);
		});

		it("should have no errors", function() {
			assert.equal(0, report.errorCount);
			assert.equal(reportErrorCount(report, 'id="roman"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_italic_bold"'), 0);
		});

		it("should have warnings", function() {
			assert.equal(3, report.warningCount);
			assert.equal(reportWarningCount(report, 'id="roman"'), 1);
			assert.equal(reportWarningCount(report, 'id="roman_bold"'), 1);
			assert.equal(reportWarningCount(report, 'id="roman_italic"'), 1);
			assert.equal(reportWarningCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic_bold"'), 0);
		});
	});

	describe("Only Italic loaded", function() {
		var report;

		before(function(done) {
			new NodeFauxPas(getUrl("test/samples/0010.html"), true, function(r) {
				report = r;
				done();
			});
		});

		it("should have the right title", function() {
			assert.ok(report.pageHtml.indexOf("<title>0010</title>") > -1);
		});

		it("should have the right number of web fonts", function() {
			assert.equal(1, report.declaredCount);
		});

		it("should have errors", function() {
			assert.equal(3, report.errorCount);
			assert.equal(reportErrorCount(report, 'id="roman"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold"'), 1);
			assert.equal(reportErrorCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold_italic"'), 1);
			assert.equal(reportErrorCount(report, 'id="roman_italic_bold"'), 1);
		});

		it("should have warnings", function() {
			assert.equal(1, report.warningCount);
			assert.equal(reportWarningCount(report, 'id="roman"'), 1);
			assert.equal(reportWarningCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic_bold"'), 0);
		});
	});

	describe("Only Bold loaded", function() {
		var report;

		before(function(done) {
			new NodeFauxPas(getUrl("test/samples/0100.html"), true, function(r) {
				report = r;
				done();
			});
		});

		it("should have the right title", function() {
			assert.ok(report.pageHtml.indexOf("<title>0100</title>") > -1);
		});

		it("should have the right number of web fonts", function() {
			assert.equal(1, report.declaredCount);
		});

		it("should have errors", function() {
			assert.equal(3, report.errorCount);
			assert.equal(reportErrorCount(report, 'id="roman"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_italic"'), 1);
			assert.equal(reportErrorCount(report, 'id="roman_bold_italic"'), 1);
			assert.equal(reportErrorCount(report, 'id="roman_italic_bold"'), 1);
		});

		it("should have warnings", function() {
			assert.equal(1, report.warningCount);
			assert.equal(reportWarningCount(report, 'id="roman"'), 1);
			assert.equal(reportWarningCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic_bold"'), 0);
		});
	});

	describe("Only Roman loaded", function() {
		var report;

		before(function(done) {
			new NodeFauxPas(getUrl("test/samples/1000.html"), true, function(r) {
				report = r;
				done();
			});
		});

		it("should have the right title", function() {
			assert.ok(report.pageHtml.indexOf("<title>1000</title>") > -1);
		});

		it("should have the right number of web fonts", function() {
			assert.equal(1, report.declaredCount);
		});

		it("should have errors", function() {
			assert.equal(4, report.errorCount);
			assert.equal(reportErrorCount(report, 'id="roman"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold"'), 1);
			assert.equal(reportErrorCount(report, 'id="roman_italic"'), 1);
			assert.equal(reportErrorCount(report, 'id="roman_bold_italic"'), 1);
			assert.equal(reportErrorCount(report, 'id="roman_italic_bold"'), 1);
		});

		it("should have no warnings", function() {
			assert.equal(0, report.warningCount);
			assert.equal(reportWarningCount(report, 'id="roman"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic_bold"'), 0);
		});
	});

	describe("Roman, Bold Italic loaded", function() {
		var report;

		before(function(done) {
			new NodeFauxPas(getUrl("test/samples/1001.html"), true, function(r) {
				report = r;
				done();
			});
		});

		it("should have the right title", function() {
			assert.ok(report.pageHtml.indexOf("<title>1001</title>") > -1);
		});

		it("should have the right number of web fonts", function() {
			assert.equal(2, report.declaredCount);
		});

		it("should have errors", function() {
			assert.equal(1, report.errorCount);
			assert.equal(reportErrorCount(report, 'id="roman"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold"'), 1);
			assert.equal(reportErrorCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_italic_bold"'), 0);
		});

		it("should have warnings", function() {
			assert.equal(1, report.warningCount);
			assert.equal(reportWarningCount(report, 'id="roman"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic"'), 1);
			assert.equal(reportWarningCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic_bold"'), 0);
		});
	});

	describe("Roman, Italic loaded", function() {
		var report;

		before(function(done) {
			new NodeFauxPas(getUrl("test/samples/1010.html"), true, function(r) {
				report = r;
				done();
			});
		});

		it("should have the right title", function() {
			assert.ok(report.pageHtml.indexOf("<title>1010</title>") > -1);
		});

		it("should have the right number of web fonts", function() {
			assert.equal(2, report.declaredCount);
		});

		it("should have errors", function() {
			assert.equal(3, report.errorCount);
			assert.equal(reportErrorCount(report, 'id="roman"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold"'), 1);
			assert.equal(reportErrorCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold_italic"'), 1);
			assert.equal(reportErrorCount(report, 'id="roman_italic_bold"'), 1);
		});

		it("should have no warnings", function() {
			assert.equal(0, report.warningCount);
			assert.equal(reportWarningCount(report, 'id="roman"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic_bold"'), 0);
		});
	});

	describe("Roman, Bold loaded", function() {
		var report;

		before(function(done) {
			new NodeFauxPas(getUrl("test/samples/1100.html"), true, function(r) {
				report = r;
				done();
			});
		});

		it("should have the right title", function() {
			assert.ok(report.pageHtml.indexOf("<title>1100</title>") > -1);
		});

		it("should have the right number of web fonts", function() {
			assert.equal(2, report.declaredCount);
		});

		it("should have errors", function() {
			assert.equal(3, report.errorCount);
			assert.equal(reportErrorCount(report, 'id="roman"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_italic"'), 1);
			assert.equal(reportErrorCount(report, 'id="roman_bold_italic"'), 1);
			assert.equal(reportErrorCount(report, 'id="roman_italic_bold"'), 1);
		});

		it("should have no warnings", function() {
			assert.equal(0, report.warningCount);
			assert.equal(reportWarningCount(report, 'id="roman"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic_bold"'), 0);
		});
	});

	describe("Italic, Bold Italic loaded", function() {
		var report;

		before(function(done) {
			new NodeFauxPas(getUrl("test/samples/0011.html"), true, function(r) {
				report = r;
				done();
			});
		});

		it("should have the right title", function() {
			assert.ok(report.pageHtml.indexOf("<title>0011</title>") > -1);
		});

		it("should have the right number of web fonts", function() {
			assert.equal(2, report.declaredCount);
		});

		it("should have no errors", function() {
			assert.equal(0, report.errorCount);
			assert.equal(reportErrorCount(report, 'id="roman"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_italic_bold"'), 0);
		});

		it("should have warnings", function() {
			assert.equal(2, report.warningCount);
			assert.equal(reportWarningCount(report, 'id="roman"'), 1);
			assert.equal(reportWarningCount(report, 'id="roman_bold"'), 1);
			assert.equal(reportWarningCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic_bold"'), 0);
		});
	});

	describe("Bold, Italic loaded", function() {
		var report;

		before(function(done) {
			new NodeFauxPas(getUrl("test/samples/0110.html"), true, function(r) {
				report = r;
				done();
			});
		});

		it("should have the right title", function() {
			assert.ok(report.pageHtml.indexOf("<title>0110</title>") > -1);
		});

		it("should have the right number of web fonts", function() {
			assert.equal(2, report.declaredCount);
		});

		it("should have errors", function() {
			assert.equal(2, report.errorCount);
			assert.equal(reportErrorCount(report, 'id="roman"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold_italic"'), 1);
			assert.equal(reportErrorCount(report, 'id="roman_italic_bold"'), 1);
		});

		it("should have warnings", function() {
			assert.equal(1, report.warningCount);
			assert.equal(reportWarningCount(report, 'id="roman"'), 1);
			assert.equal(reportWarningCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic_bold"'), 0);
		});
	});


	describe("Bold, Bold Italic loaded", function() {
		var report;

		before(function(done) {
			new NodeFauxPas(getUrl("test/samples/0101.html"), true, function(r) {
				report = r;
				done();
			});
		});

		it("should have the right title", function() {
			assert.ok(report.pageHtml.indexOf("<title>0101</title>") > -1);
		});

		it("should have the right number of web fonts", function() {
			assert.equal(2, report.declaredCount);
		});

		it("should have no errors", function() {
			assert.equal(0, report.errorCount);
			assert.equal(reportErrorCount(report, 'id="roman"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_italic_bold"'), 0);
		});

		it("should have warnings", function() {
			assert.equal(2, report.warningCount);
			assert.equal(reportWarningCount(report, 'id="roman"'), 1);
			assert.equal(reportWarningCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic"'), 1);
			assert.equal(reportWarningCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic_bold"'), 0);
		});
	});

	describe("Bold, Italic, Bold Italic loaded", function() {
		var report;

		before(function(done) {
			new NodeFauxPas(getUrl("test/samples/0111.html"), true, function(r) {
				report = r;
				done();
			});
		});

		it("should have the right title", function() {
			assert.ok(report.pageHtml.indexOf("<title>0111</title>") > -1);
		});

		it("should have the right number of web fonts", function() {
			assert.equal(3, report.declaredCount);
		});

		it("should have no errors", function() {
			assert.equal(0, report.errorCount);
			assert.equal(reportErrorCount(report, 'id="roman"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_italic_bold"'), 0);
		});

		it("should have warnings", function() {
			assert.equal(1, report.warningCount);
			assert.equal(reportWarningCount(report, 'id="roman"'), 1);
			assert.equal(reportWarningCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic_bold"'), 0);
		});
	});

	describe("Roman, Italic, Bold Italic loaded", function() {
		var report;

		before(function(done) {
			new NodeFauxPas(getUrl("test/samples/1011.html"), true, function(r) {
				report = r;
				done();
			});
		});

		it("should have the right title", function() {
			assert.ok(report.pageHtml.indexOf("<title>1011</title>") > -1);
		});

		it("should have the right number of web fonts", function() {
			assert.equal(3, report.declaredCount);
		});

		it("should have errors", function() {
			assert.equal(1, report.errorCount);
			assert.equal(reportErrorCount(report, 'id="roman"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold"'), 1);
			assert.equal(reportErrorCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_italic_bold"'), 0);
		});

		it("should have no warnings", function() {
			assert.equal(0, report.warningCount);
			assert.equal(reportWarningCount(report, 'id="roman"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic_bold"'), 0);
		});
	});

	describe("Roman, Bold, Bold Italic loaded", function() {
		var report;

		before(function(done) {
			new NodeFauxPas(getUrl("test/samples/1101.html"), true, function(r) {
				report = r;
				done();
			});
		});

		it("should have the right title", function() {
			assert.ok(report.pageHtml.indexOf("<title>1101</title>") > -1);
		});

		it("should have the right number of web fonts", function() {
			assert.equal(3, report.declaredCount);
		});

		it("should have no errors", function() {
			assert.equal(0, report.errorCount);
			assert.equal(reportErrorCount(report, 'id="roman"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_italic_bold"'), 0);
		});

		it("should have warnings", function() {
			assert.equal(1, report.warningCount);
			assert.equal(reportWarningCount(report, 'id="roman"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic"'), 1);
			assert.equal(reportWarningCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic_bold"'), 0);
		});
	});

	describe("Roman, Bold, Italic loaded", function() {
		var report;

		before(function(done) {
			new NodeFauxPas(getUrl("test/samples/1110.html"), true, function(r) {
				report = r;
				done();
			});
		});

		it("should have the right title", function() {
			assert.ok(report.pageHtml.indexOf("<title>1110</title>") > -1);
		});

		it("should have the right number of web fonts", function() {
			assert.equal(3, report.declaredCount);
		});

		it("should have errors", function() {
			assert.equal(2, report.errorCount);
			assert.equal(reportErrorCount(report, 'id="roman"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold_italic"'), 1);
			assert.equal(reportErrorCount(report, 'id="roman_italic_bold"'), 1);
		});

		it("should have no warnings", function() {
			assert.equal(0, report.warningCount);
			assert.equal(reportWarningCount(report, 'id="roman"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic_bold"'), 0);
		});
	});

	describe("Roman, Bold, Italic, Bold Italic (all) loaded", function() {
		var report;

		before(function(done) {
			new NodeFauxPas(getUrl("test/samples/1111.html"), true, function(r) {
				report = r;
				done();
			});
		});

		it("should have the right title", function() {
			assert.ok(report.pageHtml.indexOf("<title>1111</title>") > -1);
		});

		it("should have the right number of web fonts", function() {
			assert.equal(4, report.declaredCount);
		});

		it("should have no errors", function() {
			assert.equal(0, report.errorCount);
			assert.equal(reportErrorCount(report, 'id="roman"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportErrorCount(report, 'id="roman_italic_bold"'), 0);
		});

		it("should have no warnings", function() {
			assert.equal(0, report.warningCount);
			assert.equal(reportWarningCount(report, 'id="roman"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_bold"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_bold_italic"'), 0);
			assert.equal(reportWarningCount(report, 'id="roman_italic_bold"'), 0);
		});
	});

});
