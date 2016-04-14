// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-tunnel
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var st = require('../');
var tap = require('tap');

var httpUrl = 'http://foo.com/';
var tcpUrl = 'tcp://foo.com:1234/';
var fileUrl = 'file:///some/path';

tap.test('no-op behaviours', function(t) {
  t.plan(12);
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
  st(httpUrl, {}, function(err, url) {
    t.ifError(err, 'should not error with url: ' + url);
    t.equal(url, httpUrl);
  });
  st(tcpUrl, {}, function(err, url) {
    t.ifError(err, 'should not error with url: ' + url);
    t.equal(url, tcpUrl);
  });
  st(fileUrl, {}, function(err, url) {
    t.ifError(err, 'should not error with url: ' + url);
    t.equal(url, fileUrl);
  });
});
