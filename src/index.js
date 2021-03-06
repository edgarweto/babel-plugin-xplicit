const DEFAULT_OPTIONS = {
  verbs: {
    assert: 'console.assert'
  },
  globalScopeName: 'global'
};

/**
 * @desc
 */
const pluginState = {
  count: function () {
    if (!this._count) {
      this._count = 1;
    }
    return this._count++;
  },
  resetState: function () {
    this._count = 1;
  }
};

const _toExpression = function (node) {
  let expr = node.expression || node;

  // For sequence expression, capture only first one
  // Remaining expressions should be a BlockStatement used for options
  if (expr.type === 'SequenceExpression') {
    return expr.expressions[0];
  }
  return expr;
};


const plugin = function ({types: t}) {

  const generateCode = function generateCode(path, node, scope, opts) {    
    const nodeType = node.type,
      visitor = assertBodyVisitor[nodeType];
    if (visitor) {
      return visitor(path, node, scope, opts);
    } else {
      throw path.buildCodeFrameError(`Not implemented ${nodeType} inside trace`);
    }
  };


  const assertBodyVisitor = {

    ExpressionStatement: function (path, node, scope, opts) {

      const expression = _toExpression(node);

      if (opts.genAssert) {
        const scopeName = scope.scopeName,
          msg = "[" + pluginState.count() + "]" + (scopeName ? " " + scopeName : "") + ": ";
        
        const withMessage = false;
        let params = [];



        if (opts.scopeNamed) {
          params = [expression, t.stringLiteral(msg)];
        } else if (opts.options.position) {
          const startLoc = node.loc.start,
            line = startLoc && startLoc.line,
            col = startLoc && startLoc.column;

          let objExpr = t.objectExpression([
            t.objectProperty(t.identifier("line"), t.numericLiteral(line)),
            t.objectProperty(t.identifier("column"), t.numericLiteral(col))
          ]);
          params = [expression, objExpr];
        } else {
          params = [expression];
        }

        const theAssertion = t.callExpression(t.identifier(opts.asserterFn), params);

        // Check if we want a global conditional var to enable/disable assertions at runtime
        if (opts.options && opts.options.conditional) {

          const condIdentifier = t.identifier(opts.options.conditional);
          return t.logicalExpression("&&", condIdentifier, theAssertion);
        } else {
          return t.expressionStatement(theAssertion);
        }
      } else {
        return expression;
      }
    },

    EmptyStatement: function (path, node, scope, opts) {
      return [];
    }
  };

  function _validateOptions(path, options) {
    let valid = true,
      reason = "";

    //TODO

    if (!valid) {
      throw path.buildCodeFrameError(`Invalid plugin params: ${reason}`);
    }
  }

  function _extractParams(path) {
    const lblBodyType = path.node.body.type,
      lblBodyExpression = path.node.body.expression;

    if (lblBodyExpression && lblBodyExpression.type === 'SequenceExpression') {
      const params = Array.isArray(lblBodyExpression.expressions) && lblBodyExpression.expressions.length ? lblBodyExpression.expressions[1] : null;

      if (params && params.type === 'ObjectExpression') {
        const properties = params.properties;

        if (Array.isArray(properties)) {
          let parameters = {};
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
      LabeledStatement(path, state) {
        const options = state.opts,
          labelName = path.node.label.name;

        _validateOptions(path, options);

        // For the assert function, first try with a logger, then with a custom
        // assertion function and finally take the default.
        const asserterFn = options.verbs && options.verbs[labelName],
          asserter = asserterFn || DEFAULT_OPTIONS.verbs[labelName];



        if (asserter) {
          if (options.strip) {
            path.remove();
          } else {

            // Strip of assertions can happen independently, so first check for removal
            let removed = false;
            if (Array.isArray(options.filter)) {
              const params = _extractParams(path);
              let shouldRemove = false;

              if (!params || !params.filter || !options.filter.includes(params.filter)) {
                  path.remove();
                  removed = true;
              }
            }

            if (!removed) {

              // 1. Process message: function's name, line and column.
              const parentFn = path.getFunctionParent(),
                globalScopeName = state.opts.globalScopeName || DEFAULT_OPTIONS.globalScopeName,
                fnName = parentFn && parentFn.node.id && parentFn.node.id.name || false;

              let scopeName = parentFn && parentFn.node.id && parentFn.node.id.name || globalScopeName;

              // If  there is no function name, try to check if we are inside class member functions
              if (!fnName) {
                const classMethod = path.findParent((classMethod) => classMethod.isClassMethod());
                scopeName = classMethod ? classMethod.node.key.name : scopeName;

                const classDef = path.findParent((classMethod) => classMethod.isClassDeclaration());
                if (classDef) {
                  const classname = classDef.node.id.name;
                  scopeName = classname + '::' + scopeName;
                }

              }

              // 2. Process the body
              const assertCode = generateCode(path, path.node.body, {
                scopeName: scopeName
              }, {
                genAssert: true,
                asserterFn: asserter,
                options: options
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

export default plugin;
