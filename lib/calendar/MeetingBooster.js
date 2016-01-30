'use strict';
const Transform = require('stream').Transform;
const util = require('util');
const CalendarEvent = require('./calendarEvent');
const Promise = require('bluebird'); // jshint ignore:line
const fs = require('fs');
const R = require('ramda');

Promise.promisifyAll(fs); // jshint ignore:line

util.inherits(MeetingBooster, Transform);

function MeetingBooster(userConfig) {
    Transform.call(this, {'objectMode': true});
    const log = function (x) {
        console.log(x);
        return x;
    };
    const stringFormat = R.curry(function (str, placeholder) {
        const args = [].slice.call(arguments, 1);
        let i = 0;

        return str.replace(/%s/g, function () {
            return args[i++];
        });
    });

    const encodeFileName = function (fileName) {
        return fileName ? fileName.replace(/[<>\:\?\\\/"\*]/g, '-') : 'file';
    };
    const fileFormat = stringFormat('%s-%s.ics');

    const getConfig = R.once(function (fileName) {
        return require(fileName)();
    });

    //+ getDefaultSettings:: fileName -> json(defaultSettings)
    const getDefaultSettings = R.pipe(getConfig, R.prop('defaultSettings'));

    //+ getUserSpecificSettings:: user -> json
    const getUserSpecificSettings = function (user) {
        return {
            offset: new Date().getTimezoneOffset(),
            summary: user.mailSubject,
            html: user.mailBody,
            attendees: [
                {
                    name: user.firstName + ' ' + user.lastName,
                    email: user.email
                }]
        };
    };


    //+ mergeEmailProps:: ( configSettings , user) -> map
    const mergeEmailProps = R.curry(function (configSettings, user) {
        return R.mergeAll([
            getDefaultSettings('./config'),
            configSettings,
            getUserSpecificSettings(user)]);
    });

    //+ initializeWithUser:: user -> json
    const initializeWithUser = mergeEmailProps(userConfig);

    //+ createMeetingRequest:: (settings, user) -> String
    const createEvent = (settings) => (new CalendarEvent(settings)).serialize();

    //+ composeFileName:: (firstName,lastName) -> String
    this.composeFileName = R.pipe(fileFormat, encodeFileName);
    //+ createEventFromUser:: user -> String
    this.createEventFromUser = R.pipe(initializeWithUser, createEvent);
    //+ writeFile:: (file,fileName) -> void
    this.writeFile =  (file, fileName) => fs.writeFileAsync(fileName, file);
}


MeetingBooster.prototype._transform = function (user, encoding, processed) {
    try {
        const file = this.createEventFromUser(user);
        const fileName = this.composeFileName(R.trim(user.firstName), R.trim(user.lastName));
        this.writeFile(file, fileName);
        this.push(user);
        processed();
    } catch (err) {
        console.log('An error occured during creation of a meeting request');
    }

};

module.exports = MeetingBooster;
