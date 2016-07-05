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

    it('properly modifies 2-ary methods whose argument order does not change', test(
      '_.subtract(5, 3);',
      '_.subtract(5)(3);'
    ));

    it('properly modifies simple 3-ary methods', test(
      '_.clamp(n, 0, 10);',
      '_.clamp(0)(10)(n);'
    ));

    it('properly modifies 3-ary methods with custom argument reordering', test(
      '_.xorBy([1, 2], [1, 3], _.identity);',
      '_.xorBy(_.identity)([1, 2])([1, 3]);'
    ));
  });
});
