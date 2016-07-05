import m from './src/_mapping';
import * as t from 'babel-types';
import _ from 'lodash/fp';

function updateFunctionCall(fnName, callee, args) {
  let fnArity;
  _.flow(
    _.map(_.toString),
    _.forEach(arity => {
      if (_.includes(fnName)(m.aryMethod[arity])) fnArity = arity;
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

  return _.flow(
    _.map(_.indexOf(_, fnRearg)),
    _.reduce(
      (updated, index) => _.set('replaced')(true)(
        t.callExpression(updated, _.compact([args[index]]))
      )
    )(callee)
  )(_.range(0, fnRearg.length));
}

function updateChain(path) {
  return path;
}

export default () => ({
  visitor: {
    CallExpression(path) {
      const { replaced, callee, arguments: args } = path.node;
      if (replaced) return;

      if (t.isIdentifier(callee) && callee.name === '_') {
        path.replaceWith(updateChain(path));
      } else if (t.isMemberExpression(callee)) {
        const { object, property, computed } = callee;
        if (!t.isIdentifier(object) || object.name !== '_') return;

        let fnName;
        if (computed) {
          if (!t.isStringLiteral(property)) return;
          fnName = property.value;
        } else {
          fnName = property.name;
        }

        path.replaceWith(
          fnName === 'chain' ?
          updateChain(path) :
          updateFunctionCall(fnName, callee, args)
        );
      }
    }
  }
});
