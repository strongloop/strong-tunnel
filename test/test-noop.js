var st = require('../');
var tap = require('tap');

var httpUrl = 'http://foo.com/';
var tcpUrl = 'tcp://foo.com:1234/';
var fileUrl = 'file:///some/path';

tap.test('no-op behaviours', function(t) {
  t.plan(6);
  st(httpUrl, function(err, url) {
    t.ifError(err, 'should not error with url: ' + url);
    t.equal(url, httpUrl);
  });
  st(tcpUrl, function(err, url) {
    t.ifError(err, 'should not error with url: ' + url);
    t.equal(url, tcpUrl);
  });
  st(fileUrl, function(err, url) {
    t.ifError(err, 'should not error with url: ' + url);
    t.equal(url, fileUrl);
  });
});
