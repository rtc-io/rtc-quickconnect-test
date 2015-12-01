var test = require('tape');
var uuid = require('uuid');
var connections = [];
var dcs = [];
var roomId = uuid.v4();
var extend = require('cog/extend');

module.exports = function(quickconnect, createSignaller, opts) {
  var stunGoogle = require('./helpers/stun-google');
  var connOpts = {
    manualJoin: true,
    room: roomId,
    schemes: [
      {
        id: 'scheme1',
        isDefault: true,
        connection: {
          iceServers: stunGoogle
        }
      }
    ]
  };
  var connections = [];

  test('create connections', function(t) {
    t.plan(1);
    for (var i = 0; i < 2; i++) {
      var qc = quickconnect(createSignaller(opts), connOpts);
      connections.push(qc);
    }
    t.equals(connections.length, 2, 'connections created');
  });

  test('test connection using a default scheme', function(t) {
    t.plan(connections.length * 3);

    connections.forEach(function(conn, idx) {
      conn.once('peer:iceservers', function(id, schemeId, iceServers) {
        t.equals(schemeId, 'scheme1', 'scheme1 is used by default');
        t.deepEqual(stunGoogle, iceServers, 'scheme1 returns google stun servers');
      });
      conn.once('call:started', t.pass.bind(t, 'Call started'));
      conn.join();
    });
  });

  test('register a new scheme', function(t) {
    t.plan(1);
    var scheme = {
      id: 'backup',
      connection: {
        ice: function(opts, callback) {
          return callback(null, stunGoogle.slice(1));
        }
      }
    }

    connections.forEach(function(conn) {
      conn.registerScheme(scheme);
    });

    t.pass('New scheme registered');
  });

  test('test reconnection with a given scheme', function(t) {
    t.plan(6);
    var source = connections[0];
    var target = connections[1];

    function checkIceServers(id, schemeId, servers) {
      t.equals(schemeId, 'backup', 'using the backup scheme');
      t.deepEqual(servers, stunGoogle.slice(1), 'backup scheme returns abridged server list');
    }

    connections.forEach(function(conn) {
      conn.once('peer:iceservers', checkIceServers);
      conn.once('call:started', t.pass.bind(t, 'Call reconnected'));
    });

    source.reconnectTo(target.id, { scheme: 'backup' });
  });

  test('clean up', function(t) {
    t.plan(1);

    connections.splice(0).forEach(function(connection) {
      connection.close();
    });

    return t.pass('done');
  });
};

