var test = require('tape');
var connections = [];
var dcs = [];
var room = require('uuid').v4();
var remoteIds = [];

module.exports = function(quickconnect, createSignaller, opts) {
  test('create connector 0', function(t) {
    t.plan(3);
    t.ok(connections[0] = quickconnect(createSignaller(opts), {
      room: room
    }), 'created');

    t.equal(typeof connections[0].createDataChannel, 'function', 'has a createDataChannel function');

    // create the data channel
    connections[0].createDataChannel('test');
    setTimeout(t.pass.bind(t, 'dc created'), 500);
  });

  test('create connector 1', function(t) {
    t.plan(1);
    t.ok(connections[1] = quickconnect(createSignaller(opts), {
      room: room
    }), 'created');
  });

  require('./helpers/remote-ids')(test, connections, remoteIds);

  test('create connector 1 - get bus events', function(t) {
    t.plan(4);
    t.equal(typeof connections[1].createDataChannel, 'function', 'has a createDataChannel function');

  //   connections[0].feed(function(evt) {
  //     console.log('0: ' + evt.name);
  //   });

  //   connections[1].feed(function(evt) {
  //     console.log('1: ' + evt.name);
  //   });

    connections[0].once('pc.' + remoteIds[1] + '.connected', function() {
      t.pass('connection 0 has recognised connection from connection 1');
    });

    connections[1].once('pc.' + remoteIds[0] + '.connected', function() {
      t.pass('connection 1 has recognised connection from connection 0');
    });

    // create the data channel
    connections[1].createDataChannel('test');
    setTimeout(t.pass.bind(t, 'dc created'), 500);
  });

  test('release references', function(t) {
    t.plan(1);

    connections[1].close();
    connections = [];
    dcs = [];

    t.pass('done');
  });
};

