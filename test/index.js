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
    file: 'isolated/fg01-Basic',
    env: DEFINITIONS.envProd
  }, {
    file: 'isolated/fg02-Basic',
    env: DEFINITIONS.envDev
  }, {
    file: 'isolated/fg03-CustomLabel',
    env: DEFINITIONS.envDev,
    options: {
      verbs: {
        myAssertLabel: "_myAssertFunction"
      }
    }
  }, {
    file: 'isolated/fg04-Filter',
    env: DEFINITIONS.envDev,
    options: {
      filter: ['jrambo']
    }
  }, {
    file: 'isolated/fg05-Filter',
    env: DEFINITIONS.envDev
  }, {
    file: 'isolated/fg06-Flag',
    env: DEFINITIONS.envDev,
    options: {
      conditional: "_dbg_assert"
    }
  }, {
    file: 'isolated/fg07-Position',
    env: DEFINITIONS.envDev,
    options: {
      position: true
    }
  }, {
    file: 'isolated/fg08-Block',
    env: DEFINITIONS.envDev,
    fail: true
  }, {
    file: 'mixed/fg01-Basic',
    env: DEFINITIONS.envProd
  }, {
    file: 'mixed/fg02-Basic',
    env: DEFINITIONS.envDev
  }, {
    file: 'mixed/fg03-CustomLabel',
    env: DEFINITIONS.envDev,
    options: {
      verbs: {
        myAssertLabel: "_myAssertFunction"
      }
    }
  }, {
    file: 'mixed/fg04-Filter',
    env: DEFINITIONS.envDev,
    options: {
      filter: ['jrambo']
    }
  }, {
    file: 'mixed/fg05-Filter',
    env: DEFINITIONS.envDev
  }, {
    file: 'mixed/fg06-Flag',
    env: DEFINITIONS.envDev,
    options: {
      conditional: "_dbg_assert"
    }
  }, {
    file: 'mixed/fg07-Position',
    env: DEFINITIONS.envDev,
    options: {
      position: true
    }
  }, {
    file: 'mixed/fg08-Mixed',
    env: DEFINITIONS.envDev,
    options: {
      verbs: {
        myAssertLabel: "_myAssert",
        myAssert2: "_myAssert2",
        myAssert3: "_myAssert3"
      },
      conditional: "_dbg_assert",
      filter: ['jrambo', 'jtwo'],
      position: true
    }
  // }, {
  //   file: 'mixed/fg09-ScopeName',
  //   env: DEFINITIONS.envDev,
  //   options: {
  //     scopeNamed: true
  //   }
  }];


describe('Fragments', function () {
  fragments.forEach(function (fragment) {
      if (fragment.fail) {
        failWithException(plugin, fragment);
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

/**
 * @desc Tries to transpile the code capturing an expected exception.
 * @param {object} plugin The plugin object.
 * @param {object} fragment A fragment object.
 */
function failWithException(plugin, fragment) {
  it(`fragment '${fragment.file}' should fail with an exception`, function (done) {

    let fail = false;
    try {
      transpileFragment(plugin, fragment);
    } catch (error) {
      if (error instanceof SyntaxError) {
        fail = true;
      } else {
        throw error;
      }
    }

    assert.equal(fail, true);

    done();
  });
}