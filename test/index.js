import { transform } from 'babel-core';
import { expect } from 'chai';

function plugin(str) {
  return transform(str, { plugins: ['./src/index'] }).code;
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

    it('does not modify a function with no argument reordering', test(
      '_.toPairs({ a: 1 });',
      '_.toPairs({ a: 1 });'
    ));
  });

  describe('chaining', () => {
    it('transforms a simple chain', test(
      '_.chain(a).map(b).value();',
      '_.map(b, a);'
    ));

    it('transforms an implicit chain', test(
      '_(a).map(b).value();',
      '_.map(b, a);'
    ));

    it('transforms a no-op simple chain', test(
      '_.chain(a).value();',
      'a;'
    ));

    it('transforms a no-op implicit chain', test(
      '_(a).value();',
      'a;'
    ));

    it('transforms a multi-method chain', test(
      '_(a).filter(b).map("prop").value();',
      '_.flow(_.filter(b), _.map("prop"))(a);'
    ));

    it('transforms a chain with implicit return', test(
      '_(a).join();',
      '_.join(undefined, a);'
    ));

    it('transforms a chain with implicit return and methods after', test(
      '_(a).split().map(b).join().map(c);',
      '_.flow(_.split(), _.map(b), _.join(), _.map(c))(a);'
    ));

    it('transforms a chain that uses a function with multiple arguments', test(
      '_(a).xorBy(b, c).value();',
      '_.xorBy(c, a, b);'
    ));

    it('transforms a chain with a function with no argument reordering', test(
      '_(a).toPairs();',
      '_.toPairs(a);'
    ));
  });

  describe('arrow function partials', () => {
    it('transforms an arrow function partial with one parameter', test(
      'a => _.map(a, f);',
      '_.map(f);'
    ));

    it('transforms an arrow function partial with two parameters', test(
      '(a, f) => _.map(f, a);',
      '_.map;'
    ));

    it('transforms an arrow function partial that uses chaining', test(
      'a => _.chain(a).map(f).value();',
      '_.map(f);'
    ));

    it('transforms an arrow function partial that uses implicit chaining', test(
      'a => _(a).map(f).value();',
      '_.map(f);'
    ));

    it('transforms an arrow function partial that uses chaining with multiple methods', test(
      'a => _(a).map(f).filter(g).value();',
      '_.flow(_.map(f), _.filter(g));'
    ));

    it('uses placeholders correctly when transforming arrow functions', test(
      'f => _.map([1, 2, 3], f);',
      'f => _.map(f, [1, 2, 3]);'
    ));

    it('does not transform an arrow function that cannot be transformed', test(
      '(a, f) => _.map(a, f);',
      '(a, f) => _.map(f, a);'
    ));

    it('transforms an arrow function with just a return statement', test(
      'a => { return _.map(a, f); }',
      '_.map(f);'
    ));
  });

  describe('anonymous function partials', () => {
    it('transforms an anonymous function partial with one parameter', test(
      '(function (a) { return _.map(a, f); })(b);',
      '_.map(f)(b);'
    ));

    it('transforms an anonymous function partial with two parameters', test(
      '(function (f, a) { return _.map(a, f); })(g, b);',
      '_.map(g, b);'
    ));

    it('transforms an anonymous function partial that uses chaining', test(
      '(function (a) { return _.chain(a).map(f).value(); })(b);',
      '_.map(f)(b);'
    ));

    it('transforms an anonymous function partial that uses implicit chaining', test(
      '(function (a) { return _(a).map(f).value(); })(b);',
      '_.map(f)(b);'
    ));

    it('transforms an anonymous function partial that uses chaining with multiple methods', test(
      '(function (a) { return _(a).map(f).filter(g).value(); })(b);',
      '_.flow(_.map(f), _.filter(g))(b);'
    ));

    it('does not transform an anonymous function that cannot be transformed', test(
      '(function (a, f) { return _.map(a, f); })(c, d);',
      '(function (a, f) {\n  return _.map(f, a);\n})(c, d);'
    ));
  });
});
