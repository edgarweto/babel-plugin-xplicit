'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var DEFAULT_OPTIONS = {
  verbs: {
    assert: 'console.assert'
  },
  globalScopeName: 'global'
};

/**
 * @desc
 */
var pluginState = {
  count: function count() {
    if (!this._count) {
      this._count = 1;
    }
    return this._count++;
  },
  resetState: function resetState() {
    this._count = 1;
  }
};

var _toExpression = function _toExpression(node) {
  var expr = node.expression || node;

  // For sequence expression, capture only first one
  if (node.type === 'SequenceExpression') {
    console.log('SequenceExpression!!', node);
    return node.expressions[0];
  }
  return expr;
};

var plugin = function plugin(_ref) {
  var t = _ref.types;


  var generateCode = function generateCode(path, node, scope, opts) {
    var nodeType = node.type,
        visitor = assertBodyVisitor[nodeType];
    if (visitor) {
      return visitor(path, node, scope, opts);
    } else {
      throw path.buildCodeFrameError('Not implemented ' + nodeType + ' inside trace');
    }
  };

  var assertBodyVisitor = {

    ExpressionStatement: function ExpressionStatement(path, node, scope, opts) {
      if (opts.genAssert) {
        var scopeName = scope.scopeName,
            msg = "[" + pluginState.count() + "]" + (scopeName ? " " + scopeName : "") + ": ";

        var withMessage = false;
        var params = [];

        if (withMessage) {
          params = [node.expression, t.stringLiteral(msg)];
        } else {
          params = [node.expression];
        }
        return t.expressionStatement(t.callExpression(t.identifier(opts.asserterFn), params));
      } else {
        return node.expression;
      }
    },

    /* NO: remove block statement support */
    BlockStatement: function BlockStatement(path, node, scope, opts) {
      var scopeName = scope.scopeName;

      var statements = [];
      node.body.forEach(function (stmt) {

        if (opts.genAssert) {
          var msg = "[" + pluginState.count() + "]" + (scopeName ? " " + scopeName : "") + ": ";

          statements.push(t.expressionStatement(t.callExpression(t.identifier(opts.asserterFn), [t.stringLiteral(msg), _toExpression(generateCode(path, stmt, scope, {
            genAssert: false,
            asserterFn: opts.asserterFn
          }))])));
        } else {
          statements.push(_toExpression(generateCode(path, stmt, scope, opts)));
        }
      });
      return statements;
    },

    EmptyStatement: function EmptyStatement(path, node, scope, opts) {
      return [];
    }
  };

  function _validateOptions(path, options) {
    var valid = true,
        reason = "";

    if (!valid) {
      throw path.buildCodeFrameError('Invalid plugin params: ' + reason);
    }
  }

  function _extractParams(path) {
    var lblBodyType = path.node.body.type,
        lblBodyExpression = path.node.body.expression;

    if (lblBodyExpression && lblBodyExpression.type === 'SequenceExpression') {
      var params = Array.isArray(lblBodyExpression.expressions) && lblBodyExpression.expressions.length ? lblBodyExpression.expressions[1] : null;

      if (params && params.type === 'ObjectExpression') {
        var properties = params.properties;

        if (Array.isArray(properties)) {
          var parameters = {};
          properties.forEach(function (prop) {
            parameters[prop.key.name] = prop.value.value;
          });
          return parameters;
        }
      }
    }
    return null;
  }

  // Return the plugin object
  return {
    visitor: {
      LabeledStatement: function LabeledStatement(path, state) {
        var options = state.opts,
            labelName = path.node.label.name;

        _validateOptions(path, options);

        var asserter = options.verbs && options.verbs[labelName] || DEFAULT_OPTIONS.verbs[labelName];

        // console.log("-------------");
        // console.log("[LabeledStatement] options:", options);
        // console.log("[LabeledStatement] labelName:", labelName);
        // console.log("[LabeledStatement] asserter:", asserter);
        // console.log("-------------");


        if (asserter) {
          if (options.strip) {
            path.remove();
          } else {

            // Strip of assertions can happen independently, so first check for removal
            var removed = false;
            if (Array.isArray(options.filter)) {
              var params = _extractParams(path);
              var shouldRemove = false;

              if (!params || !params.filter || !options.filter.includes(params.filter)) {
                path.remove();
                removed = true;
              }
            }

            if (!removed) {
              // 1. Process message: function's name, line and column.
              var parentFn = path.getFunctionParent(),
                  globalScopeName = state.opts.globalScopeName || DEFAULT_OPTIONS.globalScopeName,
                  fnName = parentFn && parentFn.node.id && parentFn.node.id.name || false;

              var scopeName = parentFn && parentFn.node.id && parentFn.node.id.name || globalScopeName;

              // If  there is no function name, try to check if we are inside class member functions
              if (!fnName) {
                var classMethod = path.findParent(function (classMethod) {
                  return classMethod.isClassMethod();
                });
                scopeName = classMethod ? classMethod.node.key.name : scopeName;

                var classDef = path.findParent(function (classMethod) {
                  return classMethod.isClassDeclaration();
                });
                if (classDef) {
                  var classname = classDef.node.id.name;
                  scopeName = classname + '::' + scopeName;
                }
              }

              // 2. Process the body
              var assertCode = generateCode(path, path.node.body, {
                scopeName: scopeName
              }, {
                genAssert: true,
                asserterFn: asserter
              });

              if (Array.isArray(assertCode)) {
                path.replaceWithMultiple(assertCode);
              } else {
                path.replaceWith(assertCode);
              }
            }
          }
        }
      }
    }
  };
};

plugin.resetState = function () {
  pluginState.resetState();
};

exports.default = plugin;