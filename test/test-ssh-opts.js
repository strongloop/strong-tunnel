'use strict';

var fmt = require('util').format;
var fs = require('fs');
var http = require('http');
var newSSHServer = require('./server');
var st = require('../');
var tap = require('tap');

var httpServer;
var privateKey = fs.readFileSync(require.resolve('./ssh2_user_key'));
var sshServer;

tap.test('start ssh server', function(t) {
  sshServer = newSSHServer({log: t.comment}, function() {
    t.ok(sshServer.address().port, 'ssh server listening');
    t.end();
  });
});

tap.test('start http server', function(t) {
  httpServer = http.createServer(function(req, res) {
    tap.comment('got request', req.url);
    res.end(JSON.stringify(process.versions));
  });
  httpServer.listen(0, '127.0.0.1', function() {
    t.ok(httpServer.address().port, 'http server listening');
    t.end();
  });
});

tap.test('attempts connection using settings', function(t) {
  t.plan(6);
  var tunneled = fmt('http+ssh://127.0.0.1:%d/', httpServer.address().port);
  var opts = {
    port: sshServer.address().port,
    privateKey: privateKey,
    username: 'strong-tunnel-tester',
  };
  st(tunneled, opts, function(err, url) {
    t.ifErr(err, 'bailed on client side of tunnel creation');
    http.get(url, function(res) {
      var buf = '';
      res.on('data', function(d) {
        buf += d;
      });
      res.on('end', function() {
        t.comment('request complete!');
        t.equal(buf, JSON.stringify(process.versions));
      });
    });
  });
  sshServer.once('connection', function(c) {
    t.ok(c, 'ssh server receives connection');
  });
  sshServer.once('username', function(username) {
    t.equal(username, 'strong-tunnel-tester');
  });
  sshServer.once('key', function() {
    t.pass('ssh connection used key auth');
  });
  sshServer.once('tcpip', function(tcpip) {
    t.ok(tcpip, 'server received tcpip tunneling command');
  });
});

tap.test('shutdown http server', function(t) {
  httpServer.close(function() {
    t.pass('http server shutdown');
    t.end();
  });
});

tap.test('shutdown ssh server', function(t) {
  sshServer.close(function() {
    t.pass('ssh server shutdown');
    t.end();
  });
  sshServer.disconnectAllClients();
});
