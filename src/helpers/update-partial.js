import * as t from 'babel-types';
import _ from 'lodash/fp';

import buildCall from './build-call';
import isLodashCall from './is-lodash-call';

export default (path, returnNode, params) => {
  if (!t.isCallExpression(returnNode)) return;

  const { callee, arguments: args } = returnNode;
  if (isLodashCall(callee)) {
    /*
     * Drop arguments to the lodash function while they are in the same order
     * as arguments to the anonymous function.
     */
    const partialArgs = _.flow(
      _.reverse,
      _.zip(_, _.reverse(params)),
      _.dropWhile(([arg, param]) => arg && param && arg.name === param.name),
      _.map(_.first),
      _.reverse
    )(args);

    /*
     * If no arguments remain, we can simply replace the expression with the
     * lodash function. Otherwise, we need to reorder the remaining arguments.
     */
    if (_.isEmpty(partialArgs)) {
      path.replaceWith(callee);
    } else if (partialArgs.length !== args.length) {
      path.replaceWith(buildCall(callee, _.concat(t.identifier('undefined'), partialArgs)));
    }
  }
};
