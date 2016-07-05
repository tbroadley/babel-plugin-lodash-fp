import * as t from 'babel-types';
import _ from 'lodash/fp';

import m from './_mapping';

export default (fnName, callee, args) => {
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
};
