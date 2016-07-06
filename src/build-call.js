import * as t from 'babel-types';
import _ from 'lodash/fp';

import m from './_mapping';
import getPropertyName from './get-property-name';
import setReplaced from './set-replaced';

export default (fn, args) => {
  const fnName = getPropertyName(fn);

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

  return setReplaced(t.callExpression(
    fn,
    _.flow(
      _.map(index => args[_.indexOf(index)(fnRearg)]),
      _.thru(lst => _.last(lst).name === '_' ? _.initial(lst) : lst),
      _.compact
    )(_.range(0, fnRearg.length))
  ));
};
