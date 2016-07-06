import * as t from 'babel-types';
import _ from 'lodash/fp';

import buildCurriedCall from './build-curried-call';

export default (path) => {
  const { callee, arguments: args } = path.node;
  path.replaceWith(buildCurriedCall(callee, args));
};
