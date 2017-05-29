'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var DEFAULT_OPTIONS = {
  verbs: {
    assert: 'console.assert'
  }
};

var plugin = function plugin(_ref) {
  var t = _ref.types;

  return {
    visitor: {
      LabelStatement: function LabelStatement(path, state) {
        var options = state.opts;
        var labelName = path.node.label.name,
            asserter = options[labelName] || DEFAULT_OPTIONS[labelName];

        if (asserter) {
          if (options.strip) {
            path.remove();
          }
        }
      }
    }
  };
};

exports.default = plugin;