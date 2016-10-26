import * as t from 'babel-types';

// Determines if an expression is a lodash function call or a lodash chain.
export default (node) => {
  const { object } = node;
  if (t.isIdentifier(object)) {
    return object.name === '_';
  } else if (t.isCallExpression(node)) {
    /*
     * Backtrack through the chained function calls to determine if the first
     * function called was a property of _.
     */
    while (!t.isIdentifier(node)) {
      node = node.callee;
      if (t.isMemberExpression(node)) node = node.object;
    }
    return node.name === '_';
  }
};
