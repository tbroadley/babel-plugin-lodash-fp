import * as t from 'babel-types';

export default (node) => {
  const { object } = node;
  if (t.isIdentifier(object)) {
    return object.name === '_';
  } else if (t.isCallExpression(node)) {
    while (!t.isIdentifier(node)) {
      node = node.callee;
      if (t.isMemberExpression(node)) node = node.object;
    }
    return node.name === '_';
  }
};
