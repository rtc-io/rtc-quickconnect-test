var test = require('tape');
var connections = [];
var dcs = [];
var room = require('uuid').v4();

module.exports = function(quickconnect, createSignaller, opts) {
  var remoteIds = [];

  test('create connector 0', function(t) {
    t.plan(3);
    t.ok(connections[0] = quickconnect(createSignaller(opts), {
      room: room,
      heartbeat: 10000
    }), 'created');

    t.equal(typeof connections[0].createDataChannel, 'function', 'has a createDataChannel function');
    connections[0].pcs = {};
    // create the data channel
    connections[0].createDataChannel('test');
    connections[0].on('peer:couple', function(id, pc) {
      connections[0].pcs[id] = pc;
    });
    setTimeout(t.pass.bind(t, 'dc created'), 500);
  });

  test('create connector 1', function(t) {
    t.plan(3);
    t.ok(connections[1] = quickconnect(createSignaller(opts), {
      room: room,
      heartbeat: 10000,
      disconnectTimeout: 1000
    }), 'created');

    t.equal(typeof connections[1].createDataChannel, 'function', 'has a createDataChannel function');

    // create the data channel
    connections[1].createDataChannel('test');
    setTimeout(t.pass.bind(t, 'dc created'), 500);
  });

  require('./helpers/remote-ids')(test, connections, remoteIds);

  test('check call active', function(t) {
    t.plan(connections.length * 3);

    connections.forEach(function(conn, index) {
      conn.waitForCall(remoteIds[index ^ 1], function(err, pc) {
        t.ifError(err, 'call available');
        t.ok(pc, 'have peer connection');

        // check connection state valid
        t.ok(['connected', 'completed'].indexOf(pc.iceConnectionState) >= 0, 'call connected');
      });
    });
  });

  test('data channels opened', function(t) {
    t.plan(4);
    connections[0].requestChannel(remoteIds[1], 'test', function(err, dc) {
      t.ifError(err);
      dcs[0] = dc;
      t.equal(dc.readyState, 'open', 'connection test dc 0 open');
    });

    connections[1].requestChannel(remoteIds[0], 'test', function(err, dc) {
      t.ifError(err);
      dcs[1] = dc;
      t.equal(dc.readyState, 'open', 'connection test dc 1 open');
    });
  });

  test('dc 0 send', function(t) {
    dcs[1].onmessage = function(evt) {
      t.equal(evt.data, 'hi', 'dc:1 received hi');
      dcs[1].onmessage = null;
    };

    t.plan(1);
    dcs[0].send('hi');
  });

  test('dc 1 send', function(t) {
    dcs[0].onmessage = function(evt) {
      t.equal(evt.data, 'hi', 'dc:1 received hi');
      dcs[0].onmessage = null;
    };

    t.plan(1);
    dcs[1].send('hi');
  });

  test('end connection on connection 0 and wait for events',  { timeout: 60000 }, function(t) {
    t.plan(8);

    connections[0].once('call:ended', t.pass.bind(t, 'connection:0 call:ended event triggered'));
    connections[0].once('peer:update', t.pass.bind(t, 'connected:0 received reannounce'));
    connections[0].once('call:started', t.pass.bind(t, 'connected:0 call restarted'));

    connections[1].once('call:failing', t.pass.bind(t, 'connected:1 call:failing event triggered'));
    connections[1].once('call:failed', t.pass.bind(t, 'connected:1 call:failed event triggered'));
    connections[1].once('call:ended', t.pass.bind(t, 'connected:1 call:ended event triggered'));
    connections[1].once('peer:update', t.pass.bind(t, 'connected:1 received reannounce'));
    connections[1].once('call:started', t.pass.bind(t, 'connected:1 call restarted'));

    connections[0].pcs[connections[1].id].close();
  });

  test('release references', function(t) {
    t.plan(1);

    connections.forEach(function(conn) { conn.close(); });
    connections = [];
    dcs = [];

    t.pass('done');
  });
};


