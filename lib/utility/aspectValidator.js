'use strict';
var R = require('ramda');

/*************************************
 *
*************************************/

const P = function (){
    const call = Function.prototype.call;
    const slice = call.bind([].slice);
    const getObjectName = call.bind({}.toString);
    const create = Object.create.bind(Object);
    const gpo = Object.getPrototypeOf.bind(Object);

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

    const typeOf = function (type,predicate ){
        predicate = predicate || (() => false);
        return function(x){
            if( typeof x === type || predicate(x)){
                return x;
            }else{
                throw new TypeError('Expected a '+ type + '.');
            }
        };
    };
    // Creates a contract for an object inheriting from ctor
    var instanceOf = function (ctor) {
        return function (inst) {
            if (!(inst instanceof ctor)) {
                throw new TypeError('Expected an instance of ' + ctor);
            }
            return inst;
        };
    };
    const typeOfInt = function (predicate,domain) {
        domain = strOrNil(domain) || '';
        predicate = predicate || (() => false);
        return function(n) {
            /*jslint bitwise: true */
            if ((n | 0) === n || predicate()) {
                return n;
            }
            throw new TypeError('Expected a 32-bit '+ domain + ' integer.');
        };
    };
    const typeOfObject = function (type){
        return function(x){
            if(getObjectName(x) !== '[object '+type+']'){
                throw new TypeError('Expected an '+type);
            }else {
                return x;
            }
        };
    };
    // List all contracts
    const nil = (x) => x === undefined || x === null;
    const any = (x) => x;
    const str = typeOf('string');
    const num = typeOf('number');
    const bool = typeOf('boolean');
    const undef = typeOf('undefined');
    const obj = typeOf('object');
    const func = typeOf('function');
    const strOrNil = typeOf('string', nil); // jshint ignore:line
    const objOrNil = typeOf('object', nil);
    const numOrNil = typeOf('number', nil);
    const boolOrNil = typeOf('boolean', nil);
    const funcOrNil = typeOf('function', nil);
    const int32 = typeOfInt();
    const int32Positive  = typeOfInt((n) => ( n > 0 ),'positive');
    const int32Negative  = typeOfInt((n) => ( n < 0 ),'negative');
    const arr = typeOfObject('Array');
    const date = typeOfObject('Date');
    const regexp = typeOfObject('RegExp');

    // Creates a contract for an array whose
    // enumerable properties all satisfy the contract c
    const arrOf = function(contract){
        return function(x){
            return arr(x).map(contract);
        };
    };
    // Creates a contract for an object whose
    // enumerable properties all satisfy the contract c
    const objOf = function (c) {
        func(c);
        return function (o) {
            obj(o);
            var result = create(gpo(o));
            for (let i in o) {  // jshint ignore:line
                result[i] = c(o[i]);
            }
            return result;
        };
    };
    // Given an array of contracts, creates a contract for
    // an array whose elements satisfy the respective contracts.
    const prodn = function (cs) {
        arrOf(func)(cs);
        var len = cs.length;
        return function (args) {
            arr(args);
            if (args.length !== len) {
                throw new TypeError('Expected ' + len + ' arguments');
            }
            var result = [];
            for (var i = 0; i < len; ++i) {
                // Apply each contract to the
                // corresponding argument.
                result[i] = cs[i](args[i]);
            }
            return result;
        };
    };

    // Given an array of contracts, creates a contract for
    // an array whose elements satisfy the respective contracts.
    const weakProdn = function (cs) {
        arrOf(func)(cs);
        var len = cs.length;
        return function (args) {
            arr(args);
            if (args.length > len) {
                throw new TypeError('Expected ' + len + ' arguments');
            }
            var result = [];
            for (var i = 0; i < len; ++i) {
                // Apply each contract to the
                // corresponding argument.
                result[i] = cs[i](args[i]);
            }
            return result;
        };
    };

    // Given an object whose enumerable properties are contracts,
    // creates a contract for an object whose enumerable properties
    // satisfy the respective contracts.
    const prods = function (cs) {
        obj(cs);
        for (var i in cs) {// jshint ignore:line
            func(cs[i]);
        }
        return function (x) {
            obj(x);
            var result = {};
            for (var i in cs) {// jshint ignore:line
                result[i] = cs[i](x[i]);
            }
            return result;
        };
    };
    // Given an array of contracts, creates a contract for a
    // 2-element array where item 0 is an index and item 1
    // is a value satisfying the contract at that index
    // in the array
    const coprodn = function (cs) {
        arrOf(func)(cs);
        var len = cs.length;
        return function (choice) {
            arr(choice);
            int32Positive(choice[0]);
            if (choice.length !== 2) {
                throw new TypeError('Expected [int32Positive, any].');
            }
            if (choice[0] >= len ) {
                throw new TypeError('Tag out of range.');
            }
            return [choice[0], cs[choice[0]](choice[1])];
        };
    };

    // Given an object of contracts, creates a contract for a
    // 2-element array where item 0 is a property name and item 1
    // is a value satisfying the contract at that property name
    // in the object
    const coprods = function (intr) {
        objOf(func)(intr);
        return function (choice) {
            arr(choice);
            str(choice[0]);
            if (choice.length !== 2) {
                throw new TypeError('Expected [str, any].');
            }
            if (!intr.hasOwnProperty(choice[0])) {
                throw new TypeError('Unknown tag.');
            }
            return [choice[0], intr[choice[0]](choice[1])];
        };
    };


    // Creates a contract for a function whose inputs and output
    // satisfy the given contracts.
                            /*context,before,after input1, ..., inputn, output */
    const aspect = R.curry( function aspect(context, before, after, placeholder ) {
        var args = slice(arguments);
        var nargs = arguments.length;
        context = args[0] || {} ;
        before = func(args[1]);
        after = func(args[2]);
        var beforeValiadator = weakProdn(arrOf(func)(slice(args, 3, nargs - 1)));
        var afterValidator = func(args[nargs - 1]);
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
        any: any,
        str: str,
        num: num,
        obj: obj,
        undef: undef,
        bool: bool,
        func: func,
        strOrNil: strOrNil,
        numOrNil: numOrNil,
        boolOrNil: boolOrNil,
        funcOrNil: funcOrNil,
        objOrNil: objOrNil,
        arr: arr,
        date: date,
        int32:int32,
        int32Positive:int32Positive,
        int32Negative:int32Negative,
        instanceOf:instanceOf,
        arrOf: arrOf,
        typeOf: typeOf,
        prodn:prodn,
        prods:prods,
        coprodn:coprodn,
        coprods:coprods,
        aspect:aspect
    };

};

module.exports = P(); // jshint ignore:line


