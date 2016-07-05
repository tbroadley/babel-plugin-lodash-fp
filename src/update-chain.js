import _ from 'lodash/fp';
import * as t from 'babel-types';

import getPropertyName from './get-property-name';
import setReplaced from './set-replaced';

export default (path) => {
  const { parentPath, node: { arguments: flowArgs }} = path;

  let currentPath = parentPath;
  let loop = getPropertyName(currentPath.node) !== 'value';
  let flowFunctions = [];
  while (loop) {
    const { node } = currentPath;
    const args = currentPath.parentPath.node.arguments;

    flowFunctions.push({
      name: getPropertyName(node),
      args
    });

    const grandparentPath = currentPath.parentPath.parentPath;
    const grandparentNode = grandparentPath.node;
    const greatGrandparentNode = grandparentPath.parentPath.node;
    loop = t.isMemberExpression(grandparentNode) &&
           getPropertyName(grandparentNode) !== 'value' &&
           t.isCallExpression(greatGrandparentNode);

    currentPath = grandparentPath;
  }

  currentPath.parentPath.replaceWith(
    setReplaced(t.callExpression(
      setReplaced(t.callExpression(
        t.memberExpression(t.identifier('_'), t.identifier('flow')),
        _.map(({ name, args }) => setReplaced(t.callExpression(
          t.memberExpression(
            t.identifier('_'),
            t.identifier(name)
          ),
          args
        )))(flowFunctions)
      )),
      flowArgs
    ))
  );
};
