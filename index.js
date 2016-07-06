import * as t from 'babel-types';

import updateFunctionCall from './src/update-function-call';
import updateChain from './src/update-chain';

import getPropertyName from './src/get-property-name';
import buildCall from './src/build-call';
import buildPartial from './src/build-partial';

export default () => ({
  visitor: {
    ArrowFunctionExpression: {
      exit(path) {
        const { expression, params, body } = path.node;
        if (!expression) return;

        path.replaceWith(buildPartial(body, params));
      }
    },
    FunctionExpression: {
      exit(path) {
        const { params, body: { body: fnStatements } } = path.node;
        if (fnStatements.length !== 1) return;

        const returnStatement = fnStatements[0];
        if (!t.isReturnStatement(returnStatement)) return;

        const { argument } = returnStatement;
        if (!argument) return;

        path.replaceWith(buildPartial(argument, params));
      }
    },
    CallExpression(path) {
      const { replaced, callee } = path.node;
      if (replaced) return;

      if (t.isIdentifier(callee) && callee.name === '_') {
        updateChain(path);
      } else if (t.isMemberExpression(callee)) {
        const { object } = callee;
        if (!t.isIdentifier(object) || object.name !== '_') return;

        getPropertyName(callee) === 'chain' ? updateChain(path) : updateFunctionCall(path);
      }
    }
  }
});
