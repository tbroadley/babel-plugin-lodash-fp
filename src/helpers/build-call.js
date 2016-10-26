import * as t from 'babel-types';
import _ from 'lodash/fp';

import getPropertyName from './get-property-name';
import m from './_mapping';
import setReplaced from './set-replaced';

export default (fn, args) => {
  const fnName = getPropertyName(fn);

  // Look up the arity of the given function.
  let fnArity = _.flow(
    _.map(
      _.flow(
        _.toString,
        _.get(_, m.aryMethod),
        _.includes(fnName)
      )
    ),
    _.findIndex(_.identity),
    _.add(1)
  )(_.range(1, 5));

  /*
   * fnRearg is a permutation of [1..fnArity] that describes how the arguments
   * of the function are reordered when translating from lodash to lodash/fp.
   */
  let fnRearg;
  if (fnArity === 0) {
    fnRearg = _.range(0, args.length);
  } else if (fnArity === 1) {
    fnRearg = [0];
  } else if (m.skipRearg[fnName]) {
    fnRearg = _.range(0, fnArity);
  } else {
    fnRearg = m.methodRearg[fnName] || m.aryRearg[fnArity];
  }

  /*
   * If this is a partial function application, the arguments that were not
   * passed are marked with undefined.
   */
  const augmentedArgs = _.concat(
    args, _.times(
      () => t.identifier('undefined'),
      fnRearg.length - args.length
    )
  );

  // Reorder the arguments and drop placeholders from the right end.
  const newArgs = _.flow(
    _.map(index => augmentedArgs[_.indexOf(index)(fnRearg)]),
    _.dropRightWhile(_.flow(_.get('name'), _.isEqual('_')))
  )(_.range(0, fnRearg.length));

  if (_.isEmpty(newArgs)) {
    return fn;
  } else {
    return setReplaced(
      t.callExpression(
        fn,
        _.dropRightWhile(_.flow(_.get('name'), _.isEqual('undefined')))(newArgs)
      )
    );
  }
};
