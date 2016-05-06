// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-tunnel
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var fmt = require('util').format;
var http = require('http');
var st = require('../');
var tap = require('tap');

tap.test('connects to local http server over ssh', function(t) {

  t.plan(6);

  var server = http.createServer(function(req, res) {
    t.ok(req, 'got a request');
    res.end(JSON.stringify(process.versions));
    server.unref();
  });

  server.listen(0, function() {
    var direct = fmt('http://127.0.0.1:%d/', server.address().port);

    t.ok(server.address(), 'test http server listening');

    st(direct, function(err, url) {
      t.ifError(err, 'strong-tunnel should not error on url ' + direct);
      t.equal(url, direct);
      assertRequest(url);
    });
  });

  function assertRequest(url) {
    t.assert(url, 'url: ' + url);
    http.get(url, function(res) {
      res.on('data', function(d) {
        t.ok(d, 'received response');
      });
    }).on('error', function(err) {
      t.ifError(err);
    });
  }
});
