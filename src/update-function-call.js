import * as t from 'babel-types';
import _ from 'lodash/fp';

import m from './_mapping';
import getPropertyName from './get-property-name';
import setReplaced from './set-replaced';

export default (path) => {
  const { callee, arguments: args } = path.node;
  const fnName = getPropertyName(callee);

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

  path.replaceWith(
    _.flow(
      _.map(_.indexOf(_, fnRearg)),
      _.reduce(
        (updated, index) => setReplaced(
          t.callExpression(updated, _.compact([args[index]]))
        )
      )(callee)
    )(_.range(0, fnRearg.length))
  );
};
