import * as t from 'babel-types';

/* Returns the property name of an expression like:
 *   a.name => "name"
 *   a["name"] => "name"
 */
export default (node) => {
  t.assertMemberExpression(node);

  const { property, computed } = node;
  if (computed) {
    t.assertStringLiteral(property);
    return property.value;
  } else {
    return property.name;
  }
};
