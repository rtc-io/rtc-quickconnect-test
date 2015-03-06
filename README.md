# rtc-quickconnect-test

A self-contained suite of tests that can be used for testing quickconnect
in conjunction with a custom signaller.


[![NPM](https://nodei.co/npm/rtc-quickconnect-test.png)](https://nodei.co/npm/rtc-quickconnect-test/)

[![Build Status](https://img.shields.io/travis/rtc-io/rtc-quickconnect-test.svg?branch=master)](https://travis-ci.org/rtc-io/rtc-quickconnect-test) [![stable](https://img.shields.io/badge/stability-stable-green.svg)](https://github.com/dominictarr/stability#stable) 
[![Gitter chat](https://badges.gitter.im/rtc-io.png)](https://gitter.im/rtc-io)



## Example Usage

```js
var signaller = require('rtc-pluggable-signaller');
var extend = require('cog/extend');

function createSignaller(opts) {
  return signaller(extend({ signaller: location.origin }, opts));
}

require('rtc-quickconnect-test/')(
  require('rtc-quickconnect'),
  createSignaller,
  {}
);

```

## License(s)

### Apache 2.0

Copyright 2013 - 2015 National ICT Australia Limited (NICTA)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
