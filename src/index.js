import * as t from 'babel-types';

import updateChain from './helpers/update-chain';
import updateFunctionCall from './helpers/update-function-call';
import updatePartial from './helpers/update-partial';

import getPropertyName from './helpers/get-property-name';
import buildCall from './helpers/build-call';

export default () => ({
  visitor: {
    ArrowFunctionExpression: {
      exit(path) {
        const { expression, params, body } = path.node;
        if (expression) {
          updatePartial(path, body, params);
        } else if (body.body.length === 1 && t.isReturnStatement(body.body[0])) {
          const { argument } = body.body[0];
          if (!argument) return;

          updatePartial(path, argument, params)
        }
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
