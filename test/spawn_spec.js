var csp = require('js-csp');
var expect = require('chai').expect;
var spawn = require(__dirname + "/../lib/spawn");

describe("spawn", () => {
  it("should tee stdin to stdout", (done) => {
    var process = spawn('tee');

    csp.go(function*() {
      yield csp.put(process.stdin, 'foobar');

      var output = yield csp.take(process.stdout);
      expect(output.toString()).to.equal('foobar');

      process.stdin.close();

      done();
    })
  });

  it("should close channels if process exits", (done) => {
    var process = spawn('bash', ["-c", "exit"]);

    csp.go(function*() {
      var result = yield csp.take(process.stdout);
      expect(result).to.equal(csp.CLOSED);

      done();
    });
  })
});
