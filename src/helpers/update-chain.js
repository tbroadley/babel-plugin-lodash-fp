import * as t from 'babel-types';
import _ from 'lodash/fp';

import buildCall from './build-call';
import getPropertyName from './get-property-name';
import setReplaced from './set-replaced';

export default (path) => {
  const { parentPath, node: { arguments: flowArgs }} = path;

  let currentPath = parentPath;
  /*
   * If the chain is of the form `_.chain(a).value()`, we can skip the loop
   * below entirely.
   */
  let loop = getPropertyName(currentPath.node) !== 'value';
  let flowFunctions = [];
  while (loop) {
    const { node } = currentPath;
    const args = currentPath.parentPath.node.arguments;

    flowFunctions.push({
      name: getPropertyName(node),
      args
    });

    /*
     * grandparentPath:      _(a) ... .fn().fn2
     * greatGrandparentPath: _(a) ... .fn()
     */
    const grandparentPath = currentPath.parentPath.parentPath;
    const grandparentNode = grandparentPath.node;
    const greatGrandparentNode = grandparentPath.parentPath.node;
    const expPattern = t.isMemberExpression(grandparentNode) &&
                       t.isCallExpression(greatGrandparentNode);
    loop = expPattern && getPropertyName(grandparentNode) !== 'value';

    if (expPattern) currentPath = grandparentPath;
  }

  let replaceTree;
  if (flowFunctions.length === 0) {
    replaceTree = flowArgs[0];
  } else if (flowFunctions.length === 1) {
    let { name, args } = flowFunctions[0];

    // Replaces a chain of the form `_(a).map(b).value()` with `_.map(b, a)`.
    replaceTree = buildCall(
      t.memberExpression(
        t.identifier('_'),
        t.identifier(name)
      ),
      _.concat(flowArgs, args)
    );
  } else {
    // Replaces the chain with a `_.flow` expression.
    replaceTree = setReplaced(t.callExpression(
      setReplaced(t.callExpression(
        t.memberExpression(t.identifier('_'), t.identifier('flow')),
        _.map(({ name, args }) => buildCall(
          t.memberExpression(
            t.identifier('_'),
            t.identifier(name)
          ),
          _.concat([t.identifier('_')], args)
        ))(flowFunctions)
      )),
      flowArgs
    ));
  }

  currentPath.parentPath.replaceWith(replaceTree);
};
