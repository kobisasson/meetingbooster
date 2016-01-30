'use strict';

var R = require('ramda');
var util = require('util');
var abstractWriter = require('./abstractWriter.js');
var AV = require('./aspectValidator.js');

var  calendarWriter = function (){
    const atom = abstractWriter();
    const NEW_LINE = '\r\n';
    const TAG_SEPERATOR = ':';
    const PROP_SEPERATOR = ';';
    const trimPropSeperator = R.replace(/(;\r\n)$/,'\r\n');

    const tags = function (tag) {
        /*jshint maxcomplexity:false */
        switch (tag) {
            case 'VCALENDAR':
            case 'VERSION':
            case 'PRODID':
            case 'VEVENT':
            case 'UID':
            case 'DTSTAMP':
            case 'METHOD':
            case 'STATUS':
            case 'DTSTART':
            case 'DTEND':
            case 'SUMMARY':
            case 'X-ALT-DESC':
            case 'DESCRIPTION':
            case 'ORGANIZER':
            case 'LOCATION':
            case 'CATEGORIES':
            case 'ATTENDEE':
            case 'TRIGGER':
            case 'ACTION':
            case 'VALARM':
                 return tag;
            default:
                throw new TypeError('Invalid tag: ' + tag);


        }
    };

    const formatProperties = (str, pair) => {
        const key = pair[0], value = pair[1];
        if (R.type(value) === 'Array') {
            if (value.length === 1) {
                return str += key + '=' + value[0] + PROP_SEPERATOR;

            } else if (value.length === 2) {
                return str += key + '=' + value[0] + TAG_SEPERATOR + value[1] + PROP_SEPERATOR;

            } else if (value.length === 3) {
                return str += key + '=' + value[0] + TAG_SEPERATOR + value[1] +
                    TAG_SEPERATOR + value[2] +PROP_SEPERATOR;
            }
            else {
                throw new Error('Format Properties: wrong number of properties array.');
            }
        }
        else {
            return str += key + '=' + value + PROP_SEPERATOR;
        }

    };
    const serielizeProperties = R.curry(function (props) {
        const serialize = R.reduce(formatProperties, '');
        return  serialize(R.toPairs(props)) + NEW_LINE;
    });

    const log = function(){
        console.log(R.slice(0,Infinity,arguments));

    };

    const validate = AV.aspect(atom,()=>{} ,()=>{} );


    atom.beginTag = validate(tags ,AV.obj)(function (name) {
        const head = 'BEGIN:' + name + NEW_LINE;
        const tail = 'END:' + name  + NEW_LINE;
        atom.beginNode(head, tail);
        return atom;
    });

    atom.endTag = validate(AV.obj)(function () {
        atom.endNode();
        return atom;
    });

    atom.addTag = validate(tags ,AV.strOrNil,AV.objOrNil,AV.obj)(function (name, value, props) {
        const val = (value) ? TAG_SEPERATOR + (value || '') : '';
        const head = name + val + PROP_SEPERATOR ;
        const propsStr = trimPropSeperator( head + serielizeProperties(props));
        atom.addLine( propsStr);
        return atom;
    });
    return atom;
};

module.exports = calendarWriter;