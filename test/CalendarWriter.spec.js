"use strict";
var CalendarWriter = require('./../lib/utility/calendarWriter.js');

var assert = require('assert');

var fragments = {
    "1": "BEGIN:VCALENDAR\r\n" +
    "END:VCALENDAR\r\n",
    "2": "BEGIN:VCALENDAR\r\n" +
    "VERSION:2.0\r\n" +
    "END:VCALENDAR\r\n",
    "3": "BEGIN:VCALENDAR\r\n" +
    "BEGIN:VALARM\r\n" +
    "TRIGGER:-PT15M\r\n" +
    "END:VALARM\r\n" +
    "END:VCALENDAR\r\n",
    "4": "BEGIN:VCALENDAR\r\n" +
    "ATTENDEE;RSVP=TRUE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN=Desiree Cash:MAILTO:Donec@quispede.net\r\n" +
    "END:VCALENDAR\r\n"
}

describe('CalendarWriter test', function () {

    describe('Test basic APIs', function () {
        var writer = CalendarWriter();
        afterEach(function(){
            writer.initialize();
        })
        it('Flat tags test', function () {
            //var writer = new CalendarWriter();
            writer.beginTag("VCALENDAR");
            writer.endTag();
            assert.equal(writer.serialize(), fragments["1"])
        });

        it('Add tag test', function () {
            //var writer = new CalendarWriter();
            writer.beginTag("VCALENDAR");
                writer.addTag("VERSION", "2.0");
            writer.endTag();
            assert.equal(writer.serialize(), fragments["2"])
        });

        it('Add nested tag test', function () {
            //var writer = new CalendarWriter();
            writer.beginTag("VCALENDAR");
                writer.beginTag("VALARM");
                  writer.addTag('TRIGGER','-PT15M');          //TRIGGER:-PT15M
                writer.endTag();
            writer.endTag();
            assert.equal(writer.serialize(), fragments["3"])
        });
        //ATTENDEE;RSVP=TRUE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN=Desiree Cash:MAILTO:Donec@quispede.net
        it('tag properties test', function () {
            //var writer = new CalendarWriter();
            writer.beginTag("VCALENDAR");
            var properties = {
                'RSVP': 'TRUE',
                'ROLE': 'REQ-PARTICIPANT',
                'PARTSTAT': 'NEEDS-ACTION',
                'CN': 'Desiree Cash:MAILTO:Donec@quispede.net'
            }
            writer.addTag('ATTENDEE',null,properties );          //TRIGGER:-PT15M

            writer.endTag();
            assert.equal(writer.serialize(), fragments["4"])
        });

    });
});
