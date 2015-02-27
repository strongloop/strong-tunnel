var tap = require('tap');

tap.test('exported methods', function(t) {
  var st = require('../');
  t.type(st, 'function', 'url is exported as a function');
  t.equal(st.length, 3, 'url expects a single argument');
  t.end();
});
