import tap from 'tap';
import csp from 'js-csp';
import {expect} from 'chai';
import spawn from './../lib/spawn';

tap.test("spawn", (t) => {
  t.test("should tee stdin to stdout", (tt) => {
    var process = spawn('tee');

    csp.go(function*() {
      yield csp.put(process.stdin, 'foobar');

      var output = yield csp.take(process.stdout);
      expect(output.toString()).to.equal('foobar');

      process.stdin.close();

      tt.done();
    })
  });

  t.test("should close channels if process exits", (tt) => {
    var process = spawn('bash', ["-c", "exit"]);

    csp.go(function*() {
      var result = yield csp.take(process.stdout);
      expect(result).to.equal(csp.CLOSED);

      tt.done();
    });
  });

  t.done();
});
