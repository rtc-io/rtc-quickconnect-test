var detect = require('rtc-core/detect');

module.exports = function(quickconnect, createSignaller, opts) {
  require('./profile')(quickconnect, createSignaller, opts);
  require('./datachannel')(quickconnect, createSignaller, opts);
  require('./request-stream')(quickconnect, createSignaller, opts);
  require('./bus-events')(quickconnect, createSignaller, opts);
  require('./wait-for-streams-single')(quickconnect, createSignaller, opts);
  require('./multiparty')(quickconnect, createSignaller, opts);
  require('./schemes')(quickconnect, createSignaller, opts);
  require('./unexpected-disconnect')(quickconnect, createSignaller, opts);

  if (! detect.moz) {
    // https://bugzilla.mozilla.org/show_bug.cgi?id=852665
    require('./reconnect')(quickconnect, createSignaller, opts);

    // https://bugzilla.mozilla.org/show_bug.cgi?id=857115
    require('./reactive')(quickconnect, createSignaller, opts);
    require('./reactive-stream-events')(quickconnect, createSignaller, opts);

    // https://bugzilla.mozilla.org/show_bug.cgi?id=784517
    require('./wait-for-streams-multiple')(quickconnect, createSignaller, opts);

    // multiparty reactive
    require('./multiparty-reactive')(quickconnect, createSignaller, opts);
  }
};
