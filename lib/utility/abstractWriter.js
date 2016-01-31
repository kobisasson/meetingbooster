'use strict';
var R = require('ramda');
var AV = require('./aspectValidator.js');
var AB = require('./aspectValidator.js').aspectBuilder;
var C = require('./contracts.js');
// The internal state of the object

const InternalState = {
    currentNode: null,
    root: null
};

var abstractWriter = function () {
    let state = null;
    const atom = {};
    const createNode = function (parent, head, tail) {
        const node = {};
        node.childs = [];
        if (parent) {
            node.parent = parent;
            parent.childs.push(node);
        } else {
            node.parent = null;
        }
        node.head = head || '';
        node.tail = tail || '';
        return node;
    };

    const serializeNode = function (node) {
        const head = node.head || '';
        const tail = node.tail || '';
        let stringify = function (array, item) {
            if (typeof item === 'string') {
                array.push(item);
            } else {
                array.push(serializeNode(item));
            }

            return array;
        };
        const output = R.reduce(stringify, [], node.childs);
        return head + R.join('', output) + tail;
    };
    atom.serielizeProperties = R.curry(function (props) {
        const formatProp = (str,key) => str += key + '=' + props[key] ;
        return R.reduce(formatProp, '', R.keys(props)) ;
    });
    atom.initialize = function () {
        state = Object.create(InternalState);
        return atom;
    };

    atom.beginNode = AB().validate(C.string,C.string ,C.object).for(function (head, tail) {
        const parent = state.currentNode;
        const node = createNode(parent, head, tail);
        state.currentNode = node;
        if (!parent) {
            state.root = node;
        }
        return atom;

    });
    atom.endNode = AB().validate(C.object).for(function () {
        if (!state.currentNode ) {
            throw new Error('Node was closed without a corresponding begin tag');
        } else {
            state.currentNode = state.currentNode.parent;
            return atom;
        }
    });

    atom.addLine = AB().validate(C.string ,C.object).for(function (line) {
        state.currentNode.childs.push(line);
        return atom;
    });

    atom.serialize = AB().validate(C.string).for(function () {
        return serializeNode(state.root);
    });


    atom.initialize();
    return atom;
};


module.exports = abstractWriter;