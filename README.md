# README #


Summary
------------
This CLI enable to create meeting requests on the fly.


Installation
------------

To use with node:

```bash
$ npm install -g meetingbooster
```


Configuration
------------
In order to excute meetingbooster, create a new folder with the following files:
**config.json**, e.g.:
```javascript
{
  "start": "2016-02-01T09:00:00+02:00",
  "end": "2016-02-01T09:30:00+02:00",
  "location": "@Office",
  "categories": "Green",
  "reminder": "-PT15M",
  "organizer": {
    "name": "Perry",
    "email": "dolor@dolorsitamet.ca"
  }
}
```
**users.csv**, e.g.: 
```csv
id,firstName,lastName,email,comments
1,Boris,Guzman,pellentesque.a.facilisis@vitaedolorDonec.org,None
```
**template.content.txt**, e.g.( can accept also html content):
```txt
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{firstName}}</title>
</head>
<body style="font-family:Calibri,sans-serif;" >
Hi {{firstName}} <br/>
let's meet to discuss ... <br/>
Thanks, <br/>
Perry.
</body>
</html>
```
Please note, you can use handlebar notation {{...}} , for: {{firstName}},{{lastName}},{{comments}},{{id}},{{email}}.
**template.subject.txt**, e.g.:
```txt
{{firstName}} - Perry , 1 on 1  Meeting
```
Please note, you can use handlebar notation {{...}} , for: {{firstName}},{{lastName}},{{comments}},{{id}},{{email}}.

Once the folder is ready, run the below command in the specified folder:
```bash
$ meetingbooster
```

Running The Test Suite
----------------------

**Console:**

To run the test suite from the console, you need to have `mocha` installed:
```bash
$ npm install -g mocha
```
Then from the root of the project, you can just call
```bash
$ mocha
```
Alternately, if you've installed the dependencies, via:
```bash
$ npm install
```
then you can run the tests (and get detailed output) by running:
```bash
$ gulp test
```