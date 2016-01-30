'use strict';
const config = require('./config')();
const MeetingBooster = require('./MeetingBooster');
const Promise = require('bluebird'); // jshint ignore:line
const fs = require('fs');
const csv = require('csv-streamify');
const Handlebars = require('handlebars');
const map = require('map-stream');
const vfs = require('vinyl-fs');
const minify = require('html-minifier').minify;
Promise.promisifyAll(fs);


const configFiles = {};
const calendar = function () {
    let atom = {};
    const mapConfigFiles = function (file, cb) {
        const globName = './' + file.basename;
        if (globName === config.templateBody) {
            configFiles[globName] = Handlebars.compile(
                minify(file.contents.toString('utf8'),
                    {collapseWhitespace: true}));
        } else if (globName === config.templateSubject) {
            configFiles[globName] = Handlebars.compile(file.contents.toString('utf8'));
        } else if (globName === config.userConfig) {
            configFiles[globName] = JSON.parse(file.contents.toString('utf8'));
        } else {
            cb('No such Config file');
        }
        cb(null, file);
    };
    const enrichUser = function (user, cb) {
        user['mailSubject'] = configFiles[config.templateSubject](user);
        user['mailBody'] = configFiles[config.templateBody](user);
        cb(null, user);
    };
    atom.run = function () {
        vfs.src([config.templateBody, config.templateSubject, config.userConfig])
            .pipe(map(mapConfigFiles))
            .on('end', function () {
                fs.createReadStream(config.inputCSV)
                    .pipe(csv({objectMode: true, columns: true}))       //=> Parse CSV as Object
                    .pipe(map(enrichUser))                          //=> Enrich users collection
                    .pipe(new MeetingBooster(configFiles[config.userConfig]))//=> for each user create and save an event
                    .on('data', function (user) {                       //=> Do not remove, due to bug not all
                                                                        // records are been streamed
                        //console.log('File saved for user: ' + user.firstName);
                    });// Create the meeting per user
            });
    };
    return atom;
};

module.exports = calendar;
