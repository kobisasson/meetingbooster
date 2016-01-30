"use strict";
var assert = require('assert');
var shell = require('shelljs');
var P = require('./../lib/utility/aspectValidator');

var R = require('ramda');

describe('Aspect Validator  test', function () {


    describe('Basic APIs', function () {

        it('prodn  test', function () {
            const int32arr = P.prodn([P.int32, P.str]);

            assert.deepEqual(int32arr([4, "Dean"]), [4, "Dean"]);
            assert.throws(()=> int32arr([4, 5]));


        });
        it('prods  test', function () {
            const int32obj = P.prods({int: P.int32, str: P.str});

            assert.deepEqual(int32obj({int: 4, str: "Dean"}), {int: 4, str: "Dean"});
            assert.throws(()=> int32obj([4, 5]));


        });
        it('coprodn  test', function () {
            const int32arr = P.coprodn([P.int32, P.str]);

            assert.deepEqual(int32arr([0, 5]), [0, 5]);
            assert.deepEqual(int32arr([1, "Dean"]), [1, "Dean"]);
            assert.throws(()=> int32arr([0, "5"]));

        });

        it('coprods  test', function () {
            const int32arr = P.coprods({left: P.int32, right: P.str});
            assert.deepEqual(int32arr(["left", 5]), ["left", 5]);
            assert.deepEqual(int32arr(["right", "Dean"]), ["right", "Dean"]);
            assert.throws(()=> int32arr(["left", "5"]));
        });

        it('aspect  test', function () {
            const log = (x) => console.log("before:", x);
            this.x = "yooo";
            let before = function () {
                this.start = new Date();
                return R.slice(0, Infinity, arguments);
            };
            let after = function (result) {
                assert.equal(this.x, "yooo");
            };
            const funcValidator = P.aspect(this, before, after, P.int32, P.str);
            const func = funcValidator((y) => y + '');
            assert.deepEqual(func(3), "3");
            assert.deepEqual(func(33), "33");
            assert.throws(()=> func("33"));
        });

    });
});
