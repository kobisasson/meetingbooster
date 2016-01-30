'use strict';
var tzone = require('tzone');
var R = require('ramda');
var calendarWriter = require('./../utility/calendarWriter.js');


var calendarEvent = function (settings) {
    let state = null, writer = calendarWriter();
    const atom = {};
    const generateUID = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            /*jslint bitwise: true */
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    const formatDate = function (offset, datetime) {
        let pad = (n) => (n < 10 ? '0' : '') + n;
        let d = new Date(datetime);
        d.setUTCMinutes(d.getUTCMinutes() - offset);
        let padded = (d.getUTCFullYear() +
        pad(d.getUTCMonth() + 1) +
        pad(d.getUTCDate()) + 'T' +
        pad(d.getUTCHours()) +
        pad(d.getUTCMinutes()) +
        pad(d.getUTCSeconds()));
        return padded;
    };
    const capitalizeFirstLetter = function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const serializeAttendee = function (person) {
        //ATTENDEE;RSVP=TRUE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN=Fatima
        // Tillman:MAILTO:Integer.tincidunt@odiotristiquepharetra.com
        writer.addTag('ATTENDEE', null, {
            RSVP: 'TRUE', ROLE: 'REQ-PARTICIPANT', 'PARTSTAT': 'NEEDS-ACTION',
            CN: [person.name, 'MAILTO', person.email]
        });
    };
    const serializeAttendees = function (person) {
        R.forEach(serializeAttendee, atom.get('attendees'));
    };
    const serializeVALARM = function () {

        writer.beginTag('VALARM')                   //BEGIN:VALARM
            .addTag('TRIGGER', atom.get('reminder'))//TRIGGER:-PT15M
            .addTag('ACTION', 'DISPLAY')            //ACTION:DISPLAY
            .addTag('VERSION', '2.0')               //VERSION:2.0
            .addTag('DESCRIPTION', 'Reminder')      //DESCRIPTION:Reminder
            .endTag();                      //END:VALARM
    };
    const serializeVEVENT = function () {
        writer.beginTag('VEVENT')
            .addTag('UID', atom.get('uid'))
            .addTag('DTSTAMP', null, {TZID: [atom.get('timezone'), atom.get('timestamp')]})
            .addTag('METHOD', R.toUpper(atom.get('method')))
            .addTag('STATUS', R.toUpper(atom.get('status')))
            .addTag('DTSTART', null, {TZID: [atom.get('timezone'), atom.get('start')]})
            .addTag('DTEND', null, {TZID: [atom.get('timezone'), atom.get('end')]})
            .addTag('SUMMARY', atom.get('summary'))
            .addTag('X-ALT-DESC', null, {FMTTYPE: ['text/html', atom.get('html')]})
            .addTag('DESCRIPTION', atom.get('description'))//DESCRIPTION:Some text
            //ORGANIZER;CN=Perry:mailto:dolor@dolorsitamet.ca
            .addTag('ORGANIZER', null, {CN: [atom.get('organizer').name, 'MAILTO', atom.get('organizer').email]})
            .addTag('LOCATION', atom.get('location')) //LOCATION:@Office
            .addTag('CATEGORIES', atom.get('categories'));//CATEGORIES:Urgent
        serializeAttendees();
        serializeVALARM();
        writer.endTag();
    };
    const serializeVCALENDAR = function () {
        writer.beginTag('VCALENDAR')
            .addTag('VERSION', '2.0')
            .addTag('PRODID', atom.get('id'));
        serializeVEVENT();
        writer.endTag();
    };
    const getTimeZoneLocation = function (offset, date) {
        const d = new Date(date);
        d.setUTCMinutes(d.getUTCMinutes() - offset);
        return tzone.getLocation(d);
    };
    //+ initialize state
    atom.initialize = function () {
        function InternalState() {
        }
        state = new InternalState();
        atom.set('id', '-//calendarEvent.js v0.0.1//EN');
        if (!atom.get('uid')) {
            atom.set('uid', generateUID());
        }
    };
    //+ override object create method
    atom.create = function (settings) {
        for (var key in settings) {
            if (settings.hasOwnProperty(key)) {
                atom.set(key, settings[key]);
            }
        }
    };
    atom.get = function (key) {
        var getter = 'get' + capitalizeFirstLetter(key);
        if (atom[getter]) {
            return atom[getter]();
        }
        if (state[key]) {
            return state[key];
        }
    };

    atom.set = function (key, value) {
        var setter = 'set' + capitalizeFirstLetter(key);
        if (atom[setter]) {
            atom[setter](value);
        }
        else {
            state[key] = value;
        }
    };


    atom.getStart = function () {
        if (state.startFormatted) {
            return state.startFormatted;
        }
        if (!state.timezone) {
            state.timezone = getTimeZoneLocation(atom.get('offset'), state.start);
        }
        return (state.startFormatted = formatDate(atom.get('offset'), state.start));
    };

    atom.getEnd = function () {
        if (state.endFormatted) {
            return state.endFormatted;
        }
        if (!state.timezone) {
            state.timezone = getTimeZoneLocation(atom.get('offset'), state.start);
        }
        return (state.endFormatted = formatDate(atom.get('offset'), state.end));
    };
    atom.getTimestamp = function () {
        if (state.timestamp)  {
            return formatDate(atom.get('offset'), state.timestamp);
        }
        return formatDate(atom.get('offset'), new Date());
    };
    //+ serialize Calendar event
    atom.serialize = function () {
        writer.initialize();
        serializeVCALENDAR();
        return writer.serialize();
    };
    atom.initialize();
    if (settings) {
        atom.create(settings);
    }

    return atom;
};
module.exports = calendarEvent;