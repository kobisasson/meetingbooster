module.exports = function () {

    var fs = require('fs');
    var templateFolder = './';
    var templateKey = 'template';

    var config = {
        templateBody: templateFolder + templateKey + '.content.txt',
        templateSubject: templateFolder + templateKey + '.subject.txt',
        inputCSV: templateFolder + 'users.csv',
        userConfig: templateFolder + 'config.json',
        'defaultSettings': {
            //uid: 9873647,
            offset: new Date().getTimezoneOffset(),
            method: 'request',
            status: 'confirmed',
            start: '2016-01-03T09:00:00+02:00',
            end: '2016-01-03T09:30:00+02:00',
            timezone: 'UTC +2',
            reminder: '-PT15M',
            location: 'XXX',
            organizer: {
                name: 'XXX',
                email: 'xxx@xxx.com'
            }
        }

    };

    return config;
};


