import tap from 'tap';
import csp from 'js-csp';
import {expect} from 'chai';
import te3270 from './../index';

tap.test('te3270', (t) => {
  t.test('should process streams', function(tt) {
    var terminal = te3270.connect('mustang.nevada.edu');
    var loginScreen = te3270.screen(terminal, {
      terminal: te3270.screen.text([[3, 72], [3, 79]]),
      username: te3270.screen.field([16, 33])
    });

    csp.go(function*() {
      yield terminal.command("wait()");
      yield loginScreen.username("foo");
      var text = yield loginScreen.terminal();
      yield terminal.command("quit()");

      expect(text).to.match(/TCP[0-9]+/);

      tt.done();
    });
  });

  t.done();
});
