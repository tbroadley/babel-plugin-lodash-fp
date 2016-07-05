import * as t from 'babel-types';

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
