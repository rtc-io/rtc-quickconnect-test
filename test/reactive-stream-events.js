var test = require('tape');
var MediaStream = require('rtc-core/detect')('MediaStream');
var ac = require('./helpers/audiocontext');
var localStream;

module.exports = function(quickconnect, createSignaller, opts) {
  var remoteIds = [];
  var connect = require('./helpers/connect-reactive')(quickconnect, createSignaller, opts, remoteIds);
  var connections = connect(test, '(reactive) stream:added tests');

  test('broadcast stream from 0 --> 1', function(t) {
    t.plan(3);
    connections[1].once('stream:added', function(id, stream, data) {
      t.equal(id, remoteIds[0], 'id matched expected');
      t.ok(stream instanceof MediaStream, 'got stream');
      t.ok(data, 'got data');
    });

    connections[0].addStream(localStream = ac.createMediaStreamDestination().stream);
  });

  test('connection:0 removeStream', function(t) {
    t.plan(2);
    connections[1].once('stream:removed', function(id, stream) {
      t.equal(id, remoteIds[0], 'id matched expected');
      t.ok(stream instanceof MediaStream, 'got stream');
    });

    connections[0].removeStream(localStream);
  });

  test('broadcast stream from 1 --> 0', function(t) {
    t.plan(3);
    connections[0].once('stream:added', function(id, stream, data) {
      t.equal(id, remoteIds[1], 'id matched expected');
      t.ok(stream instanceof MediaStream, 'got stream');
      t.ok(data, 'got data');
    });

    connections[1].addStream(localStream);
  });

  test('stream:removed triggered when connection:1 leaves', function(t) {
    t.plan(2);

    connections[0].once('stream:removed', function(id, stream) {
      t.equal(id, remoteIds[1], 'id matched expected');
      t.ok(stream instanceof MediaStream, 'got stream');
    });

    connections[1].close();
  });
};


