import * as t from 'babel-types';
import _ from 'lodash/fp';

import buildCall from './build-call';

export default (path) => {
  const { callee, arguments: args } = path.node;
  path.replaceWith(buildCall(callee, args));
};
