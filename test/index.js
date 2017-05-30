const DEFINITIONS = {
  envProd: 'prod',
  envDev: 'dev'
};


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


/**
 * @desc List of fragments to be tested.
 */
const fragments = [{
    file: 'fgGlobals01',
    env: DEFINITIONS.envProd
  }, {
    file: 'fgGlobals02',
    env: DEFINITIONS.envDev
  }];


describe('Fragments', function () {
  fragments.forEach(function (fragment) {
      if (fragment.fail) {
      } else {
        it(`'test fragment '${fragment.file}'`, function (done) {
          const transpiled = transpileFragment(plugin, fragment),
            fgExpected = `fragments/${fragment.file}Expected.js`,
            expected = fs.readFileSync(path.join(__dirname, fgExpected)).toString();
          assert.equal(uniformifyJs(transpiled.code), uniformifyJs(expected));
          done();
        });
      }
  });
});


function transpileFragment(plugin, fragment) {
  plugin.resetState();

  const fragmentFile = `test/fragments/${fragment.file}.js`,
    pluginOptions = {
      strip: fragment.env === DEFINITIONS.envProd ? true : false
    };

  Object.assign(pluginOptions, fragment.options);

  return transformFileSync(fragmentFile, {
    plugins: [[plugin, pluginOptions]],
    babelrc: false
  });
}

/**
 * @desc Transform javascript text code in order to ease comparisons.
 * @param {string} code Javascript text from fixtures or transpilations.
 * @return {string} non-valid js code, suitable for comparisons.
 */
function uniformifyJs(code) {
  return code.replace(/(\r\n|\n|\r|\s+)/gm, "");
}