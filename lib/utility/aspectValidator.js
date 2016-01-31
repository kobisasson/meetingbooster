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


    const weakTraverse = function (cs) {
        C.arrayOf(C.function)(cs);
        var len = cs.length;
        return function (args) {
            C.array(args);
            if (args.length > len) {
                throw new TypeError('Too much arguments, Expected: ' + len + ' Actual: ' + args.length );
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
        before = C.functionOrNil(args[1]);
        after = C.functionOrNil(args[2]);
        var beforeValiadator = weakTraverse(C.arrayOf(C.function)(slice(args, 3, nargs - 1)));
        var afterValidator = C.function(args[nargs - 1]);
        var result = function (middle) {
            var result = arity(nargs - 4,function () {
                const beforeFn = (before && before.bind(context)) || null;
                const afterFn = (after && after.bind(context)) || null;
                let args = slice(arguments);
                args = (beforeFn && beforeFn.apply(context,args) )|| args;
                let output = middle.apply(this,
                    beforeValiadator(args));
                output = (afterFn && afterFn(output)) || output;
                return afterValidator(output);
            });
            result.toString = (function (str) {
                return function () { return str + '/* guarded */'; };
            })('' + middle);
            return result;
        };

        return result;
    });

    const aspectBuilder = function (){
        let atom = {};
        atom.bind = function (context){
            C.object(context);
            atom._context = context;
            return atom;
        };
        atom.before = function (beforeFn){
            C.function(beforeFn);
            atom._before = beforeFn;
            return atom;
        };
        atom.after = function (afterFn){
            C.function(afterFn);
            atom._after = afterFn;
            return atom;
        };
        atom.validate = function(){
            atom._args = slice(arguments);
            return atom;
        };
        atom.for = function(body){
            const asp =  aspect (atom._context,atom._before,atom._after);
            return asp.apply(null,atom._args)(body);

        };
        return atom;
    };

    return {
        'aspectBuilder':aspectBuilder,
        'aspect':aspect
    };

};

module.exports = aspectValidator();


