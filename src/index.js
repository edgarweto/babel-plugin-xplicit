const DEFAULT_OPTIONS = {
  verbs: {
    assert: 'console.assert'
  },
  globalScopeName: 'global'
};

/**
 * @desc This trace plugin keeps the trace number, which is increased for each
 *  found trace label. We use this object to save its internal, static state.
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
  return node.expression || node;
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


  return {
    visitor: {
      LabeledStatement(path, state) {
        const options = state.opts,
          labelName = path.node.label.name,
          asserter = options[labelName] || DEFAULT_OPTIONS.verbs[labelName];

        if (asserter) {
          if (options.strip) {
            path.remove();
          } else {

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
  };
};

plugin.resetState = function () {
  pluginState.resetState();
};

export default plugin;
