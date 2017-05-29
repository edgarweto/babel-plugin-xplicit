const DEFAULT_OPTIONS = {
  verbs: {
    assert: 'console.assert'
  }
};

const plugin = function ({types: t}) {
  return {
    visitor: {
      LabelStatement(path, state) {
        const options = state.opts;
        const labelName = path.node.label.name,
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


export default plugin;
