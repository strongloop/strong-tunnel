// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-tunnel
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var fmt = require('util').format;
var http = require('http');
var st = require('../');

var server = http.createServer(function(req, res) {
  res.end(JSON.stringify(req.headers));
});

var sshOpts = {
  host: '127.0.0.1',
};

server.listen(3030, function() {
  var direct = 'http://127.0.0.1:3030/';
  var tunneled = 'http+ssh://127.0.0.1:3030/';

  // Standard request using URL string
  http.get(direct, resLog('%s using %s:', direct, direct));

  // URL is only modified if a tunnelling URL was given
  st(direct, function(err, url) {
    if (err) throw err;
    // url == direct, unmodified
    http.get(url, resLog('%s using %s:', direct, url));
  });

  // optional second argument containing ssh config
  st(tunneled, sshOpts, function(err, url) {
    if (err) throw err;
    // url != tunneled, is modified
    http.get(url, resLog('%s using %s:', tunneled, url));
  });

  server.unref();
});

function resLog(prefix) {
  prefix = fmt.apply(null, arguments);
  return function onResponse(res) {
    res.on('data', function(d) {
      console.log('%s -> %s', prefix, d);
    });
  };
}
