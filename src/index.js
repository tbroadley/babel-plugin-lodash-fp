import * as t from 'babel-types';

import updateFunctionCall from './update-function-call';
import updateChain from './update-chain';

import getPropertyName from './get-property-name';
import buildCall from './build-call';
import updatePartial from './update-partial';

export default () => ({
  visitor: {
    ArrowFunctionExpression: {
      exit(path) {
        const { expression, params, body } = path.node;
        if (!expression) return;

        updatePartial(path, body, params);
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

        updatePartial(path, argument, params);
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
