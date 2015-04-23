var extend = require('cog/extend');
var times = require('whisk/times');

module.exports = function(connectionCount, connections) {
  return function(test, quickconnect, createSignaller, signallerOpts, opts) {
    var remoteIds = [];

    function createConnection(index) {
      return function(t) {
        t.plan(connections.length + 1);

        connections.forEach(function(conn) {
          conn.once('peer:announce', function(data) {
            if (remoteIds[index]) {
              t.equal(remoteIds[index], data && data.id, 'matched known id');
            }
            else {
              t.ok(remoteIds[index] = data && data.id, 'got remote id');
            }
          });
        });

        t.ok(initQC(index), 'created');
      };
    }

    function initQC(index) {
      var qc = connections[index] = quickconnect(createSignaller(signallerOpts), opts);
      qc.createDataChannel('tmp');
      return qc;
    }

    test('create connection:0', function(t) {
      t.plan(1);
      t.ok(initQC(0), 'created');
    });

    test('create connection:1', function(t) {
      t.plan(1);
      t.ok(initQC(1), 'created');
    });

    test('register remote ids for connections 0 and 1', function(t) {
      t.plan(2);

      connections[0].once('peer:announce', function(data) {
        t.ok(remoteIds[1] = data && data.id, 'got remoteid:1');
      });

      connections[1].once('peer:announce', function(data) {
        t.ok(remoteIds[0] = data && data.id, 'got remoteid:0');
      });
    });

    for (var ii = 2; ii < connectionCount; ii++) {
      test('create connection:' + ii, createConnection(ii))
    }

    return remoteIds;
  }
};
