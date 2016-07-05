import m from './src/_mapping';
import _ from 'lodash/fp';

export default ({ types: t }) => ({
  visitor: {
    CallExpression(path) {
      if (path.node.replaced) return;

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

      let fnRearg;
      if (fnArity === '1') {
        fnRearg = [0];
      } else if (m.skipRearg[fnName]) {
        fnRearg = _.flow(_.toNumber, _.range(0))(fnArity);
      } else {
        fnRearg = m.methodRearg[fnName] || m.aryRearg[fnArity];
      }

      const invertedRearg = _.map(
        index => _.indexOf(index)(fnRearg)
      )(_.range(0, fnRearg.length));

      const args = path.node.arguments;
      let updated;
      _.forEach(index => {
        updated = t.callExpression(
          updated || callee,
          args[index] ? [args[index]] : []
        );
        updated.replaced = true;
      })(invertedRearg);
      path.replaceWith(updated);
    }
  }
});
