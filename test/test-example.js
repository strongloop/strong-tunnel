// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-tunnel
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

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
