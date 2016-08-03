// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-tunnel
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var fork = require('child_process').fork;
var tap = require('tap');
var newSSHServer = require('./server');
var sshServer;

tap.test('start ssh server', function(t) {
  sshServer = newSSHServer({log: tap.comment}, function() {
    t.ok(sshServer.address().port, 'ssh server listening');
    t.end();
  });
});

tap.test('example script runs', function(t) {
  var env = JSON.parse(JSON.stringify(process.env));
  env.SSH_PORT = sshServer.address().port;
  env.SSH_PRIVATE_KEY = require.resolve('./ssh2_user_key');
  env.SSH_USERNAME = 'strong-tunnel-tester';
  var example = fork(require.resolve('./example'), {env: env, silent: true});
  example.on('exit', function(code, signal) {
    t.assert(!code, 'exit 0');
    t.assert(!signal, 'not signalled to exit');
    t.end();
  });
  example.stdout.pipe(process.stderr);
  example.stderr.pipe(process.stderr);
});

tap.test('shutdown ssh server', function(t) {
  sshServer.close(function() {
    t.pass('ssh server shutdown');
    t.end();
  });
  sshServer.disconnectAllClients();
});
