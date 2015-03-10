var defaults = require('cog/defaults');

module.exports = function(quickconnect, createSignaller, signallerOpts) {
  return function(test, prefix, opts) {
    var connections = [];
    var roomId = require('uuid').v4();
    var remoteIds = [];

    // make the prefix sensible
    prefix = prefix ? (prefix + ': ') : '';

    // require('cog/logger').enable('rtc-quickconnect');

    test(prefix + 'create connection:0', function(t) {
      var qc;

      t.plan(1);
      qc = connections[0] = quickconnect(createSignaller(signallerOpts), {
        room: roomId
      });

      qc.once('connected', t.pass.bind(t, 'connected to signalling server'));
    });

    test(prefix + 'mark connection:0 reactive', function(t) {
      t.plan(1);
      connections[0].reactive();
      t.pass('done');
    });

    if (opts && opts.prep0) {
      test('prepare connection:0', function(t) {
        opts.prep0(t, connections[0]);
      });
    }

    test(prefix + 'create connection:1', function(t) {
      var qc;

      t.plan(1);
      qc = connections[1] = quickconnect(createSignaller(signallerOpts), {
        room: roomId
      });

      qc.once('connected', t.pass.bind(t, 'connected to signalling server'));
    });

    test(prefix + 'mark connection:1 reactive', function(t) {
      t.plan(1);
      connections[1].reactive();
      t.pass('done');
    });

    if (opts && opts.prep1) {
      test('prepare connection:1', function(t) {
        opts.prep1(t, connections[1]);
      });
    }

    require('./remote-ids')(test, connections, remoteIds);

    test(prefix + 'calls started', function(t) {
      t.plan(connections.length * 2);

      connections.forEach(function(conn, index) {
        conn.once('call:started', function(id, pc) {
          t.equal(id, remoteIds[index ^ 1], 'id matched expected');
          t.ok(pc, 'got peer connection');
        });
      });
    });

    return connections;
  };
};
