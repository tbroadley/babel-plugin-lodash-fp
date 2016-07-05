import m from './src/_mapping';
import _ from 'lodash/fp';

export default ({ types: t }) => ({
  visitor: {
    CallExpression(path) {
      if (!t.isMemberExpression(path.node.callee)) return;

      const callee = path.node.callee;
      if (!t.isIdentifier(callee.object) || callee.object.name !== '_') return;

      const property = callee.property;
      let fnName;
      if (callee.computed) {
        if (!t.isStringLiteral(property)) return;
        fnName = property.value;
      } else {
        fnName = property.name;
      }

      let fnArity;
      _.flow(
        _.map(_.toString),
        _.forEach(arity => {
          const nAryFunctions = m.aryMethod[_.toString(arity)];
          if (_.includes(fnName)(nAryFunctions)) fnArity = arity;
        })
      )(_.range(1, 5));

      switch (fnArity) {
        case '1':
          return;
      }
    }
  }
});
