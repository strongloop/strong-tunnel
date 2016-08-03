'use strict';

var crypto = require('crypto');
var fs = require('fs');
var net = require('net');
var ssh2 = require('ssh2');

var channels = [];
var clients = [];
var hostPrivateKey = require.resolve('./ssh2_host_key');
var Server = ssh2.Server;
var userPubKeyPath = require.resolve('./ssh2_user_key.pub');
var userPubKeyTXT = fs.readFileSync(userPubKeyPath);
var utils = ssh2.utils;

var pubKey = utils.genPublicKey(utils.parseKey(userPubKeyTXT));

module.exports = makeServer;

function makeServer(opts, callback) {
  if (callback === undefined && typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  var log = opts.log || console.log;

  var server = new Server({
    privateKey: fs.readFileSync(hostPrivateKey),
  }, function(client) {
    clients.push(client);
    log('Client connected!');
    client.on('authentication', function(ctx) {
      if (ctx.username) {
        server.emit('username', ctx.username);
      }
      if (ctx.key) {
        server.emit('key', ctx.key);
      }
      if (ctx.password) {
        server.emit('password', ctx.password);
      }
      if (ctx.method === 'password') {
        if (ctx.username === 'foo' && ctx.password === 'bar') {
          ctx.accept();
        } else {
          ctx.reject();
        }
      } else if (ctx.method === 'publickey'
               && ctx.key.algo === pubKey.fulltype
               && bufferEqual(ctx.key.data, pubKey.public)) {
        if (ctx.signature) {
          var verifier = crypto.createVerify(ctx.sigAlgo);
          verifier.update(ctx.blob);
          if (verifier.verify(pubKey.publicOrig, ctx.signature, 'binary'))
            ctx.accept();
          else
            ctx.reject();
        } else {
          // if no signature present, that means the client is just checking
          // the validity of the given public key
          ctx.accept();
        }
      } else
        ctx.reject();
    }).on('ready', function() {
      log('Client authenticated!');

      client.on('session', function(accept, reject) {
        var session = accept();
        session.once('exec', function(accept, reject, info) {
          log('Client wants to execute: ', info.command);
          var stream = accept();
          stream.stderr.write('Oh no, the dreaded errors!\n');
          stream.write('Just kidding about the errors!\n');
          stream.exit(0);
          stream.end();
        });
      });
    }).on('tcpip', function(accept, reject, info) {
      server.emit('tcpip', info);
      log('tcpip', info);
      var channel = accept();
      channels.push(channel);
      var tcpClient = net.connect({ host: info.destIP, port: info.destPort });
      return tcpClient.on('connect', function() {
        log('connect: got connect from tcpClienet');
        tcpClient.pipe(channel).pipe(tcpClient);
        tcpClient.on('end', function() {
          log('tcpClient "end"');
        });
        channel.on('close', function() {
          log('client closed');
          delete channels[clients.indexOf(channel)];
        });
        channel.on('end', function() {
          log('channel "end"');
        });
      });
    }).on('end', function() {
      log('Client disconnected');
      delete clients[clients.indexOf(client)];
    }).on('error', function(err) {
      log('Error in client connection!', err);
      client.end();
    });
  }).listen(0, '127.0.0.1', function() {
    log('Listening on port ' + this.address().port);
    setImmediate(callback, server);
  });
  server.disconnectAllClients = disconnectAllClients;
  return server;

  function disconnectAllClients() {
    channels.forEach(function(c) {
      c.end();
    });
    // short delay before closing connections so that the channels have at least
    // some chance to shutdown in an orderly manner
    setTimeout(function() {
      clients.forEach(function(c) {
        c.end();
      });
    }, 100).unref();
  }
}

// XXX: Node 0.10 does not have Buffer.compare(), otherwise we would just use
// it here. Not also that this is not an appropriate comparison method for a
// real server since it is not constant-time.
function bufferEqual(a, b) {
  var i;
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
