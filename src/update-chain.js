import _ from 'lodash/fp';
import * as t from 'babel-types';

import getPropertyName from './get-property-name';
import setReplaced from './set-replaced';

export default (path) => {
  const { parentPath, node: { arguments: flowArgs }} = path;

  let currentPath = parentPath;
  if (getPropertyName(currentPath.node) === 'value') {
    currentPath.parentPath.replaceWith(_.first(flowArgs));
    return;
  }

  let loop = true;
  let flowFunctions = [];
  while (loop) {
    const { node, parentPath: { node: { arguments: args } } } = currentPath;

    flowFunctions.push({
      name: getPropertyName(node),
      args
    });

    const grandparentPath = currentPath.parentPath.parentPath;
    const { grandparentNode } = grandparentPath;
    const { greatGrandparentNode } = grandparentPath.parentPath;
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
