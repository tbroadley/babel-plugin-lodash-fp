import { transform } from 'babel-core';
import { expect } from 'chai';

describe('babel-plugin-lodash-fp', () => {
  it('reverses an identifier', () => {
    expect(
      transform('var asdf;', { plugins: ['./index.js'] }).code
    ).to.equal('var fdsa;');
  });
});
