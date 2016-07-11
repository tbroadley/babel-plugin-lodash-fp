import * as t from 'babel-types';
import _ from 'lodash/fp';

import getPropertyName from './get-property-name';
import m from './_mapping';
import setReplaced from './set-replaced';

export default (fn, args) => {
  const fnName = getPropertyName(fn);

  let fnArity = _.flow(
    _.map(_.flow(
      _.toString,
      _.get(_, m.aryMethod),
      _.includes(fnName))
    ),
    _.findIndex(_.identity),
    _.add(1)
  )(_.range(1, 5));

  let fnRearg;
  if (fnArity === 0) {
    fnRearg = _.range(0, args.length);
  } else if (fnArity === 1) {
    fnRearg = [0];
  } else if (m.skipRearg[fnName]) {
    fnRearg = _.flow(_.toNumber, _.range(0))(fnArity);
  } else {
    fnRearg = m.methodRearg[fnName] || m.aryRearg[fnArity];
  }

  const augmentedArgs = _.concat(
    args, _.times(
      () => t.identifier('undefined'),
      fnRearg.length - args.length
    )
  );

  const newArgs = _.flow(
    _.map(index => augmentedArgs[_.indexOf(index)(fnRearg)]),
    _.dropRightWhile(_.flow(_.get('name'), _.isEqual('_')))
  )(_.range(0, fnRearg.length));

  if (_.isEmpty(newArgs)) {
    return fn;
  } else {
    return setReplaced(t.callExpression(fn,
      _.dropRightWhile(_.flow(_.get('name'), _.isEqual('undefined')))(newArgs)
    ));
  }
};
