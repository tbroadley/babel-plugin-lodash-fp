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
      '_.pick(_.even, [1, 2, 3]);'
    ));

    it('properly modifies 2-ary methods whose argument order does not change', test(
      '_.subtract(5, 3);',
      '_.subtract(5, 3);'
    ));

    it('properly modifies simple 3-ary methods', test(
      '_.clamp(n, 0, 10);',
      '_.clamp(0, 10, n);'
    ));

    it('properly modifies 3-ary methods with custom argument reordering', test(
      '_.xorBy([1, 2], [1, 3], _.identity);',
      '_.xorBy(_.identity, [1, 2], [1, 3]);'
    ));

    it('properly modifies simple 4-ary methods', test(
      '_.fill([1, 2, 3], 5, 0, 2);',
      '_.fill(0, 2, 5, [1, 2, 3]);'
    ));

    it('properly modifies 4-ary methods with custom argument reordering', test(
      '_.updateWith(a, b, c, d);',
      '_.updateWith(d, b, c, a);'
    ));
  });

  describe('chaining', () => {
    it('transforms a simple chain', test(
      '_.chain(a).map(b).value();',
      '_.flow(_.map(b))(a);'
    ));

    it('transforms an implicit chain', test(
      '_(a).map(b).value();',
      '_.flow(_.map(b))(a);'
    ));

    it('transforms a no-op simple chain', test(
      '_.chain(a).value();',
      '_.flow()(a);'
    ));

    it('transforms a no-op implicit chain', test(
      '_(a).value();',
      '_.flow()(a);'
    ));

    it('transforms a multi-method chain', test(
      '_(a).filter(b).map("prop").value();',
      '_.flow(_.filter(b), _.map("prop"))(a);'
    ));

    it('transforms a chain with implicit return', test(
      '_(a).join();',
      '_.flow(_.join())(a);'
    ));

    it('transforms a chain with implicit return and methods after', test(
      '_(a).split().map(b).join().map(c);',
      '_.flow(_.split(), _.map(b), _.join(), _.map(c))(a);'
    ));

    it('transforms a chain that uses a function with multiple arguments', test(
      '_(a).xorBy(b, c).value();',
      '_.flow(_.xorBy(c, _, b))(a);'
    ));
  });

  describe('arrow function partials', () => {
    it('transforms an arrow function partial with one parameter', test(
      'a => _.map(a, f);',
      '_.map(f);'
    ));

    it('transforms an arrow function partial with two parameters', test(
      '(a, f) => _.map(a, f);',
      '_.map;'
    ));

    it('transforms an arrow function partial that uses chaining', test(
      'a => _.chain(a).map(f).value();',
      '_.flow(_.map(f));'
    ));

    it('transforms an arrow function partial that uses implicit chaining', test(
      'a => _(a).map(f).value();',
      '_.flow(_.map(f));'
    ));

    it('transforms an arrow function partial that uses chaining with multiple methods', test(
      'a => _(a).map(f).filter(g).value();',
      '_.flow(_.map(f), _.filter(g));'
    ));
  });

  describe('anonymous function partials', () => {
    it('transforms an anonymous function partial with one parameter', test(
      '(function(a) { return _.map(a, f); })(b);',
      '_.map(f)(b);'
    ));
  });
});
