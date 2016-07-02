import { transform } from 'babel-core';
import { expect } from 'chai';

function plugin(str) {
  return transform(str, { plugins: ['./index'] }).code;
}

function test(toTest, expected) {
  return () => expect(plugin(toTest)).to.equal(expected);
}

describe('babel-plugin-lodash-fp', () => {
  it('reverses an identifier', test(
    'var asdf;',
    'var fdsa;'
  ));
});
