"use strict";
var assert = require('assert');
var shell = require('shelljs');
var P = require('./../lib/utility/aspectValidator');
var C = require('./../lib/utility/contracts.js')
var R = require('ramda');

describe('Aspect Validator  test', function () {


    describe('Basic APIs', function () {

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
            const funcValidator = P.aspect(this, before, after, C.integer32, C.string);
            const func = funcValidator((y) => y + '');
            assert.deepEqual(func(3), "3");
            assert.deepEqual(func(33), "33");
            assert.throws(()=> func("33"));
        });

    });
});
