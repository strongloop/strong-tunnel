// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-tunnel
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var tap = require('tap');

tap.test('exported methods', function(t) {
  var st = require('../');
  t.type(st, 'function', 'url is exported as a function');
  t.equal(st.length, 3, 'url expects a single argument');
  t.end();
});
