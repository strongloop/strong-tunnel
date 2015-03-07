# strong-tunnel

Easy tunnelling over ssh2.

## Usage

There is nothing to configure, but some environment variables are used to
set defaults if no options are given.

```
var st = require('strong-tunnel');

st(someUrl, sshOpts, function(err, url) {
  // if someUrl was plain http, url will be someUrl
  // if someUrl was http+ssh://, url points to a local ephemeral tunnel
  // sshOpts is optional with defaults described below.
  http.get(url, onResponse);
});
```

### Username

Your current local username is assumed to be the username used for ssh. To
override this you can set the `LOGNAME` environment variable to the desired
username before the tunnel URL is created.

### Credentials

To keep the API simple, it is assumed that an ssh agent is already running,
that the path to its domain socket is in the `SSH_AUTH_SOCK` environment
variable, and that an appropriate private key has been loaded into that agent.

This is usually done for you in modern \*nix environments as part of your
login shell/session. See
[ssh-agent(1)](http://www.openbsd.org/cgi-bin/man.cgi/OpenBSD-current/man1/ssh-agent.1)
for more information about ssh agents.

### Longer Example

```js
var fmt = require('util').format;
var http = require('http');
var st = require('strong-tunnel');

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
```
