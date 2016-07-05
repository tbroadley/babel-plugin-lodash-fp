import { transform } from 'babel-core';
import { expect } from 'chai';

function plugin(str) {
  return transform(str, { plugins: ['./index'] }).code;
}

function test(toTest, expected) {
  return () => expect(plugin(toTest)).to.equal(expected);
}

describe('babel-plugin-lodash-fp', () => {
  describe('method transformation', () => {
    it('does not modify 1-ary methods', test(
      '_.words("a string");',
      '_.words("a string");'
    ));

    it('properly modifies simple 2-ary methods', test(
      '_.pick([1, 2, 3], _.even);',
      '_.pick(_.even)([1, 2, 3]);'
    ));
  });
});
