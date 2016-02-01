"use strict";
var fs = require("fs");
var CalendarEvent = require('./../lib/calendar/calendarEvent.js');
const dirname = __dirname +'/../';
var assert = require('assert');
var Promise = require("bluebird");
var shell = require('shelljs');
Promise.promisifyAll(fs);
Promise.promisifyAll(shell);

describe('Calendar.spec test', function () {

    describe('Test basic APIs', function () {
        var icsEvent = null, eventSettings = null;

        before(function () {

            //shell.rm("./test/CalendarTest/Boris-Guzman.ics");
        })
        afterEach(function () {

        })
        it('Calendar command line test', function (done) {
            shell.cd( './test/CalendarTest/');
            shell.execAsync('node app.js')
                .then(function () {
                    shell.cd(dirname);
                    var expected = fs.readFileAsync( "./test/CalendarTest/expected/Boris-Guzman.ics", 'utf-8');
                    var actual = fs.readFileAsync(  "./test/CalendarTest/Boris-Guzman.ics", 'utf-8');
                    Promise.props({
                        expected: expected,
                        actual: actual
                    }).then(function (result) {
                        assert.equal(result.expected, result.actual);
                        done();
                    }).done(null,function (error) {
                        //console.log(error);
                        done(error);
                    });
                }).done (null, function (error) {
                    //console.log(error);
                    done(error);
                });

        });

        after(function () {
            shell.cd(dirname);
            shell.rm( "./test/CalendarTest/Boris-Guzman.ics");
        })
    });
});
