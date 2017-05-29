const assert = require('chai').assert,
  transformFileSync = require('babel-core').transformFileSync,
  fs = require('fs'),
  path = require('path'),
  plugin = require('../lib/index.js').default;


describe('Plugin definition', function () {
  it('Should be a plugin', function () {
    assert.typeOf(plugin, 'function');
  });
});
