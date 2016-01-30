'use strict';


/*************************************
 *
 *************************************/

const contracts = function (){
    const getObjectName = Function.prototype.call.bind({}.toString);

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

    const createObject = function(o){
        obj(o);
        return Object.create(Object.getPrototypeOf(obj));
    };

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
            var result = createObject(o);
            for (let i in o) {  // jshint ignore:line
                result[i] = c(o[i]);
            }
            return result;
        };
    };


    return {
        'any': any,
        // 5 basic javascript types.
        'string': str,
        'number': num,
        'boolean': bool,
        'function': func,
        'date': date,
        // the 5 basics yet optional.
        'stringOrNil': strOrNil,
        'numberOrNil': numOrNil,
        'booleanOrNil': boolOrNil,
        'functionOrNil': funcOrNil,
        'objectOrNil': objOrNil,
        // specialized  types
        'array': arr,
        'object': obj,
        'integer32':int32,
        'undefined': undef,
        'int32Positive':int32Positive,
        'int32Negative':int32Negative,
        'arrayOf': arrOf,
        'objectOf':objOf,
        'typeOf': typeOf,
        'instanceOf':instanceOf,

    };

};

module.exports = contracts();


