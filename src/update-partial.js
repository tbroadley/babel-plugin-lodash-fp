import * as t from 'babel-types';
import _ from 'lodash/fp';

import buildCall from './build-call';
import isLodashCall from './is-lodash-call';

export default (path, returnNode, params) => {
  if (!t.isCallExpression(returnNode)) return;

  const { callee, arguments: args } = returnNode;
  if (isLodashCall(callee)) {
    const partialArgs = _.flow(
      _.reverse,
      _.zip(_, params),
      _.dropWhile(([arg, param]) => arg && param && arg.name === param.name),
      _.map(_.first),
      _.reverse
    )(args);

    if (_.isEmpty(partialArgs)) {
      path.replaceWith(callee);
    } else if (partialArgs.length !== args.length) {
      path.replaceWith(buildCall(callee, partialArgs));
    }
  }
};
