import * as t from 'babel-types';
import _ from 'lodash/fp';

import m from './_mapping';
import getPropertyName from './get-property-name';
import setReplaced from './set-replaced';

export default (innermost, args) => {
  const fnName = getPropertyName(innermost);

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
    _.map(index => ({ index, argIndex: _.indexOf(index)(fnRearg) })),
    _.reduce(
      (updated, { index, argIndex }) => {
        const currentArg = args[argIndex];
        if (index === fnRearg.length - 1 && t.isIdentifier(currentArg) && currentArg.name === '_') {
          return updated;
        } else {
          return setReplaced(t.callExpression(updated, _.compact([currentArg])));
        }
      }
    )(innermost)
  )(_.range(0, fnRearg.length));
};