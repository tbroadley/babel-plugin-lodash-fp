import * as t from 'babel-types';
import _ from 'lodash/fp';

import updateFunctionCall from './src/update-function-call';
import updateChain from './src/update-chain';

import getPropertyName from './src/get-property-name';
import buildCall from './src/build-call';

export default () => ({
  visitor: {
    ArrowFunctionExpression: {
      exit(path) {
        const { expression, params, body } = path.node;
        if (!expression || !t.isCallExpression(body)) return;

        const { callee, arguments: args } = body;
        if (!t.isMemberExpression(callee)) return;

        const { object } = callee;
        if (!t.isIdentifier(object) || !t.name === '_') return;

        path.replaceWith(buildCall(callee, _.flow(
          _.reverse,
          _.zip(_, params),
          _.dropWhile(element => element[0] && element[1] && element[0].name === element[1].name),
          _.map(_.first),
          _.reverse
        )(args)));
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
