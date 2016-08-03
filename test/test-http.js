// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-tunnel
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var fmt = require('util').format;
var http = require('http');
var st = require('../');
var tap = require('tap');

var env = process.env;
var username = env.LOGNAME || env.USER || env.LNAME || env.USERNAME;
var requireAgent = {
  skip: !env.SSH_AUTH_SOCK && 'test requires SSH_AUTH_SOCK',
};

tap.test('connects to local http server over ssh', requireAgent, function(t) {
  t.plan(8);
  t.ok(username, 'there is a username');

  var server = http.createServer(function(req, res) {
    t.ok(req, 'got a request');
    res.end(JSON.stringify(process.versions));
  });

  server.listen(0, function() {
    var direct = fmt('http://127.0.0.1:%d/', server.address().port);
    var tunneled = fmt('http+ssh://127.0.0.1:%d/', server.address().port);

    t.ok(server.address(), 'test http server listening');

    st(tunneled, function(err, url) {
      t.ifError(err, 'strong-tunnel should not error on url ' + tunneled);
      t.notEqual(url, direct);
      t.notEqual(url, tunneled);
      assertRequest(url);
    });
  });

  function assertRequest(url) {
    t.assert(url, 'url: ' + url);
    http.get(url, function(res) {
      res.on('data', function(d) {
        t.ok(d, 'received response');
        server.close();
      });
    }).on('error', function(err) {
      t.ifError(err);
    });
  }
});
