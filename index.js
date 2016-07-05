import m from './src/_mapping';
import * as t from 'babel-types';
import _ from 'lodash/fp';

function modifyFunctionCall(path, fnName) {
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

  const callee = path.node.callee;
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

function modifyChain(path) {

}

export default () => ({
  visitor: {
    CallExpression(path) {
      const node = path.node;
      if (node.replaced) return;

      const callee = node.callee;
      if (t.isIdentifier(callee) && callee.name === '_') {
        modifyChain(path);
      } else if (t.isMemberExpression(callee)) {
        const { object, property } = callee;
        if (!t.isIdentifier(object) || object.name !== '_') return;

        let fnName;
        if (callee.computed) {
          if (!t.isStringLiteral(property)) return;
          fnName = property.value;
        } else {
          fnName = property.name;
        }

        fnName === 'chain' ? modifyChain(path) : modifyFunctionCall(path, fnName);
      }
    }
  }
});
