var csp = require('js-csp');
var spawn = require('./spawn');

function command(commands, script, result) {
  csp.go(function*() {
    yield csp.put(commands, [script, result]);
  });
}

function connect(host, cb) {
  var process = spawn('x3270', ['-script', host]);

  var commands = csp.chan();
  var results = csp.chan();

  csp.go(function*() {
    var buffer = "";

    function handle(data) {
      buffer += data.toString();
      var term;
      while ((term = buffer.indexOf('ok\n')) !== -1) {
        var result = buffer.slice(0, term);
        buffer = buffer.slice(term + 3);

        var lines = result.split('\n');
        var data = lines.slice(0, -2).map(function(line) {
          return line.replace("data: ", "");
        }).join('\n');
        var state = lines[lines.length - 2];
        return {
          data: data
        };
      }
    }

    while (true) {
      var command = yield csp.take(commands);
      var script = command[0];
      var resultChan = command[1];
      yield csp.put(process.stdin, script);

      var result = undefined;
      while (result === undefined) {
        var chunk = yield csp.take(process.stdout);
        if (chunk === csp.CLOSED) {
          resultChan.close();
          return;
        } else {
          result = handle(chunk.toString());
        }
      }

      yield csp.put(resultChan, result.data);
      resultChan.close();
    }
  });

  return {
    text: function() {
      return this.command("ascii()");
    },
    command: function(script) {
      var result = csp.chan();
      command(commands, script + '\n', result);
      return result;
    }
  };
}
;

module.exports = {
  connect: connect,
  csp:csp
};
