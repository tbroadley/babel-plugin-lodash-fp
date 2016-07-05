import * as t from 'babel-types';

import updateFunctionCall from './src/update-function-call';

function updateChain(path) {
  return path;
}

export default () => ({
  visitor: {
    CallExpression(path) {
      const { replaced, callee, arguments: args } = path.node;
      if (replaced) return;

      if (t.isIdentifier(callee) && callee.name === '_') {
        path.replaceWith(updateChain(path));
      } else if (t.isMemberExpression(callee)) {
        const { object, property, computed } = callee;
        if (!t.isIdentifier(object) || object.name !== '_') return;

        let fnName;
        if (computed) {
          if (!t.isStringLiteral(property)) return;
          fnName = property.value;
        } else {
          fnName = property.name;
        }

        path.replaceWith(
          fnName === 'chain' ?
          updateChain(path) :
          updateFunctionCall(fnName, callee, args)
        );
      }
    }
  }
});
