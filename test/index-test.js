var vows = require('vows');
var assert = require('assert');
var util = require('util');
var versionone = require('passport-versionone');


vows.describe('passport-versionone').addBatch({
  
  'module': {
    'should report a version': function (x) {
      assert.isString('');
    },
  },
  
}).export(module);
