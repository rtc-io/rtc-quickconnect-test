var test = require('tape');
var connections = [];
var roomId = require('uuid').v4();
var dcs = [];
var ac = require('./helpers/audiocontext');
var pluck = require('whisk/pluck');

module.exports = function(quickconnect, createSignaller, opts) {
  test('quickconnect:0', function(t) {
    t.plan(1);
    connections[0] = quickconnect(createSignaller(opts), { room: roomId, expectedLocalStreams: 3 });
    connections[0].once('connected', t.pass.bind(t, 'connected'));
  });

  test('quickconnect:1', function(t) {
    t.plan(1);
    connections[1] = quickconnect(createSignaller(opts), { room: roomId, expectedLocalStreams: 1 });
    connections[1].reactive();
    connections[1].once('connected', t.pass.bind(t, 'connected'));
  });

  test('ensure calls do not start', function(t) {
    t.plan(1);
    connections[0].once('call:started', t.fail);
    connections[1].once('call:started', t.fail);

    setTimeout(function() {
      connections[0].removeAllListeners('call:started');
      connections[1].removeAllListeners('call:started');
      t.pass('call:started event did not fire');
    }, 3000);
  });

  test('add a single stream to each connection and call should still not start', function(t) {
    t.plan(1);
    connections[0].once('call:started', t.fail);
    connections[1].once('call:started', t.fail);

    setTimeout(function() {
      connections[0].removeAllListeners('call:started');
      connections[1].removeAllListeners('call:started');
      t.pass('call:started event did not fire');
    }, 3000);

    connections[0].addStream(ac.createMediaStreamDestination().stream);
    connections[1].addStream(ac.createMediaStreamDestination().stream);
  });

  test('add additional streams to the connection:0 and call:started should trigger', function(t) {
    var expected = connections.length;
    var timer;

    t.plan(1);

    function handleCallStarted(id) {
      if (--expected <= 0) {
        t.pass('done');
        clearTimeout(timer);
      }
    }

    connections[0].once('call:started', handleCallStarted);
    connections[1].once('call:started', handleCallStarted);

    connections[0].addStream(ac.createMediaStreamDestination().stream);
    connections[0].addStream(ac.createMediaStreamDestination().stream);

    timer = setTimeout(t.fail.bind(t, 'call:started not triggered'), 10000);
  });

  test('cleanup', function(t) {
    t.plan(connections.length);
    connections.splice(0).forEach(function(conn) {
      conn.once('disconnected', t.pass.bind(t, 'disconnected'));
      conn.close();
    });

    dcs = [];
  });
};
