var test = require('tape');

module.exports = function(connections, remoteIds) {
  test('get connection remote ids', function(t) {
    t.plan(2);

    connections.forEach(function(conn, index) {
      var id = remoteIds[index ^ 1] = conn.peers.keys()[0];
      if (id) {
        t.pass('have remote id');
      }
      else {
        conn.once('peer:announce', function(data) {
          t.ok(remoteIds[index ^ 1] = data && data.id, 'got remote id');
        });
      }
    });
  });
};
