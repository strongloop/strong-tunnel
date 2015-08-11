var fork = require('child_process').fork;
var tap = require('tap');

tap.test('example script runs', function(t) {
  var example = fork(require.resolve('./example'));
  example.on('exit', function(code, signal) {
    t.assert(!code, 'exit 0');
    t.assert(!signal, 'not signalled to exit');
    t.end();
  });
});
