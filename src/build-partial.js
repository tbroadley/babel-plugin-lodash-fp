import * as t from 'babel-types';
import _ from 'lodash/fp';

import buildCall from './build-call';
import isLodashCall from './is-lodash-call';

export default (fnNode, params) => {
  if (!t.isCallExpression(fnNode)) return;

  const { callee, arguments: args } = fnNode;
  if (isLodashCall(callee)) {
    const partialArgs = _.flow(
      _.reverse,
      _.zip(_, params),
      _.dropWhile(([arg, param]) => arg && param && arg.name === param.name),
      _.map(_.first),
      _.reverse
    )(args);

    return _.isEmpty(partialArgs) ? callee : buildCall(callee, partialArgs);
  }
};
