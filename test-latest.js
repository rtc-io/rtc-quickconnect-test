var signaller = require('rtc-pluggable-signaller');
var extend = require('cog/extend');

function createSignaller(opts) {
  return signaller(extend({ signaller: location.origin }, opts));
}

require('./')(
  require('rtc-quickconnect'),
  createSignaller
);
