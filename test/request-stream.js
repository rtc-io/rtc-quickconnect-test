var test = require('tape');
var connections = [];
var MediaStream = require('rtc-core/detect')('MediaStream');
var ac = require('./helpers/audiocontext');

module.exports = function(quickconnect, createSignaller, opts) {
  var connect = require('./helpers/connect')(quickconnect, createSignaller, opts);

  test('initialize connections', function(t) {
    connections = connect(t.test.bind(t), 'stream:added tests', {
      prep0: function(subtest, conn) {
        subtest.plan(1);
        // conn.flag('OfferToReceiveVideo', false);
        conn.addStream(ac.createMediaStreamDestination().stream);
        subtest.pass('added stream to connection:0');
      },

      prep1: function(subtest, conn) {
        subtest.plan(1);
        // conn.flag('OfferToReceiveVideo', false);
        conn.addStream(ac.createMediaStreamDestination().stream);
        subtest.pass('added stream to connection:1');
      }
    });
  });

  test('connection:0 requestStream', function(t) {
    t.plan(2);
    connections[0].requestStream(connections[1].id, 0, function(err, stream) {
      t.ifError(err, 'no error');
      t.ok(stream instanceof MediaStream, 'got stream');
    });
  });

  test('connection:1 requestStream', function(t) {
    t.plan(2);
    connections[1].requestStream(connections[0].id, 0, function(err, stream) {
      t.ifError(err, 'no error');
      t.ok(stream instanceof MediaStream, 'got stream');
    });
  });
};
