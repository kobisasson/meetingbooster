'use strict';
var R = require('ramda');
var C = require('./contracts');

/*************************************
 *
*************************************/

const aspectValidator = function (){

    const slice =  Function.prototype.call.bind([].slice);

    const arity = function (n, fn) {
        /*jshint maxcomplexity:false */
        switch (n) {
            case 0: return function() { return fn.apply(this, arguments); };
            case 1: return function(a0) { return fn.apply(this, arguments); };
            case 2: return function(a0, a1) { return fn.apply(this, arguments); };
            case 3: return function(a0, a1, a2) { return fn.apply(this, arguments); };
            case 4: return function(a0, a1, a2, a3) { return fn.apply(this, arguments); };
            case 5: return function(a0, a1, a2, a3, a4) { return fn.apply(this, arguments); };
            case 6: return function(a0, a1, a2, a3, a4, a5) { return fn.apply(this, arguments); };
            case 7: return function(a0, a1, a2, a3, a4, a5, a6) { return fn.apply(this, arguments); };
            case 8: return function(a0, a1, a2, a3, a4, a5, a6, a7) { return fn.apply(this, arguments); };
            case 9: return function(a0, a1, a2, a3, a4, a5, a6, a7, a8) { return fn.apply(this, arguments); };
            case 10: return function(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) { return fn.apply(this, arguments); };
            default: throw new Error('First argument must be between 0 to 10');
        }
    };


    const weakProdn = function (cs) {
        C.arrayOf(C.function)(cs);
        var len = cs.length;
        return function (args) {
            C.array(args);
            if (args.length > len) {
                throw new TypeError('Expected ' + len + ' arguments');
            }
            var result = [];
            for (var i = 0; i < len; ++i) {
                result[i] = cs[i](args[i]);
            }
            return result;
        };
    };

                           /*context,before,after input1, ..., inputn, output */
    const aspect = R.curry( function aspect(context, before, after, __placeholder ) {
        var args = slice(arguments);
        var nargs = arguments.length;
        context = args[0] || {} ;
        before = C.function(args[1]);
        after = C.function(args[2]);
        var beforeValiadator = weakProdn(C.arrayOf(C.function)(slice(args, 3, nargs - 1)));
        var afterValidator = C.function(args[nargs - 1]);
        var result = function (middle) {
            var result = arity(nargs - 4,function () {
                const beforeFn = before.bind(context);
                const afterFn = after.bind(context);
                let args = slice(arguments);
                args = beforeFn.apply(context,args) || args;
                let output = middle.apply(this,
                    beforeValiadator(args));
                output = afterFn(output) || output;
                return afterValidator(output);
            });
            result.toString = (function (str) {
                return function () { return str + '/* guarded */'; };
            })('' + middle);
            return result;
        };

        return result;
    });

    return {
        aspect:aspect
    };

};

module.exports = aspectValidator();


