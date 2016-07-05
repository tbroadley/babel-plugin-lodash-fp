import * as t from 'babel-types';

import updateFunctionCall from './src/update-function-call';
import updateChain from './src/update-chain';

import getPropertyName from './src/get-property-name';

export default () => ({
  visitor: {
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
