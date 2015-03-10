var test = require('tape');
var uuid = require('uuid');
var connections = [];
var dcs = [];
var roomId = uuid.v4();
var connectionCount = 3;
var times = require('whisk/times');
var pluck = require('whisk/pluck');
var createMatrix = require('./helpers/connection-matrix')(3, connections);

module.exports = function(quickconnect, createSignaller, opts) {
  var remoteIds = createMatrix(test, quickconnect, createSignaller, opts, {
    room: roomId,
    iceServers:  require('./helpers/stun-google')
  });

  test('establish connection matrix', function(t) {
    t.plan(connections.length * (connections.length - 1));
    console.log('waiting for ' + (connections.length * (connections.length - 1)) + ' connections');

    connections.forEach(function(conn, idx) {
      var expected = remoteIds.filter(function(id, idIdx) {
        return idIdx !== idx;
      });

      function callStart(id) {
        var idx = expected.indexOf(id);

        t.ok(idx >= 0, conn.id + ' started call with ' + id);
        if (idx >= 0) {
          expected.splice(idx, 1);
        }

        if (expected.length === 0) {
          conn.removeListener('call:started', callStart);
        }
      }

      conn.on('call:started', callStart);
    });
  });

  test('clean up', function(t) {
    t.plan(1);

    connections.splice(0).forEach(function(connection) {
      connection.close();
    });

    return t.pass('done');
  });
};

