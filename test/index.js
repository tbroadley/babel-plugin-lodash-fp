import { transform } from 'babel-core';
import { expect } from 'chai';

function plugin(str) {
  return transform(str, { plugins: ['./index'] }).code;
}

describe('babel-plugin-lodash-fp', () => {
  it('reverses an identifier', () => {
    expect(plugin('var asdf;')).to.equal('var fdsa;');
  });
});
