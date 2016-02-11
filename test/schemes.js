var test = require('tape');
var uuid = require('uuid');
var extend = require('cog/extend');

module.exports = function(quickconnect, createSignaller, opts) {
  var connections = [];
  var dcs = [];
  var roomId = uuid.v4();
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
      // NOTE: Originally this test ran without creating a data channel, but it would fail
      // on Firefox as when no media is specified, the first connection would generate
      // candidates, but the second, upon generating the answer and setting the local description,
      // would observe that there are no media streams, and fail the connection (as Firefox does
      // not seem to handle the a=inactive option at the moment)
      // Adding a media stream restores everything to working
      qc.createDataChannel('data');
      connections.push(qc);
    }
    t.equals(connections.length, 2, 'connections created');
  });

  test('test connection using a default scheme', function(t) {
    t.plan(connections.length * 5);

    connections.forEach(function(conn, idx) {
      var label = 'conn' + idx + ' [' + conn.id + ']';
      conn.once('peer:prepare', function(id, data, scheme) {
        t.ok(scheme, 'scheme detected prior to connection initialization');
        t.equals(scheme.id, 'scheme1', 'correctly detected scheme1 scheme');
      });
      conn.once('peer:iceservers', function(id, schemeId, iceServers) {
        t.equals(schemeId, 'scheme1', 'scheme1 is used by default');
        t.deepEqual(stunGoogle, iceServers, 'scheme1 returns google stun servers for ' + label);
      });
      conn.once('peer:couple', t.pass.bind(t.pass, 'coupling started for ' + label));
      conn.once('call:created', t.pass.bind(t.pass, 'call has been created for ' + label));
      conn.once('call:started', t.pass.bind(t, 'Call started'));
      conn.once('call:failed', t.fail.bind(t.fail, 'call failed'));
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
      t.equals(schemeId, 'backup', 'using the backup scheme (' + schemeId + ')');
      t.deepEqual(servers, stunGoogle.slice(1), 'backup scheme returns abridged server list');
    }

    connections.forEach(function(conn) {
      conn.once('peer:reconnecting', function(id, data) {
        t.equals(data.scheme, 'backup', 'reconnecting with backup scheme');
      });
      conn.once('peer:prepare', function(id, data, scheme) {
        t.ok(scheme, 'scheme detected prior to connection initialization');
        t.equals(scheme.id, 'backup', 'correctly detected backup scheme');
      });
      conn.once('peer:iceservers', checkIceServers);
      conn.once('call:started', t.pass.bind(t, 'Call reconnected'));
      conn.once('call:failed', t.fail.bind(t.fail, 'call failed'));
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

