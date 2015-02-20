var tunnel = require('./lib/tunnel');
var urlFmt = require('url').format;
var urlParse = require('url').parse;

module.exports = fromUrl;

function fromUrl(url, callback) {
  var str = JSON.parse(JSON.stringify(url));
  var obj = str;

  if (typeof str === 'object') {
    str = urlFmt(str);
  } else if (typeof obj === 'string') {
    obj = urlParse(obj);
  }

  if (/\+ssh:$/.test(obj.protocol)) {
    obj.protocol = obj.protocol.replace(/\+ssh:$/, ':');
    // we've replaced the port, so delete host so URL is recomposed using
    // $hostname:$port for $host
    delete obj.host;
    tunnel(obj, function(err, urlObj) {
      callback(err, urlFmt(urlObj));
    });
  } else {
    setImmediate(callback, null, url);
  }
}
