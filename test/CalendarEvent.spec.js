"use strict";
var fs = require("fs");
var CalendarEvent = require('./../lib/calendar/calendarEvent.js');
var assert = require('assert');
var Promise = require("bluebird");
Promise.promisifyAll(fs);


describe('CalendarEvent test', function () {

    describe('Test basic APIs', function () {
        var icsEvent = null, eventSettings = null;
        before(function (done) {
            var icsEventP = fs.readFileAsync("./test/inputs/meeting.ics", 'utf-8');
            var eventJson = fs.readFileAsync("./test/inputs/meeting.json", 'utf-8');
            Promise.props({
                event: icsEventP,
                json: eventJson
            }).then(function (result) {
                icsEvent = result.event;
                eventSettings = JSON.parse(result.json);
                done();
            });


        })
        afterEach(function () {
            //writer.initialize();
        })
        it('Flat tags test', function () {
            var writer = new CalendarEvent(eventSettings);
            assert.equal(writer.serialize(), icsEvent);
        });


    });
});
