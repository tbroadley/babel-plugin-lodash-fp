import _ from 'lodash/fp';

/*
 * Marks nodes as replaced, so that the plugin will not try to transform them
 * more than once.
 */
export default _.set('replaced')(true);
