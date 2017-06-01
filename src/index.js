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
  if (node.type === 'SequenceExpression') {
    console.log('SequenceExpression!!', node);
    return node.expressions[0];
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
      if (opts.genAssert) {
        const scopeName = scope.scopeName,
          msg = "[" + pluginState.count() + "]" + (scopeName ? " " + scopeName : "") + ": ";
        
        const withMessage = false;
        let params = [];

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
    BlockStatement: function (path, node, scope, opts) {
      const scopeName = scope.scopeName;
      
      const statements = [];
      node.body.forEach(function (stmt) {

        if (opts.genAssert) {
          let msg = "[" + pluginState.count() + "]" + (scopeName ? " " + scopeName : "") + ": ";

          statements.push(t.expressionStatement(t.callExpression(t.identifier(opts.asserterFn), [
            t.stringLiteral(msg),
            _toExpression(generateCode(path, stmt, scope, {
              genAssert: false,
              asserterFn: opts.asserterFn
            }))
          ])));
        } else {
          statements.push(_toExpression(generateCode(path, stmt, scope, opts)));
        }
      });
      return statements;
    },

    EmptyStatement: function (path, node, scope, opts) {
      return [];
    }
  };

  function _validateOptions(path, options) {
    let valid = true,
      reason = "";



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

        const asserter = (options.verbs && options.verbs[labelName]) || DEFAULT_OPTIONS.verbs[labelName];

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

export default plugin;
